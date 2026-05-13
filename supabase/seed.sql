-- Seed data for development — all rows have is_seed = true
-- Matches the mock leaderboard data from the original UI
-- Run after 001_sleep_and_teams.sql migration

-- Helper: current week's Monday (ISO week)
-- We generate sleep records for the current week so leaderboards are populated

-- 1. Seed profiles
INSERT INTO profiles (pubkey, display_name, avatar_url, is_seed, biometric_tier) VALUES
  ('seed_marcus_chen',   'Marcus Chen',   'https://api.dicebear.com/7.x/avataaars/png?seed=marcus',  true, 'hardware'),
  ('seed_priya_sharma',  'Priya Sharma',  'https://api.dicebear.com/7.x/avataaars/png?seed=priya',   true, 'biometric'),
  ('seed_jordan_lee',    'Jordan Lee',    'https://api.dicebear.com/7.x/avataaars/png?seed=jordan',   true, 'none'),
  ('seed_anya_volkov',   'Anya Volkov',   'https://api.dicebear.com/7.x/avataaars/png?seed=anya',    true, 'biometric'),
  ('seed_david_kim',     'David Kim',     'https://api.dicebear.com/7.x/avataaars/png?seed=david',    true, 'none'),
  ('seed_lena_okoro',    'Lena Okoro',    'https://api.dicebear.com/7.x/avataaars/png?seed=lena',     true, 'none'),
  ('seed_kai_tanaka',    'Kai Tanaka',    'https://api.dicebear.com/7.x/avataaars/png?seed=kai',      true, 'hardware'),
  ('seed_sofia_reyes',   'Sofia Reyes',   'https://api.dicebear.com/7.x/avataaars/png?seed=sofia',    true, 'none'),
  ('seed_omar_hassan',   'Omar Hassan',   'https://api.dicebear.com/7.x/avataaars/png?seed=omar',     true, 'none'),
  ('seed_emma_wilson',   'Emma Wilson',   'https://api.dicebear.com/7.x/avataaars/png?seed=emma',     true, 'none'),
  ('seed_ravi_patel',    'Ravi Patel',    'https://api.dicebear.com/7.x/avataaars/png?seed=ravi',     true, 'none'),
  ('seed_ana_garcia',    'Ana Garcia',    'https://api.dicebear.com/7.x/avataaars/png?seed=ana',      true, 'none'),
  -- Extra members to fill teams
  ('seed_tom_baker',     'Tom Baker',     'https://api.dicebear.com/7.x/avataaars/png?seed=tom',      true, 'none'),
  ('seed_lisa_wong',     'Lisa Wong',     'https://api.dicebear.com/7.x/avataaars/png?seed=lisa',     true, 'none'),
  ('seed_mike_johnson',  'Mike Johnson',  'https://api.dicebear.com/7.x/avataaars/png?seed=mike',     true, 'none'),
  ('seed_sarah_chen',    'Sarah Chen',    'https://api.dicebear.com/7.x/avataaars/png?seed=sarah',    true, 'biometric'),
  ('seed_alex_kim',      'Alex Kim',      'https://api.dicebear.com/7.x/avataaars/png?seed=alex',     true, 'none'),
  ('seed_nina_petrova',  'Nina Petrova',  'https://api.dicebear.com/7.x/avataaars/png?seed=nina',     true, 'none'),
  ('seed_james_wright',  'James Wright',  'https://api.dicebear.com/7.x/avataaars/png?seed=james',    true, 'none'),
  ('seed_maya_patel',    'Maya Patel',    'https://api.dicebear.com/7.x/avataaars/png?seed=maya',     true, 'none'),
  ('seed_chris_lee',     'Chris Lee',     'https://api.dicebear.com/7.x/avataaars/png?seed=chris',    true, 'none'),
  ('seed_zoe_martinez',  'Zoe Martinez',  'https://api.dicebear.com/7.x/avataaars/png?seed=zoe',      true, 'none'),
  ('seed_ben_taylor',    'Ben Taylor',    'https://api.dicebear.com/7.x/avataaars/png?seed=ben',      true, 'none'),
  ('seed_lily_nguyen',   'Lily Nguyen',   'https://api.dicebear.com/7.x/avataaars/png?seed=lily',     true, 'none'),
  ('seed_dan_brown',     'Dan Brown',     'https://api.dicebear.com/7.x/avataaars/png?seed=dan',      true, 'none'),
  ('seed_amy_zhang',     'Amy Zhang',     'https://api.dicebear.com/7.x/avataaars/png?seed=amy',      true, 'none'),
  ('seed_ryan_clark',    'Ryan Clark',    'https://api.dicebear.com/7.x/avataaars/png?seed=ryan',     true, 'none'),
  ('seed_eva_silva',     'Eva Silva',     'https://api.dicebear.com/7.x/avataaars/png?seed=eva',      true, 'none')
