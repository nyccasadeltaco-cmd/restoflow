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
import { SocialPost } from './social-post.entity';
import { LinkEvent } from './link-event.entity';

@Entity('marketing_links')
export class MarketingLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'restaurant_id', type: 'uuid' })
  @Index()
  restaurantId: string;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @Column({ name: 'social_post_id', type: 'uuid', nullable: true })
  @Index()
  socialPostId?: string;

  @ManyToOne(() => SocialPost, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'social_post_id' })
  socialPost?: SocialPost;

  // Link details
  @Column({ length: 255, unique: true })
  @Index()
  slug: string;

  @Column({ name: 'destination_url', type: 'text' })
  destinationUrl: string;

  @Column({ length: 255, nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // UTM parameters
  @Column({ name: 'utm_source', length: 100, nullable: true })
  utmSource?: string;

  @Column({ name: 'utm_medium', length: 100, nullable: true })
  utmMedium?: string;

  @Column({ name: 'utm_campaign', length: 255, nullable: true })
  utmCampaign?: string;

  @Column({ name: 'utm_term', length: 255, nullable: true })
  utmTerm?: string;

  @Column({ name: 'utm_content', length: 255, nullable: true })
  utmContent?: string;

  // Tracking
  @Column({ name: 'clicks_count', type: 'int', default: 0 })
  clicksCount: number;

  @Column({ name: 'unique_clicks_count', type: 'int', default: 0 })
  uniqueClicksCount: number;

  @Column({ name: 'orders_count', type: 'int', default: 0 })
  ordersCount: number;

  @Column({ name: 'revenue_total', type: 'decimal', precision: 10, scale: 2, default: 0 })
  revenueTotal: number;

  // QR Code
  @Column({ name: 'qr_code_url', type: 'text', nullable: true })
  qrCodeUrl?: string;

  // Status
  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date;

  @OneToMany(() => LinkEvent, (event) => event.marketingLink)
  events: LinkEvent[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
