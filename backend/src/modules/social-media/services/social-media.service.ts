import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SocialPost,
  SocialPostPublication,
  MarketingLink,
  PostStatus,
  PublicationStatus,
} from '../entities';
import {
  CreateSocialPostDto,
  UpdateSocialPostDto,
  GenerateContentDto,
  PublishPostDto,
} from '../dto/social-post.dto';
import { AIContentService } from './ai-content.service';

@Injectable()
export class SocialMediaService {
  private readonly logger = new Logger(SocialMediaService.name);

  constructor(
    @InjectRepository(SocialPost)
    private socialPostRepository: Repository<SocialPost>,
    @InjectRepository(SocialPostPublication)
    private publicationRepository: Repository<SocialPostPublication>,
    @InjectRepository(MarketingLink)
    private marketingLinkRepository: Repository<MarketingLink>,
    private aiContentService: AIContentService,
  ) {}

  /**
   * Create a new social media post (draft)
   */
  async createPost(
    restaurantId: string,
    userId: string,
    dto: CreateSocialPostDto,
  ): Promise<SocialPost> {
    this.logger.log(`Creating post for restaurant ${restaurantId}`);

    const post = this.socialPostRepository.create({
      restaurantId,
      createdBy: userId,
      title: dto.title,
      description: dto.description,
      mediaUrls: dto.mediaUrls || [],
      mediaTypes: dto.mediaTypes || [],
      promptContext: dto.promptContext || {},
      platforms: dto.platforms || [],
      status: PostStatus.DRAFT,
    });

    const savedPost = await this.socialPostRepository.save(post);
    this.logger.log(`Post created with ID: ${savedPost.id}`);

    return savedPost;
  }

  /**
   * Get all posts for a restaurant
   */
  async getPosts(
    restaurantId: string,
    status?: PostStatus,
    limit = 20,
    offset = 0,
  ): Promise<{ posts: SocialPost[]; total: number }> {
    const query = this.socialPostRepository
      .createQueryBuilder('post')
      .where('post.restaurantId = :restaurantId', { restaurantId })
      .leftJoinAndSelect('post.publications', 'publications')
      .leftJoinAndSelect('post.marketingLink', 'marketingLink')
      .orderBy('post.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    if (status) {
      query.andWhere('post.status = :status', { status });
    }

    const [posts, total] = await query.getManyAndCount();

    return { posts, total };
  }

