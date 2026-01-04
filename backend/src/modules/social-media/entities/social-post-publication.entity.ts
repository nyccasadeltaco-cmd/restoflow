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
import { SocialPost } from './social-post.entity';
import { SocialConnection } from './social-connection.entity';

export enum PublicationStatus {
  QUEUED = 'queued',
  PUBLISHING = 'publishing',
  PUBLISHED = 'published',
  FAILED = 'failed',
  DELETED = 'deleted',
}

@Entity('social_post_publications')
@Index(['socialPostId', 'platform'], { unique: true })
export class SocialPostPublication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'social_post_id', type: 'uuid' })
  @Index()
  socialPostId: string;

  @ManyToOne(() => SocialPost, (post) => post.publications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'social_post_id' })
  socialPost: SocialPost;

  @Column({ length: 50 })
  @Index()
  platform: string;

  @Column({ name: 'connection_id', type: 'uuid', nullable: true })
  connectionId?: string;

  @ManyToOne(() => SocialConnection, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'connection_id' })
  connection?: SocialConnection;

  // External platform IDs
  @Column({ name: 'external_post_id', nullable: true })
  @Index()
  externalPostId?: string;

  @Column({ name: 'external_post_url', type: 'text', nullable: true })
  externalPostUrl?: string;

  // Status
  @Column({
    type: 'enum',
    enum: PublicationStatus,
    default: PublicationStatus.QUEUED,
  })
  @Index()
  status: PublicationStatus;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt?: Date;

  @Column({ name: 'failed_at', type: 'timestamptz', nullable: true })
  failedAt?: Date;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount: number;

  // Platform metrics
  @Column({ name: 'likes_count', type: 'int', default: 0 })
  likesCount: number;

  @Column({ name: 'comments_count', type: 'int', default: 0 })
  commentsCount: number;

  @Column({ name: 'shares_count', type: 'int', default: 0 })
  sharesCount: number;

  @Column({ name: 'saves_count', type: 'int', default: 0 })
  savesCount: number;

  @Column({ type: 'int', default: 0 })
  reach: number;

  @Column({ type: 'int', default: 0 })
  impressions: number;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
