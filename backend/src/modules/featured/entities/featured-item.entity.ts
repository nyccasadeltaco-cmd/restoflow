import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum FeaturedItemType {
  MENU_ITEM = 'menu_item',
  COMBO = 'combo',
  CUSTOM = 'custom',
}

@Entity('featured_items')
export class FeaturedItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'restaurant_id' })
  restaurantId: string;

  @Column({ name: 'section_key', length: 64 })
  sectionKey: string;

  @Column({ type: 'varchar', length: 32 })
  type: FeaturedItemType;

  @Column({ name: 'ref_id', nullable: true })
  refId: string;

  @Column({ name: 'title_override', nullable: true, length: 120 })
  titleOverride: string;

  @Column({ name: 'subtitle_override', nullable: true, length: 180 })
  subtitleOverride: string;

  @Column({ name: 'image_url_override', nullable: true })
  imageUrlOverride: string;

  @Column({ name: 'price_override', type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceOverride: number;

  @Column({ name: 'cta_label', length: 40, default: 'Order' })
  ctaLabel: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'starts_at', type: 'timestamptz', nullable: true })
  startsAt: Date;

  @Column({ name: 'ends_at', type: 'timestamptz', nullable: true })
  endsAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
