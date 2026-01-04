-- ============================================
-- SOCIAL MEDIA MODULE - DATABASE SCHEMA
-- ============================================
-- Creado: 2025-12-12
-- Propósito: Gestión de redes sociales, posts con IA, tracking de links
-- ============================================

-- 1. SOCIAL CONNECTIONS (OAuth tokens para FB/IG/TikTok)
-- ============================================
CREATE TABLE IF NOT EXISTS social_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('meta', 'instagram', 'facebook', 'tiktok', 'twitter')),
  account_id VARCHAR(255), -- external platform account ID
  account_name VARCHAR(255),
  account_username VARCHAR(255),
  page_id VARCHAR(255), -- for Facebook pages
  ig_business_account_id VARCHAR(255), -- for Instagram Business
  access_token TEXT, -- encrypted in application layer
  refresh_token TEXT, -- encrypted in application layer
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[], -- array of granted permissions
  status VARCHAR(50) DEFAULT 'connected' CHECK (status IN ('connected', 'expired', 'revoked', 'error')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}', -- additional platform-specific data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant_id, platform, account_id)
);

CREATE INDEX idx_social_connections_restaurant ON social_connections(restaurant_id);
CREATE INDEX idx_social_connections_status ON social_connections(status);
CREATE INDEX idx_social_connections_platform ON social_connections(platform);

-- 2. SOCIAL POSTS (drafts y publicados)
-- ============================================
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Media
  media_urls TEXT[] DEFAULT '{}', -- array of Supabase Storage URLs
  media_types TEXT[] DEFAULT '{}', -- ['image', 'video']
  thumbnail_url TEXT,
  
  -- Context for AI generation
  prompt_context JSONB DEFAULT '{}', -- {product, offer, objective, tone, language, cta_type}
  
  -- AI Generated Content
  ai_generated JSONB DEFAULT '{}', -- {captions: [], hashtags: [], ctas: [], hooks: [], variants: {}}
  
  -- Selected content (what user chose to publish)
  selected_caption TEXT,
  selected_hashtags TEXT[] DEFAULT '{}',
  selected_cta TEXT,
  
  -- Publishing
  platforms TEXT[] DEFAULT '{}', -- ['instagram', 'facebook', 'tiktok']
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed', 'deleted')),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  
  -- Tracking & Performance
  marketing_link_id UUID REFERENCES marketing_links(id),
  total_reach INTEGER DEFAULT 0,
  total_impressions INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  
  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_social_posts_restaurant ON social_posts(restaurant_id);
CREATE INDEX idx_social_posts_status ON social_posts(status);
CREATE INDEX idx_social_posts_scheduled ON social_posts(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX idx_social_posts_created_by ON social_posts(created_by);

-- 3. SOCIAL POST PUBLICATIONS (registro por plataforma)
-- ============================================
CREATE TABLE IF NOT EXISTS social_post_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  social_post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('instagram', 'facebook', 'tiktok', 'twitter')),
  connection_id UUID REFERENCES social_connections(id) ON DELETE SET NULL,
  
  -- External IDs from platform
  external_post_id VARCHAR(255), -- ID del post en la plataforma
  external_post_url TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'queued' CHECK (status IN ('queued', 'publishing', 'published', 'failed', 'deleted')),
  published_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Platform-specific metrics (synced from APIs)
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(social_post_id, platform)
);

CREATE INDEX idx_social_publications_post ON social_post_publications(social_post_id);
CREATE INDEX idx_social_publications_platform ON social_post_publications(platform);
CREATE INDEX idx_social_publications_status ON social_post_publications(status);
CREATE INDEX idx_social_publications_external ON social_post_publications(external_post_id);

