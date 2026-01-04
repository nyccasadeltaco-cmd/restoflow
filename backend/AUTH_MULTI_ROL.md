# Implementación de Autenticación Multi-Rol y Multi-Restaurante

## 📋 Resumen de Cambios

Se ha implementado exitosamente el sistema de autenticación multi-rol y multi-restaurante en la aplicación RestFolow.

## 🔐 Roles Implementados

```typescript
export enum UserRole {
  SUPER_ADMIN = 'super_admin',       // Acceso total a /master/**
  RESTAURANT_ADMIN = 'restaurant_admin', // Acceso a su restaurante
  STAFF = 'staff',                    // Empleado de restaurante
  CLIENT = 'client',                  // Cliente final
}
```

## 📦 Archivos Modificados

### 1. **user.entity.ts** ✅
- Enum `UserRole` con 4 roles
- Campo `restaurantId` (UUID, nullable)
- Regla: SUPER_ADMIN tiene `restaurantId = null`
- Regla: RESTAURANT_ADMIN y STAFF deben tener `restaurantId`

### 2. **auth.service.ts** ✅
- JWT Payload incluye: `sub`, `email`, `role`, `restaurantId`, `tenantId`
- Método `login()` retorna token con toda la información del usuario
- Tipos seguros con `JwtPayload` interface

### 3. **jwt.strategy.ts** ✅
- Valida el token y extrae el payload completo
- Retorna objeto `AuthenticatedUser` con `restaurantId`
- Type-safe con interfaces dedicadas

### 4. **roles.decorator.ts** ✅
- Decorador `@Roles(...roles)` para proteger rutas
- Ejemplo: `@Roles('super_admin')`

### 5. **roles.guard.ts** ✅
- Guard que valida los roles requeridos
- Se combina con `JwtAuthGuard` para protección completa

### 6. **jwt-payload.interface.ts** 🆕
- Interface `JwtPayload` para el token
- Interface `AuthenticatedUser` para el usuario autenticado
- Type safety en todo el flujo de autenticación

### 7. **restaurants.controller.ts** ✅
- Protegido con `@UseGuards(JwtAuthGuard, RolesGuard)`
- Decorado con `@Roles('super_admin')`
- Solo SUPER_ADMIN puede acceder a `/master/restaurants/**`

## 🚀 Cómo Usar

### Proteger Rutas para SUPER_ADMIN

```typescript
@Controller('master/restaurants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class RestaurantsController {
  // Solo SUPER_ADMIN puede acceder aquí
}
```

### Proteger Rutas para RESTAURANT_ADMIN o STAFF

```typescript
@Controller('restaurant')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('restaurant_admin', 'staff')
export class RestaurantDashboardController {
  // RESTAURANT_ADMIN y STAFF pueden acceder aquí
}
```

### Obtener Usuario Actual en un Endpoint

```typescript
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

@Get('my-restaurant')
@UseGuards(JwtAuthGuard)
getMyRestaurant(@CurrentUser() user: AuthenticatedUser) {
  // user.id
  // user.email
  // user.role
  // user.restaurantId  ← Solo para RESTAURANT_ADMIN y STAFF
  return this.service.findOne(user.restaurantId);
}
```

## 📊 Estructura del Token JWT

Cuando un usuario hace login, el JWT incluye:

```json
{
  "sub": "uuid-del-usuario",
  "email": "admin@plataforma.com",
  "role": "super_admin",
  "tenantId": null,
  "restaurantId": null,
  "iat": 1234567890,
  "exp": 1234567890
}
```

Para un RESTAURANT_ADMIN:

```json
{
  "sub": "uuid-del-usuario",
  "email": "admin@restaurante.com",
  "role": "restaurant_admin",
  "tenantId": "uuid-del-tenant",
  "restaurantId": "uuid-del-restaurante",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## 🔒 Reglas de Negocio

1. **SUPER_ADMIN**:
   - `restaurantId` debe ser `null`
   - Acceso total a `/master/**`
   - Puede gestionar todos los restaurantes

2. **RESTAURANT_ADMIN**:
   - `restaurantId` debe estar presente
   - Acceso a `/restaurant/**`
   - Solo puede ver/editar su propio restaurante

3. **STAFF**:
   - `restaurantId` debe estar presente
   - Acceso limitado a `/restaurant/**`
   - Permisos específicos según configuración

4. **CLIENT**:
   - `restaurantId` es `null`
   - Acceso a rutas públicas y su perfil
   - No tiene acceso administrativo

## ✅ Testing

### 1. Login como SUPER_ADMIN

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@plataforma.com",
  "password": "master123"
}
```

Respuesta esperada:
```json
{
  "access_token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "admin@plataforma.com",
    "role": "super_admin",
    "restaurantId": null
  }
}
```

### 2. Acceder a Ruta Protegida

```bash
GET http://localhost:3000/api/master/restaurants
Authorization: Bearer eyJhbGc...
```

## 📝 Próximos Pasos (FASE 2)

1. Crear endpoints para `/restaurant/**` (panel del restaurante)
2. Implementar middleware para validar que RESTAURANT_ADMIN solo acceda a su restaurante
3. Crear filtros automáticos por `restaurantId` en queries
4. Implementar permisos granulares para STAFF
5. Agregar auditoría de accesos por rol

## 🎯 Estado Actual

✅ Autenticación multi-rol implementada
✅ JWT con `restaurantId` funcionando
✅ Guards y decoradores configurados
✅ Rutas de master panel protegidas
✅ Type safety en todo el flujo
🔄 Pendiente: Implementar rutas `/restaurant/**`
🔄 Pendiente: Middleware de scope por restaurante