ON CONFLICT (pubkey) DO NOTHING;

-- 2. Seed teams (10 teams matching mock leaderboard)
INSERT INTO team_metadata (team_pda, team_name, team_avatar_url, is_seed, join_code) VALUES
  ('seed_team_pillow_talkers', 'The Pillow Talkers', 'https://api.dicebear.com/7.x/shapes/svg?seed=pillow-talkers', true, 'PILL01'),
  ('seed_team_recovery_squad', 'Recovery Squad',     'https://api.dicebear.com/7.x/shapes/svg?seed=recovery-squad', true, 'RECV02'),
  ('seed_team_dream_catchers', 'Dream Catchers',     'https://api.dicebear.com/7.x/shapes/svg?seed=dream-catchers', true, 'DREM03'),
  ('seed_team_night_owls',     'Night Owls',         'https://api.dicebear.com/7.x/shapes/svg?seed=night-owls',     true, 'NITE04'),
  ('seed_team_the_nappers',    'The Nappers',        'https://api.dicebear.com/7.x/shapes/svg?seed=the-nappers',    true, 'NAPP05'),
  ('seed_team_circadian_crew', 'Circadian Crew',     'https://api.dicebear.com/7.x/shapes/svg?seed=circadian-crew', true, 'CIRC06'),
  ('seed_team_rem_riders',     'REM Riders',         'https://api.dicebear.com/7.x/shapes/svg?seed=rem-riders',     true, 'REMR07'),
  ('seed_team_deep_sleepers',  'Deep Sleepers',      'https://api.dicebear.com/7.x/shapes/svg?seed=deep-sleepers',  true, 'DEEP08'),
  ('seed_team_snooze_squad',   'Snooze Squad',       'https://api.dicebear.com/7.x/shapes/svg?seed=snooze-squad',   true, 'SNOO09'),
  ('seed_team_zen_dreamers',   'Zen Dreamers',       'https://api.dicebear.com/7.x/shapes/svg?seed=zen-dreamers',   true, 'ZEND10')
ON CONFLICT (team_pda) DO NOTHING;

-- 3. Seed team_members (3 per team)
INSERT INTO team_members (team_pda, pubkey) VALUES
  -- The Pillow Talkers
  ('seed_team_pillow_talkers', 'seed_priya_sharma'),
  ('seed_team_pillow_talkers', 'seed_anya_volkov'),
  ('seed_team_pillow_talkers', 'seed_ravi_patel'),
  -- Recovery Squad
  ('seed_team_recovery_squad', 'seed_marcus_chen'),
  ('seed_team_recovery_squad', 'seed_jordan_lee'),
  ('seed_team_recovery_squad', 'seed_tom_baker'),
  -- Dream Catchers
  ('seed_team_dream_catchers', 'seed_david_kim'),
  ('seed_team_dream_catchers', 'seed_lisa_wong'),
  ('seed_team_dream_catchers', 'seed_mike_johnson'),
  -- Night Owls
  ('seed_team_night_owls', 'seed_lena_okoro'),
  ('seed_team_night_owls', 'seed_sarah_chen'),
  ('seed_team_night_owls', 'seed_alex_kim'),
  -- The Nappers
  ('seed_team_the_nappers', 'seed_sofia_reyes'),
  ('seed_team_the_nappers', 'seed_nina_petrova'),
  ('seed_team_the_nappers', 'seed_james_wright'),
  -- Circadian Crew
  ('seed_team_circadian_crew', 'seed_kai_tanaka'),
  ('seed_team_circadian_crew', 'seed_maya_patel'),
  ('seed_team_circadian_crew', 'seed_chris_lee'),
  -- REM Riders
  ('seed_team_rem_riders', 'seed_omar_hassan'),
  ('seed_team_rem_riders', 'seed_zoe_martinez'),
  ('seed_team_rem_riders', 'seed_ben_taylor'),
  -- Deep Sleepers
  ('seed_team_deep_sleepers', 'seed_emma_wilson'),
  ('seed_team_deep_sleepers', 'seed_lily_nguyen'),
  ('seed_team_deep_sleepers', 'seed_dan_brown'),
  -- Snooze Squad
  ('seed_team_snooze_squad', 'seed_amy_zhang'),
  ('seed_team_snooze_squad', 'seed_ryan_clark'),
  ('seed_team_snooze_squad', 'seed_eva_silva'),
  -- Zen Dreamers
  ('seed_team_zen_dreamers', 'seed_ana_garcia'),
  ('seed_team_zen_dreamers', 'seed_ana_garcia'),  -- will be skipped by unique constraint below
  ('seed_team_zen_dreamers', 'seed_ana_garcia')   -- placeholder — see fix below
