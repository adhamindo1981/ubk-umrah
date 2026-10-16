-- ==============================================================================
-- UBK Umrah - Database Hardening & Row Level Security (RLS) Policies
-- Enables Row-Level Security (RLS) across all tables in PostgreSQL / Supabase / Neon
-- ==============================================================================

-- 1. Enable RLS on all models
ALTER TABLE IF EXISTS "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Client" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Reward" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "PayoutRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "PosterTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "MarketerPoster" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "SystemSetting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "UmrahPackage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "PilgrimPhoto" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "MarketerLead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "DailyMission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "LeadRoulette" ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Helper function to extract authenticated user's ID and role from JWT or session
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION current_app_user_id() RETURNS integer AS $$
BEGIN
  RETURN COALESCE(
    NULLIF(current_setting('request.jwt.claim.sub', true), '')::integer,
    NULLIF(current_setting('app.current_user_id', true), '')::integer
  );
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION is_app_admin() RETURNS boolean AS $$
BEGIN
  RETURN (
    current_setting('request.jwt.claim.role', true) = 'ADMIN' OR
    current_setting('app.current_user_role', true) = 'ADMIN' OR
    current_user IN ('postgres', 'service_role', 'neondb_owner')
  );
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql STABLE;

-- ------------------------------------------------------------------------------
-- 2. POLICIES FOR "User" TABLE
-- Admins have full access. Marketers can read their own profile and direct downlines.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins full access on User" ON "User";
CREATE POLICY "Admins full access on User" ON "User"
  FOR ALL
  USING (is_app_admin());

DROP POLICY IF EXISTS "Marketers can view own profile and submarketers" ON "User";
CREATE POLICY "Marketers can view own profile and submarketers" ON "User"
  FOR SELECT
  USING (
    id = current_app_user_id() OR
    "parentId" = current_app_user_id()
  );

DROP POLICY IF EXISTS "Marketers can update own profile" ON "User";
CREATE POLICY "Marketers can update own profile" ON "User"
  FOR UPDATE
  USING (id = current_app_user_id())
  WITH CHECK (id = current_app_user_id());

-- ------------------------------------------------------------------------------
-- 3. POLICIES FOR "Order" TABLE
-- Admins full access. Marketers only see orders attributed to their ID.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins full access on Order" ON "Order";
CREATE POLICY "Admins full access on Order" ON "Order"
  FOR ALL
  USING (is_app_admin());

DROP POLICY IF EXISTS "Marketers can read assigned orders" ON "Order";
CREATE POLICY "Marketers can read assigned orders" ON "Order"
  FOR SELECT
  USING ("marketerId" = current_app_user_id());

-- ------------------------------------------------------------------------------
-- 4. POLICIES FOR "Client" TABLE
-- Pilgrims data access: Admins have full access. Marketers can read clients who booked with them.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins full access on Client" ON "Client";
CREATE POLICY "Admins full access on Client" ON "Client"
  FOR ALL
  USING (is_app_admin());

DROP POLICY IF EXISTS "Marketers view their clients" ON "Client";
CREATE POLICY "Marketers view their clients" ON "Client"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Order"
      WHERE "Order"."clientId" = "Client".id
      AND "Order"."marketerId" = current_app_user_id()
    )
  );

-- ------------------------------------------------------------------------------
-- 5. POLICIES FOR "Reward" TABLE
-- Marketers can only read their own commission rewards. No direct client modifications.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins full access on Reward" ON "Reward";
CREATE POLICY "Admins full access on Reward" ON "Reward"
  FOR ALL
  USING (is_app_admin());

DROP POLICY IF EXISTS "Marketers read own rewards" ON "Reward";
CREATE POLICY "Marketers read own rewards" ON "Reward"
  FOR SELECT
  USING ("marketerId" = current_app_user_id());

-- ------------------------------------------------------------------------------
-- 6. POLICIES FOR "PayoutRequest" TABLE
-- Marketers can read their own payout history and submit new requests for themselves.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins full access on PayoutRequest" ON "PayoutRequest";
CREATE POLICY "Admins full access on PayoutRequest" ON "PayoutRequest"
  FOR ALL
  USING (is_app_admin());

DROP POLICY IF EXISTS "Marketers read own payouts" ON "PayoutRequest";
CREATE POLICY "Marketers read own payouts" ON "PayoutRequest"
  FOR SELECT
  USING ("marketerId" = current_app_user_id());

DROP POLICY IF EXISTS "Marketers insert own payout request" ON "PayoutRequest";
CREATE POLICY "Marketers insert own payout request" ON "PayoutRequest"
  FOR INSERT
  WITH CHECK ("marketerId" = current_app_user_id() AND status = 'PENDING');

