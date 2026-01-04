import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
}

export enum OrderSource {
  ON_SITE = 'ON_SITE',
  TAKEOUT = 'TAKEOUT',
  DELIVERY = 'DELIVERY',
  LINK = 'LINK',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  restaurantId: string;

  @Column({ nullable: true })
  tableId: string;

  @Column({ type: 'varchar', length: 20 })
  source: OrderSource;

  @Column({ type: 'varchar', length: 20, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'varchar', length: 20, default: PaymentStatus.UNPAID })
  paymentStatus: PaymentStatus;

  @Column({ nullable: true, length: 150 })
  customerName: string;

  @Column({ nullable: true, length: 50 })
  customerPhone: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tipAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cardFeeAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  platformFeeAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  readyAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  deliveredAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  canceledAt: Date;
}
