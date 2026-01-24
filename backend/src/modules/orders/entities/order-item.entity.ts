import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ name: 'menu_item_id', nullable: true })
  menuItemId: string;

  @Column({ name: 'item_type', length: 20, default: 'menu_item' })
  itemType: string;

  @Column({ name: 'combo_id', nullable: true })
  comboId: string;

  @Column({ name: 'display_name', type: 'text', nullable: true })
  displayName: string;

  @Column({ name: 'display_description', type: 'text', nullable: true })
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