-- 4. MARKETING LINKS (short links para tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS marketing_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  social_post_id UUID REFERENCES social_posts(id) ON DELETE SET NULL,
  
  -- Link details
  slug VARCHAR(255) NOT NULL UNIQUE, -- /r/{slug} o /order/{slug}
  destination_url TEXT NOT NULL, -- internal route o external URL
  title VARCHAR(255),
  description TEXT,
  
  -- UTM parameters
  utm_source VARCHAR(100), -- 'instagram', 'facebook', 'tiktok'
  utm_medium VARCHAR(100), -- 'social', 'post', 'story'
  utm_campaign VARCHAR(255),
  utm_term VARCHAR(255),
  utm_content VARCHAR(255),
  
  -- Tracking
  clicks_count INTEGER DEFAULT 0,
  unique_clicks_count INTEGER DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  revenue_total DECIMAL(10, 2) DEFAULT 0,
  
  -- QR Code
  qr_code_url TEXT, -- Supabase Storage URL
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_marketing_links_restaurant ON marketing_links(restaurant_id);
CREATE INDEX idx_marketing_links_slug ON marketing_links(slug);
CREATE INDEX idx_marketing_links_post ON marketing_links(social_post_id);
CREATE INDEX idx_marketing_links_active ON marketing_links(is_active);

-- 5. LINK EVENTS (tracking clicks, conversions)
-- ============================================
CREATE TABLE IF NOT EXISTS link_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marketing_link_id UUID NOT NULL REFERENCES marketing_links(id) ON DELETE CASCADE,
  
  -- Event details
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'click', 'view_menu', 'add_to_cart', 'checkout_start', 
    'checkout_complete', 'order_placed', 'order_paid'
  )),
  
  -- Session & User
  session_id VARCHAR(255), -- anonymous session or logged user
  user_id UUID REFERENCES users(id),
  
  -- Location & Device
  ip_address INET,
  user_agent TEXT,
  device_type VARCHAR(50), -- mobile, tablet, desktop
  browser VARCHAR(100),
  os VARCHAR(100),
  country VARCHAR(100),
  city VARCHAR(100),
  
  -- Referrer
  referrer_url TEXT,
  referrer_platform VARCHAR(50), -- instagram, facebook, etc.
  
  -- Event data
  metadata JSONB DEFAULT '{}', -- {order_id, cart_total, product_ids, etc.}
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_link_events_link ON link_events(marketing_link_id);
CREATE INDEX idx_link_events_type ON link_events(event_type);
CREATE INDEX idx_link_events_session ON link_events(session_id);
CREATE INDEX idx_link_events_user ON link_events(user_id);
CREATE INDEX idx_link_events_created ON link_events(created_at);

-- 6. AI GENERATION LOG (auditoría de uso de IA)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  social_post_id UUID REFERENCES social_posts(id) ON DELETE SET NULL,
  
  -- AI request
  provider VARCHAR(50), -- 'openai', 'anthropic', 'custom'
  model VARCHAR(100), -- 'gpt-4', 'claude-3', etc.
  prompt TEXT,
  prompt_tokens INTEGER,
  
  -- AI response
  response JSONB, -- full AI response
  completion_tokens INTEGER,
  total_tokens INTEGER,
  cost DECIMAL(10, 4), -- estimated cost in USD
  
  -- Status
  status VARCHAR(50) DEFAULT 'success' CHECK (status IN ('success', 'failed', 'timeout')),
  error_message TEXT,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_logs_restaurant ON ai_generation_logs(restaurant_id);
CREATE INDEX idx_ai_logs_post ON ai_generation_logs(social_post_id);
CREATE INDEX idx_ai_logs_created ON ai_generation_logs(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS) - SUPABASE
-- ============================================

-- Enable RLS on all tables
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_logs ENABLE ROW LEVEL SECURITY;

-- Policies: Restaurant owners only see their own data
-- Note: Estas policies están simplificadas para desarrollo
-- En producción, descomentar y ajustar según auth.uid()

-- CREATE POLICY social_connections_isolation ON social_connections
--   FOR ALL USING (restaurant_id IN (
--     SELECT r.id FROM restaurants r
--     INNER JOIN users u ON u.id = auth.uid()
--     WHERE r.owner_user_id = u.id OR u.role = 'super_admin'
--   ));

-- CREATE POLICY social_posts_isolation ON social_posts
--   FOR ALL USING (restaurant_id IN (
--     SELECT r.id FROM restaurants r
--     INNER JOIN users u ON u.id = auth.uid()
--     WHERE r.owner_user_id = u.id OR u.role = 'super_admin'
--   ));

-- CREATE POLICY social_publications_isolation ON social_post_publications
--   FOR ALL USING (social_post_id IN (
--     SELECT sp.id FROM social_posts sp
--     INNER JOIN restaurants r ON r.id = sp.restaurant_id
--     INNER JOIN users u ON u.id = auth.uid()
--     WHERE r.owner_user_id = u.id OR u.role = 'super_admin'
--   ));

