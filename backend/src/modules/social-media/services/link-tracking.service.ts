import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketingLink, LinkEvent, LinkEventType } from '../entities';
import { CreateMarketingLinkDto, TrackLinkEventDto } from '../dto/marketing-link.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class LinkTrackingService {
  private readonly logger = new Logger(LinkTrackingService.name);

  constructor(
    @InjectRepository(MarketingLink)
    private marketingLinkRepository: Repository<MarketingLink>,
    @InjectRepository(LinkEvent)
    private linkEventRepository: Repository<LinkEvent>,
  ) {}

  /**
   * Create a new marketing link
   */
  async createLink(
    restaurantId: string,
    dto: CreateMarketingLinkDto,
  ): Promise<MarketingLink> {
    this.logger.log(`Creating marketing link for restaurant ${restaurantId}`);

    // Ensure slug is unique
    let slug = dto.slug;
    const existingLink = await this.marketingLinkRepository.findOne({
      where: { slug },
    });

    if (existingLink) {
      // Add random suffix
      slug = `${dto.slug}-${nanoid(6)}`;
    }

    const link = this.marketingLinkRepository.create({
      restaurantId,
      socialPostId: dto.socialPostId,
      slug,
      destinationUrl: dto.destinationUrl,
      title: dto.title,
      description: dto.description,
      utmSource: dto.utmSource,
      utmMedium: dto.utmMedium,
      utmCampaign: dto.utmCampaign,
      utmTerm: dto.utmTerm,
      utmContent: dto.utmContent,
    });

    const savedLink = await this.marketingLinkRepository.save(link);

    // TODO: Generate QR code if requested
    if (dto.generateQR) {
      await this.generateQRCode(savedLink);
    }

    this.logger.log(`Marketing link created: ${savedLink.slug}`);
    return savedLink;
  }

  /**
   * Get link by slug
   */
  async getLinkBySlug(slug: string): Promise<MarketingLink> {
    const link = await this.marketingLinkRepository.findOne({
      where: { slug, isActive: true },
    });

    if (!link) {
      throw new NotFoundException(`Link with slug ${slug} not found`);
    }

    // Check if expired
    if (link.expiresAt && link.expiresAt < new Date()) {
      throw new NotFoundException(`Link ${slug} has expired`);
    }

    return link;
  }

  /**
   * Get all links for a restaurant
   */
  async getLinks(
    restaurantId: string,
    socialPostId?: string,
  ): Promise<MarketingLink[]> {
    const query = this.marketingLinkRepository
      .createQueryBuilder('link')
      .where('link.restaurantId = :restaurantId', { restaurantId })
      .orderBy('link.createdAt', 'DESC');

    if (socialPostId) {
      query.andWhere('link.socialPostId = :socialPostId', { socialPostId });
    }

    return await query.getMany();
  }

  /**
   * Track a link event
   */
  async trackEvent(dto: TrackLinkEventDto): Promise<LinkEvent> {
    this.logger.log(`Tracking ${dto.eventType} event for link ${dto.marketingLinkId}`);

    const event = this.linkEventRepository.create({
      marketingLinkId: dto.marketingLinkId,
      eventType: dto.eventType as LinkEventType,
      sessionId: dto.sessionId,
      userId: dto.userId,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      referrerUrl: dto.referrerUrl,
      referrerPlatform: dto.referrerPlatform,
      metadata: dto.metadata || {},
    });

    const savedEvent = await this.linkEventRepository.save(event);

    // Triggers will auto-increment clicks_count and orders_count
    // via database triggers

    return savedEvent;
  }

  /**
   * Get link statistics
   */
  async getLinkStats(linkId: string): Promise<any> {
    const link = await this.marketingLinkRepository.findOne({
      where: { id: linkId },
    });

    if (!link) {
      throw new NotFoundException(`Link with ID ${linkId} not found`);
    }

    // Get event counts by type
    const eventCounts = await this.linkEventRepository
      .createQueryBuilder('event')
      .select('event.eventType', 'eventType')
      .addSelect('COUNT(*)', 'count')
      .where('event.marketingLinkId = :linkId', { linkId })
      .groupBy('event.eventType')
      .getRawMany();

    // Get unique sessions (unique clicks)
    const uniqueClicks = await this.linkEventRepository
      .createQueryBuilder('event')
      .select('COUNT(DISTINCT event.sessionId)', 'count')
      .where('event.marketingLinkId = :linkId', { linkId })
      .andWhere('event.eventType = :eventType', { eventType: LinkEventType.CLICK })
      .getRawOne();

    // Get recent events
    const recentEvents = await this.linkEventRepository.find({
      where: { marketingLinkId: linkId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    // Calculate conversion rate
    const clicks = link.clicksCount || 0;
    const orders = link.ordersCount || 0;
    const conversionRate = clicks > 0 ? (orders / clicks) * 100 : 0;

    return {
      link: {
        id: link.id,
        slug: link.slug,
        destinationUrl: link.destinationUrl,
        title: link.title,
      },
      stats: {
        totalClicks: link.clicksCount,
        uniqueClicks: parseInt(uniqueClicks?.count || '0'),
        totalOrders: link.ordersCount,
        totalRevenue: parseFloat(link.revenueTotal?.toString() || '0'),
        conversionRate: conversionRate.toFixed(2) + '%',
      },
      eventBreakdown: eventCounts.reduce((acc, item) => {
        acc[item.eventType] = parseInt(item.count);
        return acc;
      }, {}),
      recentEvents: recentEvents.map((e) => ({
        eventType: e.eventType,
        sessionId: e.sessionId,
        deviceType: e.deviceType,
        country: e.country,
        createdAt: e.createdAt,
      })),
    };
  }

  /**
   * Generate QR code for link
   */
  private async generateQRCode(link: MarketingLink): Promise<void> {
    // TODO: Implement QR code generation
    // Use 'qrcode' package and upload to Supabase Storage
    this.logger.log(`QR code generation for link ${link.slug} - TODO`);
  }

  /**
   * Get top performing links
   */
  async getTopLinks(
    restaurantId: string,
    limit = 10,
  ): Promise<MarketingLink[]> {
    return await this.marketingLinkRepository.find({
      where: { restaurantId, isActive: true },
      order: { ordersCount: 'DESC', clicksCount: 'DESC' },
      take: limit,
    });
  }

  /**
   * Deactivate link
   */
  async deactivateLink(linkId: string): Promise<void> {
    const link = await this.marketingLinkRepository.findOne({
      where: { id: linkId },
    });

    if (!link) {
      throw new NotFoundException(`Link with ID ${linkId} not found`);
    }

    link.isActive = false;
    await this.marketingLinkRepository.save(link);

    this.logger.log(`Link ${linkId} deactivated`);
  }
}
