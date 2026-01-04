import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../modules/users/entities/user.entity';

export const ROLES_KEY = 'roles';

/**
 * Decorador para especificar qué roles pueden acceder a un endpoint
 * @example
 * @Roles('super_admin')
 * @Roles('restaurant_admin', 'staff')
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
