# 📱 Social Media Module - RestFolow

Módulo completo de gestión de redes sociales para restaurantes con generación de contenido mediante IA.

## 🎯 Características Principales

### 1. **Conexión con Redes Sociales**
- ✅ Meta (Facebook + Instagram) vía OAuth
- 🔜 TikTok (próximamente)
- 🔜 Twitter/X (próximamente)

### 2. **Post Studio (Generador de Contenido con IA)**
- 📸 Upload de imágenes/videos a Supabase Storage
- 🤖 Generación automática de:
  - Captions (corto/medio/largo)
  - Hashtags relevantes (25-30 tags)
  - CTAs optimizados
  - Hooks llamativos
  - Variantes por plataforma
- ✏️ Edición manual de contenido generado
- 📅 Publicación inmediata o programada
- 📊 Preview por plataforma

### 3. **Marketing Links & Tracking**
- 🔗 Links cortos para tracking (`/order/{slug}`)
- 📈 Eventos: click → view_menu → add_to_cart → checkout → order_paid
- 🎯 UTM parameters automáticos
- 📱 QR Codes generados automáticamente
- 📊 Analytics: clicks, órdenes, revenue

### 4. **Multi-Platform Publishing**
- Instagram: Post directo vía Graph API
- Facebook: Post directo vía Graph API
- TikTok: Draft con content listo (próximamente API directa)
- Fallback: "Copy & Share" si no hay permisos OAuth

---

## 📦 Estructura del Backend

```
backend/src/modules/social-media/
├── entities/
│   ├── social-connection.entity.ts       # OAuth connections
│   ├── social-post.entity.ts             # Posts drafts/published
│   ├── social-post-publication.entity.ts # Per-platform status
│   ├── marketing-link.entity.ts          # Short links + UTM
│   └── link-event.entity.ts              # Tracking events
├── dto/
│   ├── social-post.dto.ts                # Create/Update post DTOs
│   └── marketing-link.dto.ts             # Link creation & tracking
├── services/
│   ├── ai-content.service.ts             # OpenAI/Claude integration
│   ├── social-media.service.ts           # Main business logic
│   ├── meta-publisher.service.ts         # FB/IG publishing
│   └── link-tracking.service.ts          # Analytics tracking
├── social-media.controller.ts            # REST endpoints
└── social-media.module.ts                # Module definition
```

---

## 🗄️ Database Schema

### Tablas Principales

#### 1. `social_connections`
Almacena tokens OAuth de cada plataforma conectada.

```sql
- id (uuid)
- restaurant_id (uuid, FK)
- platform (enum: meta, instagram, facebook, tiktok)
- account_id, page_id, ig_business_account_id
- access_token, refresh_token (encrypted)
- token_expires_at
- scopes[]
- status (connected, expired, revoked, error)
```

#### 2. `social_posts`
Posts creados (drafts y publicados).

```sql
- id (uuid)
- restaurant_id (uuid, FK)
- title, description
- media_urls[], media_types[]
- prompt_context (jsonb) // Input para IA
- ai_generated (jsonb)    // Output de IA
- selected_caption, selected_hashtags[], selected_cta
- platforms[]
- status (draft, scheduled, publishing, published, failed)
- scheduled_at, published_at
- total_reach, total_clicks, total_orders
```

#### 3. `social_post_publications`
Estado por plataforma (un post puede publicarse en múltiples redes).

```sql
- id (uuid)
- social_post_id (uuid, FK)
- platform (instagram, facebook, tiktok)
- external_post_id          // ID en la plataforma
- external_post_url
- status (queued, publishing, published, failed)
- likes_count, comments_count, shares_count, reach
```

#### 4. `marketing_links`
Links cortos con tracking.

```sql
- id (uuid)
- restaurant_id (uuid, FK)
- social_post_id (uuid, FK, nullable)
- slug (unique)
- destination_url
- utm_source, utm_medium, utm_campaign
- clicks_count, orders_count, revenue_total
- qr_code_url
- is_active, expires_at
```

#### 5. `link_events`
Eventos de tracking (append-only log).

