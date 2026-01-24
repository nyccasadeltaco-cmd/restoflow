import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('combo_items')
export class ComboItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'combo_id' })
  comboId: string;

  @Column({ name: 'menu_item_id' })
  menuItemId: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ name: 'is_optional', default: false })
  isOptional: boolean;

  @Column({ name: 'group_key', nullable: true, length: 80 })
  groupKey: string;

  @Column({ name: 'min_select', type: 'int', nullable: true })
  minSelect: number;

  @Column({ name: 'max_select', type: 'int', nullable: true })
  maxSelect: number;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
