import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'tenant_id', nullable: true })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 150, unique: true })
  slug: string;

  @Column({ name: 'panel_url', type: 'text', nullable: true })
  panelUrl?: string;

  @Column({ name: 'legal_name', length: 200, nullable: true })
  legalName?: string;

  @Column({ length: 150, nullable: true })
  email?: string;

  @Column({ length: 50, nullable: true })
  phone?: string;

  @Column({ name: 'address_line1', length: 200, nullable: true })
  addressLine1?: string;

  @Column({ name: 'address_line2', length: 200, nullable: true })
  addressLine2?: string;

  @Column({ length: 100, nullable: true })
  city?: string;

  @Column({ length: 100, nullable: true })
  state?: string;

  @Column({ length: 100, nullable: true })
  country?: string;

  @Column({ name: 'postal_code', length: 20, nullable: true })
  postalCode?: string;

  @Column({ length: 80, nullable: true })
  timezone?: string;

  @Column({ length: 10, nullable: true })
  currency?: string;

  @Column({ name: 'owner_user_id', type: 'uuid', nullable: true })
  ownerUserId?: string;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl?: string;

  @Column({ name: 'banner_url', type: 'text', nullable: true })
  bannerUrl?: string;

  @Column({ name: 'primary_color', length: 10, nullable: true })
  primaryColor?: string;

  @Column({ name: 'secondary_color', length: 10, nullable: true })
  secondaryColor?: string;

  @Column({ name: 'accent_color', length: 10, nullable: true })
  accentColor?: string;

  @Column({ name: 'branding', type: 'jsonb', nullable: true })
  branding?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    surface?: string;
    textPrimary?: string;
    textSecondary?: string;
    success?: string;
  };

  @Column({ name: 'subscription_plan', length: 50, nullable: true })
  subscriptionPlan?: string;

  @Column({ name: 'subscription_status', length: 30, default: 'TRIAL' })
  subscriptionStatus: string; // TRIAL | ACTIVE | HOLD | CANCELED

  @Column({
    name: 'subscription_started_at',
    type: 'timestamptz',
    nullable: true,
  })
  subscriptionStartedAt?: Date;

  @Column({
    name: 'subscription_renews_at',
    type: 'timestamptz',
    nullable: true,
  })
  subscriptionRenewsAt?: Date;

  @Column({ name: 'hold_reason', type: 'text', nullable: true })
  holdReason?: string;

  @Column({ name: 'card_fee_mode', length: 20, default: 'CLIENT' })
  cardFeeMode: string;

  @Column({
    name: 'card_fee_percent',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 0,
  })
  cardFeePercent: string;

  @Column({
    name: 'card_fee_fixed',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  cardFeeFixed: string;

  @Column({
    name: 'platform_fee_percent',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 0,
  })
  platformFeePercent: string;

  @Column({ name: 'operating_hours', type: 'jsonb', nullable: true })
  operatingHours?: {
    monday?: { open: string; close: string; closed?: boolean };
    tuesday?: { open: string; close: string; closed?: boolean };
    wednesday?: { open: string; close: string; closed?: boolean };
    thursday?: { open: string; close: string; closed?: boolean };
    friday?: { open: string; close: string; closed?: boolean };
    saturday?: { open: string; close: string; closed?: boolean };
    sunday?: { open: string; close: string; closed?: boolean };
  };

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