```sql
- id (uuid)
- marketing_link_id (uuid, FK)
- event_type (click, view_menu, add_to_cart, checkout_start, order_placed, order_paid)
- session_id, user_id
- ip_address, user_agent, device_type, browser, os, country, city
- referrer_url, referrer_platform
- metadata (jsonb) // order_id, cart_total, product_ids
```

---

## 🔌 API Endpoints

### Posts

```http
# Crear post (draft)
POST /api/social-media/posts
Body: { title, description, mediaUrls[], promptContext }

# Listar posts
GET /api/social-media/posts?status=draft&limit=20

# Obtener post
GET /api/social-media/posts/:id

# Actualizar post
PATCH /api/social-media/posts/:id
Body: { title, selectedCaption, selectedHashtags[] }

# Generar contenido con IA
POST /api/social-media/posts/:id/generate
Body: { promptContext, platforms[] }

# Publicar post
POST /api/social-media/posts/:id/publish
Body: { platforms[], scheduledAt? }

# Eliminar post
DELETE /api/social-media/posts/:id
```

### Connections

```http
# Iniciar OAuth flow
GET /api/social-media/connections/meta/authorize

# Callback OAuth
GET /api/social-media/connections/meta/callback?code=xxx

# Listar conexiones
GET /api/social-media/connections

# Desconectar
DELETE /api/social-media/connections/:id
```

### Links & Tracking

```http
# Crear link
POST /api/social-media/links
Body: { slug, destinationUrl, utmSource, generateQR }

# Listar links
GET /api/social-media/links?socialPostId=xxx

# Obtener stats
GET /api/social-media/links/:id/stats

# Track event (público, sin auth)
POST /api/social-media/track
Body: { marketingLinkId, eventType, sessionId, metadata }
```

---

## 🤖 IA Generation Flow

### Input (PromptContext)
```json
{
  "product": "Pizza Margherita",
  "offer": "2x1 en pizzas familiares",
  "objective": "Generar ventas",
  "tone": "casual",
  "language": "es",
  "ctaType": "order_now"
}
```

### Output (AIGeneratedContent)
```json
{
  "captions": {
    "short": "🍕 2x1 en pizzas familiares HOY",
    "medium": "¿Antojo de pizza? ¡Tenemos 2x1 en familiares! Ordena ahora 🔥",
    "long": "No te pierdas nuestra promo 2x1 en pizzas familiares..."
  },
  "hashtags": [
    "#Pizza", "#2x1", "#Promo", "#FoodPorn", "#PizzaLovers"
  ],
  "ctas": [
    "¡Ordena ahora!", "¡Pide ya!", "Haz tu pedido"
  ],
  "hooks": [
    "🚨 Alerta de antojo: 2x1 en pizzas 🚨",
    "POV: Descubriste la mejor promo del mes"
  ],
  "variants": {
    "instagram": {
      "caption": "...\n\n📍 Ordena ahora 👆\n\n#Pizza #2x1 ...",
      "hashtags": ["#Pizza", "#2x1", ...]
    },
    "facebook": {
      "caption": "... 👉 Haz clic para ordenar"
    }
  }
}
```

---

## 🔐 Seguridad

### 1. **Encryption**
- `access_token` y `refresh_token` se encriptan antes de guardar
- Usar `pgcrypto` o un KMS externo (AWS KMS, Google Cloud KMS)
- NUNCA guardar tokens en plaintext

### 2. **Row Level Security (RLS)**
```sql
-- Solo el dueño del restaurante ve sus conexiones/posts
CREATE POLICY social_connections_isolation ON social_connections
  FOR ALL USING (restaurant_id IN (
    SELECT r.id FROM restaurants r WHERE r.owner_id = auth.uid()
  ));
```

### 3. **Rate Limiting**
- Meta API: 200 calls/hour por usuario
- Implementar throttling en NestJS (usar `@nestjs/throttler`)
- Queue system (Bull/BullMQ) para publicaciones programadas

### 4. **OAuth Scopes**
- Facebook: `pages_manage_posts`, `pages_read_engagement`
- Instagram: `instagram_basic`, `instagram_content_publish`
- Renovar tokens antes de expiración

---

## 📱 Frontend Structure (Flutter)

