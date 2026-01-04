# Backend Structure - README

## Estructura del Proyecto

```
backend/
├─ src/
│  ├─ main.ts                    # Entry point
│  ├─ app.module.ts              # Root module
│  │
│  ├─ config/                    # Configuración
│  │  ├─ ormconfig.ts            # TypeORM config
│  │  └─ config.module.ts        # Config module
│  │
│  ├─ common/                    # Utilidades comunes
│  │  ├─ guards/                 # Auth guards (JWT, Local, Roles)
│  │  ├─ interceptors/           # Interceptores (Transform, Logging)
│  │  ├─ decorators/             # Decoradores custom (CurrentUser, Roles)
│  │  └─ filters/                # Exception filters
│  │
│  ├─ modules/                   # Módulos de negocio
│  │  ├─ auth/                   # Autenticación JWT
│  │  ├─ users/                  # Gestión de usuarios
│  │  ├─ tenants/                # Multi-tenant SaaS
│  │  ├─ restaurants/            # Datos de restaurante
│  │  ├─ menus/                  # Menús, categorías, productos
│  │  ├─ tables/                 # Mesas físicas y QR codes
│  │  ├─ orders/                 # Órdenes y pedidos
│  │  ├─ billing/                # Pagos y suscripciones
│  │  ├─ stats/                  # Estadísticas y dashboard
│  │  └─ notifications/          # Email, Push, etc.
│  │
│  └─ shared/                    # Código compartido
│     ├─ dto/                    # DTOs comunes (Pagination, etc.)
│     └─ utils/                  # Utilidades (string, date, etc.)
│
└─ test/                         # Tests e2e

```

## Módulos Principales

### Auth Module
- Login con JWT
- Registro de usuarios
- Refresh tokens
- Password recovery

### Users Module
- CRUD de usuarios
- Roles: SUPER_ADMIN, RESTAURANT_ADMIN, STAFF, CLIENT
- Multi-tenant support

### Tenants Module
- Gestión de tenants (para modelo SaaS)
- Aislamiento de datos por tenant
- Suscripciones y planes

### Restaurants Module
- Información del restaurante
- Horarios, ubicación
- Configuración

### Menus Module
- Categorías de menú
- Productos/Items
- Precios y disponibilidad
- Imágenes

### Tables Module
- Gestión de mesas
- Generación de QR codes
- Estados de mesa

### Orders Module
- Crear y gestionar pedidos
- Estados: pending, preparing, ready, delivered, cancelled
- Historial

### Billing Module
- Procesamiento de pagos
- Integración Stripe/PayPal
- Facturación
- Suscripciones

### Stats Module
- Dashboard de estadísticas
- Ventas por periodo
- Productos más vendidos
- Analytics

### Notifications Module
- Email (SMTP)
- Push notifications
- SMS (opcional)

## Comandos Útiles

### Instalación
\`\`\`bash
npm install
\`\`\`

### Desarrollo
\`\`\`bash
npm run start:dev
\`\`\`

### Producción
\`\`\`bash
npm run build
npm run start:prod
\`\`\`

### Tests
\`\`\`bash
npm run test
npm run test:e2e
npm run test:cov
\`\`\`

### Migraciones
\`\`\`bash
npm run migration:generate -- src/database/migrations/CreateUsersTable
npm run migration:run
npm run migration:revert
\`\`\`

## Variables de Entorno

Copiar `.env.example` a `.env` y configurar:

- Database credentials
- JWT secrets
- API keys (Stripe, email, etc.)
- Frontend URLs para CORS

## Documentación API

Una vez corriendo el servidor:
http://localhost:3000/api/docs