-- CREATE POLICY marketing_links_isolation ON marketing_links
--   FOR ALL USING (restaurant_id IN (
--     SELECT r.id FROM restaurants r
--     INNER JOIN users u ON u.id = auth.uid()
--     WHERE r.owner_user_id = u.id OR u.role = 'super_admin'
--   ));

-- Link events: public read for tracking (no auth required)
CREATE POLICY link_events_public_insert ON link_events
  FOR INSERT WITH CHECK (true);

-- CREATE POLICY link_events_owner_read ON link_events
--   FOR SELECT USING (marketing_link_id IN (
--     SELECT ml.id FROM marketing_links ml
--     INNER JOIN restaurants r ON r.id = ml.restaurant_id
--     INNER JOIN users u ON u.id = auth.uid()
--     WHERE r.owner_user_id = u.id OR u.role = 'super_admin'
--   ));

-- CREATE POLICY ai_logs_isolation ON ai_generation_logs
--   FOR ALL USING (restaurant_id IN (
--     SELECT r.id FROM restaurants r
--     INNER JOIN users u ON u.id = auth.uid()
--     WHERE r.owner_user_id = u.id OR u.role = 'super_admin'
--   ));

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_social_connections_updated_at BEFORE UPDATE ON social_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON social_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_publications_updated_at BEFORE UPDATE ON social_post_publications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_links_updated_at BEFORE UPDATE ON marketing_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Increment link clicks count
CREATE OR REPLACE FUNCTION increment_link_clicks()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.event_type = 'click' THEN
    UPDATE marketing_links
    SET clicks_count = clicks_count + 1
    WHERE id = NEW.marketing_link_id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER increment_link_clicks_trigger AFTER INSERT ON link_events
  FOR EACH ROW EXECUTE FUNCTION increment_link_clicks();

-- Function: Increment order count on link
CREATE OR REPLACE FUNCTION increment_link_orders()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.event_type IN ('order_placed', 'order_paid') THEN
    UPDATE marketing_links
    SET orders_count = orders_count + 1
    WHERE id = NEW.marketing_link_id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER increment_link_orders_trigger AFTER INSERT ON link_events
  FOR EACH ROW EXECUTE FUNCTION increment_link_orders();

-- ============================================
-- STORAGE BUCKETS (Supabase)
-- ============================================
-- Run these commands in Supabase Dashboard > Storage:

-- CREATE BUCKET social_media_posts (public: false)
-- CREATE BUCKET qr_codes (public: true)

-- Policies for social_media_posts bucket:
-- - Allow authenticated users to upload (INSERT)
-- - Allow restaurant owners to read their posts (SELECT)
-- - Allow restaurant owners to delete their posts (DELETE)

-- ============================================
-- SEED DATA (optional - for testing)
-- ============================================

-- Insert a test marketing link (example)
-- INSERT INTO marketing_links (restaurant_id, slug, destination_url, title, utm_source, utm_medium)
-- VALUES (
--   'your-restaurant-uuid',
--   'summer-promo-2025',
--   '/order/summer-promo-2025',
--   'Summer Special - 20% OFF',
--   'instagram',
--   'post'
-- );

-- ============================================
-- NOTES & BEST PRACTICES
-- ============================================

/*
1. ENCRYPTION:
   - access_token y refresh_token deben encriptarse en la capa de aplicación (NestJS)
   - Usar pgcrypto o un KMS externo (AWS KMS, Google Cloud KMS)
   - NUNCA guardar tokens en plaintext

2. TOKEN REFRESH:
   - Implementar un CRON job que revise tokens próximos a expirar
   - Usar refresh_token para obtener nuevos access_token
   - Marcar conexión como 'expired' si falla el refresh

3. RATE LIMITS:
   - Meta API: 200 calls/hour por usuario
   - Implementar throttling en backend
   - Usar queue (Bull/BullMQ) para publicaciones programadas

4. TRACKING:
   - link_events es append-only (no UPDATE/DELETE)
   - Particionar por fecha si el volumen es muy alto
   - Usar índices compuestos para queries de analytics

5. GDPR/PRIVACY:
   - Anonimizar ip_address después de 90 días
   - Permitir eliminación de datos de usuario
   - Documentar políticas de retención

6. BACKUP:
   - Supabase hace backups automáticos
   - Para producción: habilitar Point-in-Time Recovery (PITR)
*/
