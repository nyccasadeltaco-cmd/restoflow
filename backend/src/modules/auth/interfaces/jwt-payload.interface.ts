import { UserRole } from '../../users/entities/user.entity';

/**
 * Payload que se almacena en el JWT
 * 
 * @remarks
 * - SUPER_ADMIN y CLIENT: restaurantId debe ser null
 * - RESTAURANT_ADMIN y STAFF: restaurantId debe tener un UUID válido
 */
export interface JwtPayload {
  sub: string;                 // userId
  email: string;
  role: UserRole;              // SUPER_ADMIN | RESTAURANT_ADMIN | STAFF | CLIENT
  tenantId: string | null;     // Siempre presente (null si no aplica)
  restaurantId: string | null; // Siempre presente (null para SUPER_ADMIN/CLIENT)
}

/**
 * Usuario autenticado (lo que está disponible en request.user)
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
  restaurantId: string | null;
  fullName?: string;    // Nombre completo del usuario
}
