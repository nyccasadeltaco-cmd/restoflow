import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SocialMediaService } from './services/social-media.service';
import { LinkTrackingService } from './services/link-tracking.service';
import {
  CreateSocialPostDto,
  UpdateSocialPostDto,
  GenerateContentDto,
  PublishPostDto,
} from './dto/social-post.dto';
import {
  CreateMarketingLinkDto,
  TrackLinkEventDto,
} from './dto/marketing-link.dto';
import { PostStatus } from './entities';

// TODO: Import your actual auth guards
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('social-media')
export class SocialMediaController {
  constructor(
    private readonly socialMediaService: SocialMediaService,
    private readonly linkTrackingService: LinkTrackingService,
  ) {}

  // ============================================
  // POSTS ENDPOINTS
  // ============================================

  /**
   * Create a new post (draft)
   * POST /api/social-media/posts
   */
  @Post('posts')
  // @UseGuards(JwtAuthGuard)
  async createPost(@Request() req, @Body() dto: CreateSocialPostDto) {
    // TODO: Get restaurantId from authenticated user's context
    const restaurantId = req.user?.restaurantId || 'mock-restaurant-id';
    const userId = req.user?.userId || 'mock-user-id';

    return await this.socialMediaService.createPost(restaurantId, userId, dto);
  }

  /**
   * Get all posts
   * GET /api/social-media/posts?status=draft&limit=20&offset=0
   */
  @Get('posts')
  // @UseGuards(JwtAuthGuard)
  async getPosts(
    @Request() req,
    @Query('status') status?: PostStatus,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    const restaurantId = req.user?.restaurantId || 'mock-restaurant-id';

    return await this.socialMediaService.getPosts(
      restaurantId,
      status,
      Number(limit),
      Number(offset),
    );
  }

  /**
   * Get a single post
   * GET /api/social-media/posts/:id
   */
  @Get('posts/:id')
  // @UseGuards(JwtAuthGuard)
  async getPost(@Request() req, @Param('id') id: string) {
    const restaurantId = req.user?.restaurantId || 'mock-restaurant-id';
    return await this.socialMediaService.getPost(restaurantId, id);
  }

  /**
   * Update post
   * PATCH /api/social-media/posts/:id
   */
  @Patch('posts/:id')
  // @UseGuards(JwtAuthGuard)
  async updatePost(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateSocialPostDto,
  ) {
    const restaurantId = req.user?.restaurantId || 'mock-restaurant-id';
    return await this.socialMediaService.updatePost(restaurantId, id, dto);
  }

  /**
   * Generate AI content for post
   * POST /api/social-media/posts/:id/generate
   */
  @Post('posts/:id/generate')
  // @UseGuards(JwtAuthGuard)
  async generateContent(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: GenerateContentDto,
  ) {
    const restaurantId = req.user?.restaurantId || 'mock-restaurant-id';
    return await this.socialMediaService.generateContent(restaurantId, id, dto);
  }

  /**
   * Publish post
   * POST /api/social-media/posts/:id/publish
   */
  @Post('posts/:id/publish')
  // @UseGuards(JwtAuthGuard)
  async publishPost(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: PublishPostDto,
  ) {
    const restaurantId = req.user?.restaurantId || 'mock-restaurant-id';
    return await this.socialMediaService.publishPost(restaurantId, id, dto);
  }

