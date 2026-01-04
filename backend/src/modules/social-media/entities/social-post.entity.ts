import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { User } from '../../users/entities/user.entity';
import { MarketingLink } from './marketing-link.entity';
import { SocialPostPublication } from './social-post-publication.entity';

export enum PostStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHING = 'publishing',
  PUBLISHED = 'published',
  FAILED = 'failed',
  DELETED = 'deleted',
}

export interface PromptContext {
  product?: string;
  offer?: string;
  objective?: string;
  tone?: string;
  language?: string;
  ctaType?: string;
  [key: string]: any;
}

export interface AIGeneratedContent {
  captions?: {
    short?: string;
    medium?: string;
    long?: string;
  };
  hashtags?: string[];
  ctas?: string[];
  hooks?: string[];
  variants?: {
    instagram?: any;
    facebook?: any;
    tiktok?: any;
  };
  [key: string]: any;
}

@Entity('social_posts')
export class SocialPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'restaurant_id', type: 'uuid' })
  @Index()
  restaurantId: string;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Media
  @Column({ name: 'media_urls', type: 'text', array: true, default: '{}' })
  mediaUrls: string[];

  @Column({ name: 'media_types', type: 'text', array: true, default: '{}' })
  mediaTypes: string[];

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl?: string;

  // AI Context & Generation
  @Column({ name: 'prompt_context', type: 'jsonb', default: {} })
  promptContext: PromptContext;

  @Column({ name: 'ai_generated', type: 'jsonb', default: {} })
  aiGenerated: AIGeneratedContent;

  // Selected content
  @Column({ name: 'selected_caption', type: 'text', nullable: true })
  selectedCaption?: string;

  @Column({ name: 'selected_hashtags', type: 'text', array: true, default: '{}' })
  selectedHashtags: string[];

  @Column({ name: 'selected_cta', type: 'text', nullable: true })
  selectedCta?: string;

  // Publishing
  @Column({ type: 'text', array: true, default: '{}' })
  platforms: string[];

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.DRAFT,
  })
  @Index()
  status: PostStatus;

  @Column({ name: 'scheduled_at', type: 'timestamptz', nullable: true })
  @Index()
  scheduledAt?: Date;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt?: Date;

  // Tracking
  @Column({ name: 'marketing_link_id', type: 'uuid', nullable: true })
  marketingLinkId?: string;

  @ManyToOne(() => MarketingLink, { nullable: true })
  @JoinColumn({ name: 'marketing_link_id' })
  marketingLink?: MarketingLink;

  @Column({ name: 'total_reach', type: 'int', default: 0 })
  totalReach: number;

  @Column({ name: 'total_impressions', type: 'int', default: 0 })
  totalImpressions: number;

  @Column({ name: 'total_clicks', type: 'int', default: 0 })
  totalClicks: number;

  @Column({ name: 'total_orders', type: 'int', default: 0 })
  totalOrders: number;

  // Relations
  @OneToMany(() => SocialPostPublication, (pub) => pub.socialPost)
  publications: SocialPostPublication[];

  // Audit
  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  @Index()
  createdBy?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