-- ------------------------------------------------------------------------------
-- 7. POLICIES FOR "PosterTemplate" & "MarketerPoster"
-- Templates are readable by all authenticated marketers. Clean master artwork is protected.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins full access on PosterTemplate" ON "PosterTemplate";
CREATE POLICY "Admins full access on PosterTemplate" ON "PosterTemplate"
  FOR ALL
  USING (is_app_admin());

DROP POLICY IF EXISTS "Marketers read poster templates" ON "PosterTemplate";
CREATE POLICY "Marketers read poster templates" ON "PosterTemplate"
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins full access on MarketerPoster" ON "MarketerPoster";
CREATE POLICY "Admins full access on MarketerPoster" ON "MarketerPoster"
  FOR ALL
  USING (is_app_admin());

DROP POLICY IF EXISTS "Marketers manage own purchased posters" ON "MarketerPoster";
CREATE POLICY "Marketers manage own purchased posters" ON "MarketerPoster"
  FOR ALL
  USING ("marketerId" = current_app_user_id());

DROP POLICY IF EXISTS "Public view featured posters on marketer page" ON "MarketerPoster";
CREATE POLICY "Public view featured posters on marketer page" ON "MarketerPoster"
  FOR SELECT
  USING ("isFeaturedOnPage" = true AND "paymentStatus" = 'APPROVED');

-- ------------------------------------------------------------------------------
-- 8. POLICIES FOR "UmrahPackage", "PilgrimPhoto", "SystemSetting"
-- Active packages and photos are readable by public/pilgrims; modifications strictly Admin.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins full access on UmrahPackage" ON "UmrahPackage";
CREATE POLICY "Admins full access on UmrahPackage" ON "UmrahPackage"
  FOR ALL
  USING (is_app_admin());

DROP POLICY IF EXISTS "Public read active Umrah packages" ON "UmrahPackage";
CREATE POLICY "Public read active Umrah packages" ON "UmrahPackage"
  FOR SELECT
  USING ("isActive" = true);

DROP POLICY IF EXISTS "Admins full access on PilgrimPhoto" ON "PilgrimPhoto";
CREATE POLICY "Admins full access on PilgrimPhoto" ON "PilgrimPhoto"
  FOR ALL
  USING (is_app_admin());

DROP POLICY IF EXISTS "Public read active gallery photos" ON "PilgrimPhoto";
CREATE POLICY "Public read active gallery photos" ON "PilgrimPhoto"
  FOR SELECT
  USING ("isActive" = true);

DROP POLICY IF EXISTS "Admins full access on SystemSetting" ON "SystemSetting";
CREATE POLICY "Admins full access on SystemSetting" ON "SystemSetting"
  FOR ALL
  USING (is_app_admin());

DROP POLICY IF EXISTS "Public read non-sensitive system settings" ON "SystemSetting";
CREATE POLICY "Public read non-sensitive system settings" ON "SystemSetting"
  FOR SELECT
  USING ("key" LIKE 'company%');

-- ------------------------------------------------------------------------------
-- 9. POLICIES FOR "MarketerLead", "DailyMission", "LeadRoulette"
-- Isolates leads and missions per marketer. Manages lead roulette pool.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins full access on MarketerLead" ON "MarketerLead";
CREATE POLICY "Admins full access on MarketerLead" ON "MarketerLead"
  FOR ALL
  USING (is_app_admin());

DROP POLICY IF EXISTS "Marketers manage own leads" ON "MarketerLead";
CREATE POLICY "Marketers manage own leads" ON "MarketerLead"
  FOR ALL
  USING ("marketerId" = current_app_user_id());

DROP POLICY IF EXISTS "Admins full access on DailyMission" ON "DailyMission";
CREATE POLICY "Admins full access on DailyMission" ON "DailyMission"
  FOR ALL
  USING (is_app_admin());

DROP POLICY IF EXISTS "Marketers manage own missions" ON "DailyMission";
CREATE POLICY "Marketers manage own missions" ON "DailyMission"
  FOR ALL
  USING ("marketerId" = current_app_user_id());

DROP POLICY IF EXISTS "Admins full access on LeadRoulette" ON "LeadRoulette";
CREATE POLICY "Admins full access on LeadRoulette" ON "LeadRoulette"
  FOR ALL
  USING (is_app_admin());

DROP POLICY IF EXISTS "Marketers view roulette pool" ON "LeadRoulette";
CREATE POLICY "Marketers view roulette pool" ON "LeadRoulette"
  FOR SELECT
  USING (status = 'AVAILABLE' OR "claimedById" = current_app_user_id());

DROP POLICY IF EXISTS "Marketers claim roulette leads" ON "LeadRoulette";
CREATE POLICY "Marketers claim roulette leads" ON "LeadRoulette"
  FOR UPDATE
  USING (status = 'AVAILABLE')
  WITH CHECK ("claimedById" = current_app_user_id() AND status = 'CLAIMED');
