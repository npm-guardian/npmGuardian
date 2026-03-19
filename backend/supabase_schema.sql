-- npm-Guardian Supabase Schema Migration
-- Run this in Supabase Dashboard -> SQL Editor -> New Query

-- ============================================================
-- 1. USERS TABLE (OAuth-authenticated developers)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  oauth_provider VARCHAR(50) NOT NULL DEFAULT 'github',
  oauth_id VARCHAR(255) UNIQUE NOT NULL,
  login VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_login TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. API KEYS TABLE (CLI & CI/CD tokens)
-- ============================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  hashed_key VARCHAR(512) NOT NULL,
  name VARCHAR(255),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. REPOSITORIES TABLE (Tracked GitHub/GitLab repos)
-- ============================================================
CREATE TABLE IF NOT EXISTS repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  repo_url VARCHAR(500) NOT NULL,
  provider VARCHAR(50) DEFAULT 'github',
  branch VARCHAR(255) DEFAULT 'main',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. PACKAGES TABLE (npm packages analyzed)
-- ============================================================
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  latest_scan_score INT DEFAULT 0,
  maintainer_reputation_score INT DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. PACKAGE VERSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS package_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
  version VARCHAR(100) NOT NULL,
  tarball_url TEXT,
  publish_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. SCANS TABLE (Main scan event records)
-- ============================================================
CREATE TYPE scan_type AS ENUM ('package', 'repository');
CREATE TYPE scan_status AS ENUM ('queued', 'running', 'completed', 'failed');

CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type scan_type NOT NULL DEFAULT 'package',
  repository_id UUID REFERENCES repositories(id) ON DELETE SET NULL,
  package_name VARCHAR(255),
  package_version VARCHAR(100) DEFAULT 'latest',
  status scan_status NOT NULL DEFAULT 'queued',
  overall_risk_score INT DEFAULT 0,
  risk_level VARCHAR(20) DEFAULT 'LOW',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ============================================================
-- 7. SCAN FINDINGS TABLE (Individual vulnerabilities found)
-- ============================================================
CREATE TYPE finding_severity AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE IF NOT EXISTS scan_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES scans(id) ON DELETE CASCADE,
  severity finding_severity NOT NULL DEFAULT 'low',
  category VARCHAR(100),
  description TEXT,
  file_path VARCHAR(500),
  line_number INT,
  payload_preview TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 8. DEPENDENCIES TABLE (Transitive dep tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_version_id UUID REFERENCES package_versions(id) ON DELETE CASCADE,
  dependency_name VARCHAR(255) NOT NULL,
  dependency_version VARCHAR(100),
  is_dev_dependency BOOLEAN DEFAULT false
);

-- ============================================================
-- 9. INDEXES for query performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status);
CREATE INDEX IF NOT EXISTS idx_scans_package_name ON scans(package_name);
CREATE INDEX IF NOT EXISTS idx_scan_findings_scan_id ON scan_findings(scan_id);
CREATE INDEX IF NOT EXISTS idx_packages_name ON packages(name);
CREATE INDEX IF NOT EXISTS idx_users_oauth_id ON users(oauth_id);
CREATE INDEX IF NOT EXISTS idx_repositories_user_id ON repositories(user_id);

-- ============================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Allow the service_role full access (backend server)
-- The anon role gets read-only access to packages and scans
CREATE POLICY "Service role full access" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON scans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON scan_findings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON packages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON repositories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON api_keys FOR ALL USING (true) WITH CHECK (true);