  /**
   * Get a single post by ID
   */
  async getPost(restaurantId: string, postId: string): Promise<SocialPost> {
    const post = await this.socialPostRepository.findOne({
      where: { id: postId, restaurantId },
      relations: ['publications', 'marketingLink'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    return post;
  }

  /**
   * Update post
   */
  async updatePost(
    restaurantId: string,
    postId: string,
    dto: UpdateSocialPostDto,
  ): Promise<SocialPost> {
    const post = await this.getPost(restaurantId, postId);

    Object.assign(post, {
      title: dto.title ?? post.title,
      description: dto.description ?? post.description,
      mediaUrls: dto.mediaUrls ?? post.mediaUrls,
      selectedCaption: dto.selectedCaption ?? post.selectedCaption,
      selectedHashtags: dto.selectedHashtags ?? post.selectedHashtags,
      selectedCta: dto.selectedCta ?? post.selectedCta,
      platforms: dto.platforms ?? post.platforms,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : post.scheduledAt,
    });

    const savedPost = await this.socialPostRepository.save(post);
    this.logger.log(`Post ${postId} updated`);

    return savedPost;
  }

  /**
   * Generate AI content for post
   */
  async generateContent(
    restaurantId: string,
    postId: string,
    dto: GenerateContentDto,
  ): Promise<SocialPost> {
    const post = await this.getPost(restaurantId, postId);

    // Merge prompt context
    const promptContext = {
      ...post.promptContext,
      ...(dto.promptContext || {}),
    };

    // Get restaurant info for better context
    // TODO: Fetch restaurant name and style from database
    const restaurantName = 'Restaurant Name'; // Placeholder
    const restaurantStyle = 'casual'; // Placeholder

    // Generate content with AI
    const platforms = dto.platforms || post.platforms || ['instagram', 'facebook'];
    const generatedContent = await this.aiContentService.generateContent(
      promptContext,
      restaurantName,
      restaurantStyle,
      platforms,
    );

    // Update post with generated content
    post.aiGenerated = generatedContent;
    post.promptContext = promptContext;

    // Auto-select medium caption if none selected
    if (!post.selectedCaption && generatedContent.captions) {
      post.selectedCaption = generatedContent.captions.medium;
    }

    // Auto-select first 20 hashtags if none selected
    if (post.selectedHashtags.length === 0 && generatedContent.hashtags) {
      post.selectedHashtags = generatedContent.hashtags.slice(0, 20);
    }

    // Auto-select first CTA if none selected
    if (!post.selectedCta && generatedContent.ctas?.length > 0) {
      post.selectedCta = generatedContent.ctas[0];
    }

    const savedPost = await this.socialPostRepository.save(post);
    this.logger.log(`Content generated for post ${postId}`);

    return savedPost;
  }

  /**
   * Publish post to selected platforms
   */
  async publishPost(
    restaurantId: string,
    postId: string,
    dto: PublishPostDto,
  ): Promise<SocialPost> {
    const post = await this.getPost(restaurantId, postId);

    // Validate post has content
    if (!post.selectedCaption) {
      throw new BadRequestException('Post must have a caption before publishing');
    }

    if (post.mediaUrls.length === 0) {
      throw new BadRequestException('Post must have at least one media file');
    }

    // Create marketing link if not exists
    if (!post.marketingLinkId) {
      const link = await this.createMarketingLinkForPost(restaurantId, post);
      post.marketingLinkId = link.id;
    }

    // Update post status
    if (dto.scheduledAt) {
      post.status = PostStatus.SCHEDULED;
      post.scheduledAt = new Date(dto.scheduledAt);
    } else {
      post.status = PostStatus.PUBLISHING;
    }

    await this.socialPostRepository.save(post);

    // Create publication records for each platform
    for (const platform of dto.platforms) {
      await this.createOrUpdatePublication(post.id, platform);
    }

    // If immediate publish, trigger publishing process
    if (!dto.scheduledAt) {
      // TODO: Queue publishing job or call publisher service
      this.logger.log(`Publishing post ${postId} to platforms: ${dto.platforms.join(', ')}`);
      
      // For now, mark as published immediately (mock)
      post.status = PostStatus.PUBLISHED;
      post.publishedAt = new Date();
      await this.socialPostRepository.save(post);
    }

    this.logger.log(`Post ${postId} ${dto.scheduledAt ? 'scheduled' : 'published'}`);
    return post;
  }

  /**
   * Delete post
   */
  async deletePost(restaurantId: string, postId: string): Promise<void> {
    const post = await this.getPost(restaurantId, postId);
    
    post.status = PostStatus.DELETED;
    await this.socialPostRepository.save(post);
    
    this.logger.log(`Post ${postId} deleted`);
  }

  /**
   * Create marketing link for post
   */
  private async createMarketingLinkForPost(
    restaurantId: string,
    post: SocialPost,
  ): Promise<MarketingLink> {
    // Generate unique slug
    const slug = this.generateSlug(post.title);

    const link = this.marketingLinkRepository.create({
      restaurantId,
      socialPostId: post.id,
      slug,
      destinationUrl: `/order/${slug}`, // Placeholder until client side is built
      title: post.title,
      description: post.description,
      utmSource: post.platforms[0] || 'social',
      utmMedium: 'post',
      utmCampaign: post.title.toLowerCase().replace(/\s+/g, '-'),
    });

    const savedLink = await this.marketingLinkRepository.save(link);
    this.logger.log(`Marketing link created: ${savedLink.slug}`);

    return savedLink;
  }

  /**
   * Create or update publication record
   */
  private async createOrUpdatePublication(
    postId: string,
    platform: string,
  ): Promise<SocialPostPublication> {
    let publication = await this.publicationRepository.findOne({
      where: { socialPostId: postId, platform },
    });

    if (!publication) {
      publication = this.publicationRepository.create({
        socialPostId: postId,
        platform,
        status: PublicationStatus.QUEUED,
      });
    } else {
      publication.status = PublicationStatus.QUEUED;
      publication.retryCount = 0;
      publication.errorMessage = null;
    }

    return await this.publicationRepository.save(publication);
  }

  /**
   * Generate URL-friendly slug
   */
  private generateSlug(title: string): string {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);

    // Add random suffix to ensure uniqueness
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${baseSlug}-${randomSuffix}`;
  }

  /**
   * Get post statistics
   */
  async getPostStats(restaurantId: string, postId: string): Promise<any> {
    const post = await this.getPost(restaurantId, postId);

    const publications = await this.publicationRepository.find({
      where: { socialPostId: postId },
    });

    return {
      postId: post.id,
      status: post.status,
      totalReach: post.totalReach,
      totalImpressions: post.totalImpressions,
      totalClicks: post.totalClicks,
      totalOrders: post.totalOrders,
      platforms: publications.map((pub) => ({
        platform: pub.platform,
        status: pub.status,
        externalPostUrl: pub.externalPostUrl,
        likes: pub.likesCount,
        comments: pub.commentsCount,
        shares: pub.sharesCount,
        reach: pub.reach,
        impressions: pub.impressions,
      })),
    };
  }
}