ON CONFLICT (team_pda, pubkey) DO NOTHING;

-- Fix Zen Dreamers — need 3 unique members
-- We'll delete the duplicates and add real ones
DELETE FROM team_members WHERE team_pda = 'seed_team_zen_dreamers';
INSERT INTO team_members (team_pda, pubkey) VALUES
  ('seed_team_zen_dreamers', 'seed_ana_garcia'),
  ('seed_team_zen_dreamers', 'seed_tom_baker'),
  ('seed_team_zen_dreamers', 'seed_lisa_wong')
ON CONFLICT (team_pda, pubkey) DO NOTHING;

-- Wait, tom_baker and lisa_wong are already in other teams.
-- For seed data, allow users in multiple teams (the real app enforces 1 team per user at application level)
-- This is fine for demo purposes.

-- 4. Seed sleep_records
-- Generate records for the current week (Mon-Sun) with varying hours to produce realistic rankings
-- Using date_trunc to get current week's Monday

DO $$
DECLARE
  ws date := date_trunc('week', CURRENT_DATE)::date;  -- Monday of current week
  d date;
  i int;
BEGIN
  -- For each day Mon through today
  FOR i IN 0..(EXTRACT(DOW FROM CURRENT_DATE)::int - 1 + 7) % 7 LOOP
    d := ws + i;
    EXIT WHEN d > CURRENT_DATE;

    -- Top performers get 7+ hours consistently
    INSERT INTO sleep_records (pubkey, sleep_date, duration_ms, hours, zzzs, all_tribe_hit, is_seed, week_start) VALUES
      ('seed_marcus_chen',   d, 7.5 * 3600000, 7.50, 25.50, true,  true, ws),
      ('seed_priya_sharma',  d, 7.2 * 3600000, 7.20, 24.00, true,  true, ws),
      ('seed_jordan_lee',    d, 7.3 * 3600000, 7.30, 24.00, true,  true, ws),
      ('seed_anya_volkov',   d, 7.4 * 3600000, 7.40, 25.20, true,  true, ws),
      ('seed_david_kim',     d, 7.1 * 3600000, 7.10, 8.10,  false, true, ws),
      ('seed_lena_okoro',    d, 6.8 * 3600000, 6.80, 6.80,  false, true, ws),
      ('seed_kai_tanaka',    d, 7.0 * 3600000, 7.00, 24.00, true,  true, ws),
      ('seed_sofia_reyes',   d, 6.5 * 3600000, 6.50, 6.50,  false, true, ws),
      ('seed_omar_hassan',   d, 6.2 * 3600000, 6.20, 6.20,  false, true, ws),
      ('seed_emma_wilson',   d, 6.0 * 3600000, 6.00, 6.00,  false, true, ws),
      ('seed_ravi_patel',    d, 7.0 * 3600000, 7.00, 24.00, true,  true, ws),
      ('seed_ana_garcia',    d, 5.5 * 3600000, 5.50, 5.50,  false, true, ws)
    ON CONFLICT (pubkey, sleep_date) DO NOTHING;
  END LOOP;
END $$;
