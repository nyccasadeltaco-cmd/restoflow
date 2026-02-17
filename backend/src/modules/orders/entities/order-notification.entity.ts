import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('order_notifications')
export class OrderNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  orderId: string | null;

  @Column({ length: 20, default: 'SMS' })
  channel: string;

  @Column({ length: 30, default: 'TWILIO' })
  provider: string;

  @Column({ nullable: true, length: 50 })
  toPhone: string | null;

  @Column({ nullable: true, length: 50 })
  template: string | null;

  @Column({ nullable: true, length: 40 })
  providerStatus: string | null;

  @Index('IDX_order_notifications_provider_message_sid')
  @Column({ nullable: true, length: 80 })
  providerMessageSid: string | null;

  @Column({ nullable: true, type: 'text' })
  errorMessage: string | null;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

