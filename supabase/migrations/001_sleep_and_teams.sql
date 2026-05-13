-- Phase 1: Schema for sleep records, team members, and seed-data support
-- Run this in the Supabase SQL Editor

-- 1. Alter profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_seed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS biometric_tier text NOT NULL DEFAULT 'none';

-- 2. Alter team_metadata table
ALTER TABLE team_metadata
  ADD COLUMN IF NOT EXISTS is_seed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS join_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS created_by text REFERENCES profiles(pubkey),
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- 3. Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_pda   text NOT NULL REFERENCES team_metadata(team_pda) ON DELETE CASCADE,
  pubkey     text NOT NULL REFERENCES profiles(pubkey) ON DELETE CASCADE,
  joined_at  timestamptz DEFAULT now(),
  UNIQUE(team_pda, pubkey)
);

-- Enforce max 3 members per team
CREATE OR REPLACE FUNCTION check_team_member_limit()
RETURNS trigger AS $$
BEGIN
  IF (SELECT count(*) FROM team_members WHERE team_pda = NEW.team_pda) >= 3 THEN
    RAISE EXCEPTION 'Team already has 3 members';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_team_limit ON team_members;
CREATE TRIGGER enforce_team_limit
  BEFORE INSERT ON team_members
  FOR EACH ROW EXECUTE FUNCTION check_team_member_limit();

-- 4. Create sleep_records table
CREATE TABLE IF NOT EXISTS sleep_records (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pubkey         text NOT NULL REFERENCES profiles(pubkey) ON DELETE CASCADE,
  sleep_date     date NOT NULL,
  duration_ms    bigint NOT NULL,
  hours          numeric(4,2) NOT NULL,
  zzzs           numeric(6,2) NOT NULL,
  all_tribe_hit  boolean NOT NULL DEFAULT false,
  tx_sig         text,
  is_seed        boolean NOT NULL DEFAULT false,
  created_at     timestamptz DEFAULT now(),
  week_start     date NOT NULL,
  UNIQUE(pubkey, sleep_date)
);

CREATE INDEX IF NOT EXISTS idx_sleep_records_week ON sleep_records(week_start, pubkey);
CREATE INDEX IF NOT EXISTS idx_sleep_records_pubkey_date ON sleep_records(pubkey, sleep_date DESC);

-- 5. RLS policies (open for anon-key era — tighten before production, see PRODUCTION_READINESS.md)

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_team_members" ON team_members FOR SELECT USING (true);
CREATE POLICY "anon_insert_team_members" ON team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_delete_team_members" ON team_members FOR DELETE USING (true);

ALTER TABLE sleep_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_sleep_records" ON sleep_records FOR SELECT USING (true);
CREATE POLICY "anon_insert_sleep_records" ON sleep_records FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_sleep_records" ON sleep_records FOR UPDATE USING (true);