  /**
   * Delete post
   * DELETE /api/social-media/posts/:id
   */
  @Delete('posts/:id')
  // @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Request() req, @Param('id') id: string) {
    const restaurantId = req.user?.restaurantId || 'mock-restaurant-id';
    await this.socialMediaService.deletePost(restaurantId, id);
  }

  /**
   * Get post statistics
   * GET /api/social-media/posts/:id/stats
   */
  @Get('posts/:id/stats')
  // @UseGuards(JwtAuthGuard)
  async getPostStats(@Request() req, @Param('id') id: string) {
    const restaurantId = req.user?.restaurantId || 'mock-restaurant-id';
    return await this.socialMediaService.getPostStats(restaurantId, id);
  }

  // ============================================
  // LINKS ENDPOINTS
  // ============================================

  /**
   * Create marketing link
   * POST /api/social-media/links
   */
  @Post('links')
  // @UseGuards(JwtAuthGuard)
  async createLink(@Request() req, @Body() dto: CreateMarketingLinkDto) {
    const restaurantId = req.user?.restaurantId || 'mock-restaurant-id';
    return await this.linkTrackingService.createLink(restaurantId, dto);
  }

  /**
   * Get all links
   * GET /api/social-media/links?socialPostId=xxx
   */
  @Get('links')
  // @UseGuards(JwtAuthGuard)
  async getLinks(
    @Request() req,
    @Query('socialPostId') socialPostId?: string,
  ) {
    const restaurantId = req.user?.restaurantId || 'mock-restaurant-id';
    return await this.linkTrackingService.getLinks(restaurantId, socialPostId);
  }

  /**
   * Get link by slug (public - for redirects)
   * GET /api/social-media/links/slug/:slug
   */
  @Get('links/slug/:slug')
  async getLinkBySlug(@Param('slug') slug: string) {
    return await this.linkTrackingService.getLinkBySlug(slug);
  }

  /**
   * Get link statistics
   * GET /api/social-media/links/:id/stats
   */
  @Get('links/:id/stats')
  // @UseGuards(JwtAuthGuard)
  async getLinkStats(@Param('id') id: string) {
    return await this.linkTrackingService.getLinkStats(id);
  }

  /**
   * Get top performing links
   * GET /api/social-media/links/top?limit=10
   */
  @Get('links/top')
  // @UseGuards(JwtAuthGuard)
  async getTopLinks(@Request() req, @Query('limit') limit = 10) {
    const restaurantId = req.user?.restaurantId || 'mock-restaurant-id';
    return await this.linkTrackingService.getTopLinks(
      restaurantId,
      Number(limit),
    );
  }

  /**
   * Deactivate link
   * DELETE /api/social-media/links/:id
   */
  @Delete('links/:id')
  // @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivateLink(@Param('id') id: string) {
    await this.linkTrackingService.deactivateLink(id);
  }

  // ============================================
  // TRACKING ENDPOINT (PUBLIC - No Auth)
  // ============================================

  /**
   * Track link event (public endpoint)
   * POST /api/social-media/track
   */
  @Post('track')
  @HttpCode(HttpStatus.OK)
  async trackEvent(@Body() dto: TrackLinkEventDto) {
    return await this.linkTrackingService.trackEvent(dto);
  }

  // ============================================
  // CONNECTIONS ENDPOINTS (TODO - Phase 2)
  // ============================================

  /**
   * Get all social connections
   * GET /api/social-media/connections
   */
  @Get('connections')
  // @UseGuards(JwtAuthGuard)
  async getConnections(@Request() req) {
    // TODO: Implement connections service
    return { message: 'Connections endpoint - Coming soon' };
  }

  /**
   * Start OAuth flow for Meta (Facebook/Instagram)
   * GET /api/social-media/connections/meta/authorize
   */
  @Get('connections/meta/authorize')
  // @UseGuards(JwtAuthGuard)
  async authorizeMetaConnection(@Request() req) {
    // TODO: Implement Meta OAuth flow
    return { message: 'Meta OAuth - Coming soon' };
  }

  /**
   * OAuth callback
   * GET /api/social-media/connections/meta/callback
   */
  @Get('connections/meta/callback')
  async metaCallback(@Query('code') code: string, @Query('state') state: string) {
    // TODO: Handle OAuth callback
    return { message: 'Meta OAuth callback - Coming soon' };
  }

  /**
   * Disconnect social account
   * DELETE /api/social-media/connections/:id
   */
  @Delete('connections/:id')
  // @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async disconnectConnection(@Param('id') id: string) {
    // TODO: Implement disconnect
    return;
  }
}
