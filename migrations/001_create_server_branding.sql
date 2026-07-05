-- Migration: Create arx_server_branding table for white-label customization
-- Adds per-guild branding settings (logo, colors, custom CSS, white-label mode)

CREATE SCHEMA IF NOT EXISTS aegis;

CREATE TABLE IF NOT EXISTS aegis.arx_server_branding (
  id              BIGSERIAL PRIMARY KEY,
  discord_guild_id TEXT UNIQUE NOT NULL,
  
  -- White-label toggle
  is_white_label  BOOLEAN NOT NULL DEFAULT false,
  hide_branding   BOOLEAN NOT NULL DEFAULT false,
  
  -- Custom branding
  brand_name      TEXT DEFAULT NULL,
  logo_url        TEXT DEFAULT NULL,
  banner_url      TEXT DEFAULT NULL,
  
  -- Color scheme (hex values)
  primary_color   TEXT DEFAULT NULL,
  secondary_color TEXT DEFAULT NULL,
  accent_color    TEXT DEFAULT NULL,
  
  -- Advanced
  custom_css      TEXT DEFAULT NULL,
  bot_prefix      TEXT DEFAULT NULL,
  
  -- Metadata
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_server_branding_guild ON aegis.arx_server_branding(discord_guild_id);
