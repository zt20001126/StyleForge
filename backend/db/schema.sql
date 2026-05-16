-- StyleForge local PostgreSQL schema.
-- Execute inside the target database, for example: psql -d styleforge_dev -f backend/db/schema.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS trend_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category varchar(100) NOT NULL CHECK (length(trim(category)) > 0),
  target_user varchar(255) NOT NULL CHECK (length(trim(target_user)) > 0),
  scene varchar(255) NOT NULL CHECK (length(trim(scene)) > 0),
  style varchar(255) NOT NULL CHECK (length(trim(style)) > 0),
  analysis_prompt text NOT NULL,
  raw_response text,
  result_json jsonb,
  base_prompt text,
  status varchar(20) NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'success', 'failed')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (status <> 'success' OR result_json IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_trend_analyses_status ON trend_analyses (status);
CREATE INDEX IF NOT EXISTS idx_trend_analyses_created_at ON trend_analyses (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trend_analyses_status_created_at ON trend_analyses (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trend_analyses_result_json ON trend_analyses USING gin (result_json);

DROP TRIGGER IF EXISTS trg_trend_analyses_updated_at ON trend_analyses;
CREATE TRIGGER trg_trend_analyses_updated_at
BEFORE UPDATE ON trend_analyses
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS design_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES trend_analyses(id) ON DELETE RESTRICT,
  selection_json jsonb NOT NULL,
  design_summary text NOT NULL,
  style_description text,
  recommended_direction varchar(255),
  popularity_score integer CHECK (popularity_score IS NULL OR popularity_score BETWEEN 0 AND 100),
  ai_prompt text NOT NULL,
  warnings jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_design_plans_analysis_id ON design_plans (analysis_id);
CREATE INDEX IF NOT EXISTS idx_design_plans_is_favorite ON design_plans (is_favorite);
CREATE INDEX IF NOT EXISTS idx_design_plans_created_at ON design_plans (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_design_plans_favorite_created_at ON design_plans (is_favorite, created_at DESC);

DROP TRIGGER IF EXISTS trg_design_plans_updated_at ON design_plans;
CREATE TRIGGER trg_design_plans_updated_at
BEFORE UPDATE ON design_plans
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS generation_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid REFERENCES trend_analyses(id) ON DELETE RESTRICT,
  design_plan_id uuid REFERENCES design_plans(id) ON DELETE RESTRICT,
  task_type varchar(30) NOT NULL CHECK (task_type IN ('text_to_image', 'image_to_image', 'text_to_video', 'pattern')),
  prompt text NOT NULL,
  negative_prompt text,
  model_name varchar(100),
  request_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  response_json jsonb,
  status varchar(20) NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'success', 'failed')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  CHECK (analysis_id IS NOT NULL OR design_plan_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_generation_tasks_status ON generation_tasks (status);
CREATE INDEX IF NOT EXISTS idx_generation_tasks_task_type ON generation_tasks (task_type);
CREATE INDEX IF NOT EXISTS idx_generation_tasks_created_at ON generation_tasks (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_tasks_design_plan_created_at ON generation_tasks (design_plan_id, created_at DESC);

DROP TRIGGER IF EXISTS trg_generation_tasks_updated_at ON generation_tasks;
CREATE TRIGGER trg_generation_tasks_updated_at
BEFORE UPDATE ON generation_tasks
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS generated_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_task_id uuid NOT NULL REFERENCES generation_tasks(id) ON DELETE RESTRICT,
  analysis_id uuid REFERENCES trend_analyses(id) ON DELETE RESTRICT,
  design_plan_id uuid REFERENCES design_plans(id) ON DELETE RESTRICT,
  asset_type varchar(30) NOT NULL CHECK (asset_type IN ('image', 'video', 'document')),
  storage_path text NOT NULL,
  public_url text,
  mime_type varchar(100),
  file_size_bytes bigint CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0),
  width integer CHECK (width IS NULL OR width > 0),
  height integer CHECK (height IS NULL OR height > 0),
  duration_seconds numeric(10, 2) CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_generated_assets_asset_type ON generated_assets (asset_type);
CREATE INDEX IF NOT EXISTS idx_generated_assets_is_favorite ON generated_assets (is_favorite);
CREATE INDEX IF NOT EXISTS idx_generated_assets_created_at ON generated_assets (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_assets_design_plan_created_at ON generated_assets (design_plan_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_assets_type_favorite_created_at ON generated_assets (asset_type, is_favorite, created_at DESC);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone varchar(20) NOT NULL CHECK (phone ~ '^1[3-9][0-9]{9}$'),
  password_hash varchar(255) NOT NULL,
  username varchar(50) NOT NULL,
  avatar_url varchar(255) NOT NULL,
  role varchar(30) NOT NULL DEFAULT 'designer',
  status varchar(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON users (phone);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS sms_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone varchar(20) NOT NULL,
  code_hash varchar(255) NOT NULL,
  purpose varchar(20) NOT NULL CHECK (purpose IN ('login', 'register')),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  attempt_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sms_codes_phone_purpose_created ON sms_codes (phone, purpose, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_codes_expires_at ON sms_codes (expires_at);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash varchar(255) NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_refresh_token_hash ON auth_sessions (refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions (expires_at);
