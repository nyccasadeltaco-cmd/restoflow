# Backend - NestJS + PostgreSQL

API RESTful para la plataforma de restaurantes con arquitectura modular y bien organizada.

## 🏗️ Características

- **Autenticación y autorización** con JWT y Passport
- **Multi-tenant**: Soporte para múltiples restaurantes (modelo SaaS)
- **Roles**: Super Admin, Restaurant Admin, Staff, Cliente
- **TypeORM**: ORM robusto con migraciones
- **Swagger**: Documentación automática de API
- **Validación**: Class-validator y class-transformer
- **Guards**: JWT, Local, Roles para proteger endpoints
- **Decorators**: @CurrentUser, @Roles para código limpio

## 📦 Módulos Principales

### Auth (`modules/auth/`)
- Login con JWT y Passport
- Registro de usuarios
- Estrategias: Local y JWT
- Hash de passwords con bcrypt

### Users (`modules/users/`)
- CRUD de usuarios
- Roles: SUPER_ADMIN, RESTAURANT_ADMIN, STAFF, CLIENT
- Relación con tenants y restaurantes

### Tenants (`modules/tenants/`)
- Gestión de tenants (modelo SaaS)
- Aislamiento de datos por tenant
- Planes y suscripciones

### Restaurants (`modules/restaurants/`)
- Información del restaurante
- Horarios, ubicación, configuración
- Asociación con tenant

### Menus (`modules/menus/`)
- Menús, categorías y productos
- Precios y disponibilidad
- Gestión de imágenes

### Tables (`modules/tables/`)
- Gestión de mesas físicas
- Generación de códigos QR
- Estados de mesa (disponible, ocupada, reservada)

### Orders (`modules/orders/`)
- Crear y gestionar pedidos
- Estados: pending, preparing, ready, delivered, cancelled
- Items de orden con cantidades
- Historial de pedidos

### Billing (`modules/billing/`)
- Procesamiento de pagos
- Integración con Stripe
- Facturación y recibos
- Suscripciones mensuales/anuales

### Stats (`modules/stats/`)
- Dashboard de estadísticas
- Ventas por periodo
- Productos más vendidos
- Analytics y reportes

### Notifications (`modules/notifications/`)
- Email (SMTP/SendGrid)
- Push notifications
- Notificaciones en tiempo real

## 🚀 Configuración

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

### 3. Iniciar base de datos (Docker)
```bash
cd ../infra/docker
docker-compose up -d postgres
```

### 4. Ejecutar migraciones
```bash
npm run migration:run
```

### 5. Iniciar en modo desarrollo
```bash
npm run start:dev
```

## 📁 Estructura del Proyecto

```
backend/
├─ src/
│  ├─ main.ts                    # Entry point con Swagger
│  ├─ app.module.ts              # Root module
│  │
│  ├─ config/                    # Configuración
│  │  ├─ ormconfig.ts            # TypeORM config
│  │  └─ config.module.ts        # Config module
│  │
│  ├─ common/                    # Utilidades comunes
│  │  ├─ guards/                 # JWT, Local, Roles guards
│  │  ├─ interceptors/           # Transform, Logging
│  │  ├─ decorators/             # @CurrentUser, @Roles
│  │  └─ filters/                # Exception filters
│  │
│  ├─ modules/                   # Módulos de negocio
│  │  ├─ auth/                   # Login, JWT
│  │  ├─ users/                  # Usuarios
│  │  ├─ tenants/                # Multi-tenant
│  │  ├─ restaurants/            # Restaurantes
│  │  ├─ menus/                  # Menús y productos
│  │  ├─ tables/                 # Mesas y QR
│  │  ├─ orders/                 # Pedidos
│  │  ├─ billing/                # Pagos
│  │  ├─ stats/                  # Estadísticas
│  │  └─ notifications/          # Notificaciones
│  │
│  └─ shared/                    # Código compartido
│     ├─ dto/                    # PaginationDto, etc.
│     └─ utils/                  # Utilidades
│
├─ test/                         # Tests e2e
├─ package.json
├─ tsconfig.json
├─ nest-cli.json
└─ .env.example
```

## 🔧 Comandos Disponibles

### Desarrollo
```bash
npm run start          # Iniciar
npm run start:dev      # Iniciar con watch mode
npm run start:debug    # Iniciar en modo debug
npm run start:prod     # Iniciar en producción
```

### Build
```bash
npm run build          # Compilar TypeScript
```

### Linting y Formato
```bash
npm run lint           # Ejecutar ESLint
npm run format         # Formatear con Prettier
```

### Tests
```bash
npm run test           # Unit tests
npm run test:watch     # Tests en watch mode
npm run test:cov       # Coverage
npm run test:e2e       # End-to-end tests
```

### Base de Datos
```bash
npm run typeorm migration:generate -- src/database/migrations/MigrationName
npm run typeorm migration:create -- src/database/migrations/MigrationName
npm run typeorm migration:run
npm run typeorm migration:revert
```

## 📚 API Documentation

Una vez iniciado el servidor en desarrollo:

**Swagger UI**: http://localhost:3000/api/docs

Incluye:
- Todos los endpoints organizados por tags
- Modelos de datos (DTOs)
- Autenticación Bearer token
- Ejemplos de requests/responses

## 🔐 Autenticación

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Usar Token
```bash
GET /api/users
Authorization: Bearer {token}
```

## 🎯 Endpoints Principales

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/users` - Listar usuarios
- `GET /api/restaurants` - Listar restaurantes
- `GET /api/menus` - Listar menús
- `POST /api/orders` - Crear pedido
- `GET /api/stats/dashboard` - Dashboard

## 🛡️ Guards y Decoradores

### Proteger con JWT
```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}
```

### Proteger por roles
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'RESTAURANT_ADMIN')
@Get('admin-only')
adminEndpoint() {
  return { message: 'Admin access' };
}
```

## 🌐 Variables de Entorno

Ver `.env.example` para todas las variables necesarias:

- **Database**: Host, port, credentials
- **JWT**: Secret keys y expiración
- **CORS**: Origins permitidos
- **Email**: SMTP config
- **Payments**: Stripe keys

## 📝 Notas

- Los errores de TypeScript se resolverán después de `npm install`
- El proyecto usa path aliases: `@config`, `@common`, `@modules`, `@shared`
- TypeORM synchronize está en `false` por seguridad (usar migraciones)
- Swagger solo está disponible en desarrollo, no en producción
