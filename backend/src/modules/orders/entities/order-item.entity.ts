import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @Column({ nullable: true })
  menuItemId: string;

  @Column({ length: 20, default: 'menu_item' })
  itemType: string;

  @Column({ nullable: true })
  comboId: string;

  @Column({ type: 'text', nullable: true })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  displayDescription: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  modifiers: any;

  @CreateDateColumn()
  createdAt: Date;
}
