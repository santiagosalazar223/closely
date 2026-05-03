-- ============================================================================
-- Migration 002: Analytics events, user feedback, and subscriptions
-- ============================================================================

-- ─── Events table (lightweight analytics / audit log) ───────────────────────
CREATE TABLE IF NOT EXISTS public.events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  properties  JSONB DEFAULT '{}'::jsonb,
  path        TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS events_user_id_idx ON public.events(user_id);
CREATE INDEX IF NOT EXISTS events_name_idx    ON public.events(name);
CREATE INDEX IF NOT EXISTS events_created_idx ON public.events(created_at DESC);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_insert_anyone"     ON public.events;
DROP POLICY IF EXISTS "events_select_own"        ON public.events;

-- Anyone (anon or authenticated) can insert events from the client
CREATE POLICY "events_insert_anyone" ON public.events
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Users can read their own events; service role can read everything
CREATE POLICY "events_select_own" ON public.events
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());


-- ─── Feedback table (user-submitted product feedback) ───────────────────────
CREATE TABLE IF NOT EXISTS public.feedback (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating      SMALLINT CHECK (rating BETWEEN 1 AND 5),
  category    TEXT,
  message     TEXT NOT NULL,
  page        TEXT,
  email       TEXT,
  resolved    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS feedback_created_idx ON public.feedback(created_at DESC);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feedback_insert_anyone" ON public.feedback;
DROP POLICY IF EXISTS "feedback_select_own"    ON public.feedback;

CREATE POLICY "feedback_insert_anyone" ON public.feedback
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "feedback_select_own" ON public.feedback
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());


-- ─── Subscriptions table (user plan tracking) ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan            TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'enterprise')),
  role            TEXT NOT NULL CHECK (role IN ('buyer', 'seller')),
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  current_period_end TIMESTAMPTZ,
  trial_ends_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_plan_idx    ON public.subscriptions(plan);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_own" ON public.subscriptions;

CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "subscriptions_insert_own" ON public.subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "subscriptions_update_own" ON public.subscriptions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());


-- ─── Helper: aggregated public stats for landing page ───────────────────────
CREATE OR REPLACE VIEW public.platform_stats AS
SELECT
  (SELECT COUNT(*) FROM public.profiles)             AS total_users,
  (SELECT COUNT(*) FROM public.businesses
     WHERE status = 'active')                        AS active_listings,
  (SELECT COALESCE(SUM(asking_price), 0)::BIGINT
     FROM public.businesses
     WHERE status = 'active')                        AS total_market_value,
  (SELECT COUNT(*) FROM public.events
     WHERE name = 'valuation_completed'
     AND created_at > NOW() - INTERVAL '30 days')    AS valuations_last_30d;

GRANT SELECT ON public.platform_stats TO anon, authenticated;
