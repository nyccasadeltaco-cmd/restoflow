import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

export enum SocialPlatform {
  META = 'meta',
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  TIKTOK = 'tiktok',
  TWITTER = 'twitter',
}

export enum ConnectionStatus {
  CONNECTED = 'connected',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  ERROR = 'error',
}

@Entity('social_connections')
@Index(['restaurantId', 'platform', 'accountId'], { unique: true })
export class SocialConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'restaurant_id', type: 'uuid' })
  @Index()
  restaurantId: string;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @Column({
    type: 'enum',
    enum: SocialPlatform,
  })
  @Index()
  platform: SocialPlatform;

  @Column({ name: 'account_id', nullable: true })
  accountId?: string;

  @Column({ name: 'account_name', nullable: true })
  accountName?: string;

  @Column({ name: 'account_username', nullable: true })
  accountUsername?: string;

  @Column({ name: 'page_id', nullable: true })
  pageId?: string;

  @Column({ name: 'ig_business_account_id', nullable: true })
  igBusinessAccountId?: string;

  @Column({ name: 'access_token', type: 'text', nullable: true })
  accessToken?: string; // Should be encrypted in production

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken?: string; // Should be encrypted in production

  @Column({ name: 'token_expires_at', type: 'timestamptz', nullable: true })
  tokenExpiresAt?: Date;

  @Column({ type: 'text', array: true, default: '{}' })
  scopes: string[];

  @Column({
    type: 'enum',
    enum: ConnectionStatus,
    default: ConnectionStatus.CONNECTED,
  })
  @Index()
  status: ConnectionStatus;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
