import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { MarketingLink } from './marketing-link.entity';
import { User } from '../../users/entities/user.entity';

export enum LinkEventType {
  CLICK = 'click',
  VIEW_MENU = 'view_menu',
  ADD_TO_CART = 'add_to_cart',
  CHECKOUT_START = 'checkout_start',
  CHECKOUT_COMPLETE = 'checkout_complete',
  ORDER_PLACED = 'order_placed',
  ORDER_PAID = 'order_paid',
}

@Entity('link_events')
export class LinkEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'marketing_link_id', type: 'uuid' })
  @Index()
  marketingLinkId: string;

  @ManyToOne(() => MarketingLink, (link) => link.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'marketing_link_id' })
  marketingLink: MarketingLink;

  @Column({
    name: 'event_type',
    type: 'enum',
    enum: LinkEventType,
  })
  @Index()
  eventType: LinkEventType;

  // Session & User
  @Column({ name: 'session_id', length: 255, nullable: true })
  @Index()
  sessionId?: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  @Index()
  userId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  // Location & Device
  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ name: 'device_type', length: 50, nullable: true })
  deviceType?: string;

  @Column({ length: 100, nullable: true })
  browser?: string;

  @Column({ length: 100, nullable: true })
  os?: string;

  @Column({ length: 100, nullable: true })
  country?: string;

  @Column({ length: 100, nullable: true })
  city?: string;

  // Referrer
  @Column({ name: 'referrer_url', type: 'text', nullable: true })
  referrerUrl?: string;

  @Column({ name: 'referrer_platform', length: 50, nullable: true })
  referrerPlatform?: string;

  // Event data
  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  @Index()
  createdAt: Date;
}
