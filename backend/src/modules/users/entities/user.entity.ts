import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Roles de usuario en el sistema
 * - SUPER_ADMIN: Acceso total desde Master Panel (restaurantId = null)
 * - RESTAURANT_ADMIN: Dueño/Admin de un restaurante (requiere restaurantId)
 * - STAFF: Empleado de un restaurante (requiere restaurantId)
 * - CLIENT: Usuario final (restaurantId = null)
 */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  RESTAURANT_ADMIN = 'restaurant_admin',
  STAFF = 'staff',
  CLIENT = 'client',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;

  @Column({ type: 'uuid', nullable: true })
  tenantId: string;

  /**
   * ID del restaurante al que pertenece el usuario
   * - SUPER_ADMIN y CLIENT: debe ser null
   * - RESTAURANT_ADMIN y STAFF: debe tener valor
   */
  @Column({ type: 'uuid', nullable: true })
  restaurantId: string | null;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  emailVerifiedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Getter para obtener el nombre completo
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }
}