```
apps/restaurant_panel/lib/features/settings/social_media/
├── domain/
│   ├── social_connection.dart
│   ├── social_post.dart
│   ├── marketing_link.dart
│   └── ai_generated_content.dart
├── application/
│   ├── social_connections_provider.dart
│   ├── social_posts_provider.dart
│   ├── post_studio_controller.dart
│   └── link_tracking_provider.dart
├── presentation/
│   ├── social_media_page.dart           # Main tabs
│   ├── connections/
│   │   ├── connections_page.dart        # OAuth flows
│   │   └── connect_meta_dialog.dart
│   ├── post_studio/
│   │   ├── post_studio_page.dart
│   │   ├── media_upload_section.dart
│   │   ├── context_form_section.dart
│   │   ├── ai_generation_section.dart
│   │   ├── content_editor_section.dart
│   │   └── platform_preview_section.dart
│   ├── posts/
│   │   ├── posts_list_page.dart
│   │   └── post_card.dart
│   └── links/
│       ├── links_page.dart
│       └── link_stats_card.dart
└── infrastructure/
    └── social_media_service.dart        # API calls
```

---

## 🚀 Implementation Plan

### ✅ Fase 1 - MVP (Funcional ahora)
1. ✅ Database schema + migrations
2. ✅ Entities + DTOs
3. ⏳ Services (AI, Meta Publisher, Link Tracking)
4. ⏳ Controller + Module
5. ⏳ Frontend UI (Connections + Post Studio)
6. ⏳ Image upload to Supabase Storage
7. ⏳ AI content generation (mock)
8. ⏳ Link creation + tracking

### 🔜 Fase 2 - Production Ready
1. OAuth flow completo (Meta)
2. Direct publishing (Instagram/Facebook)
3. OpenAI integration real
4. Scheduled posts (Bull Queue)
5. QR code generation
6. Analytics dashboard
7. Copy & Share fallback

### 🔜 Fase 3 - Advanced
1. TikTok integration
2. Twitter/X integration
3. A/B testing (múltiples captions)
4. Inbox (responder comentarios con IA)
5. Auto-repost (reciclado de contenido exitoso)
6. Templates (promos recurrentes)

---

## 🧪 Testing

### Unit Tests
```bash
npm run test -- social-media
```

### E2E Tests
```bash
npm run test:e2e
```

### Manual Testing
```bash
# 1. Run migrations
node backend/create-social-media-tables.sql

# 2. Start backend
cd backend && npm run start:dev

# 3. Create test post
curl -X POST http://localhost:3000/api/social-media/posts \
  -H "Authorization: Bearer {token}" \
  -d '{"title":"Test Post","promptContext":{"product":"Pizza"}}'
```

---

## 📚 Resources

### Meta API
- [Graph API Docs](https://developers.facebook.com/docs/graph-api)
- [Instagram Content Publishing](https://developers.facebook.com/docs/instagram-api/guides/content-publishing)

### TikTok API
- [TikTok for Developers](https://developers.tiktok.com/)
- [Content Posting API](https://developers.tiktok.com/doc/content-posting-api-get-started)

### AI Services
- [OpenAI API](https://platform.openai.com/docs)
- [Anthropic Claude](https://docs.anthropic.com)

---

## 🐛 Troubleshooting

### Error: "Token expired"
```typescript
// Solution: Implementar refresh automático
if (connection.tokenExpiresAt < new Date()) {
  await this.refreshToken(connection);
}
```

### Error: "Rate limit exceeded"
```typescript
// Solution: Usar queue con delay
await this.queue.add('publish-post', { postId }, { 
  delay: 5000, // 5 segundos entre posts
  attempts: 3 
});
```

### Error: "Image upload failed"
```typescript
// Solution: Verificar permisos de Storage bucket
// Supabase → Storage → social_media_posts → Policies
```

---

## 📝 TODO

- [ ] Implementar Meta OAuth flow completo
- [ ] Integrar OpenAI API real (reemplazar mock)
- [ ] Crear Bull Queue para scheduled posts
- [ ] Implementar token refresh automático
- [ ] Añadir tests unitarios (80%+ coverage)
- [ ] Documentar frontend Flutter
- [ ] Crear ejemplos de uso
- [ ] Performance: índices compuestos en queries
- [ ] GDPR: anonimizar IPs después de 90 días

---

## 👥 Contributors

- RestFolow Team

## 📄 License

Propietario - RestFolow Platform
