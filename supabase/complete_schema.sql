-- ============================================================================
-- UR1IFE - COMPLETE SUPABASE SCHEMA
-- Run this in Supabase SQL Editor to create all tables
-- Using 'hw' schema (not public)
-- ============================================================================

-- Create the hw schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS hw;

-- ============================================================================
-- 1. CHILDREN TABLE - Child profiles
-- ============================================================================
CREATE TABLE IF NOT EXISTS hw.children (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL DEFAULT 5,
  avatar TEXT,
  theme TEXT DEFAULT 'bria',
  stars INTEGER NOT NULL DEFAULT 0,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial children
INSERT INTO hw.children (id, name, age, avatar, theme, stars, color)
VALUES
  ('bria', 'Bria', 4, 'B', 'bria', 0, 'orange'),
  ('naya', 'Naya', 8, 'N', 'naya', 0, 'cyan')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. CHORES TABLE - Task/routine definitions
-- ============================================================================
CREATE TABLE IF NOT EXISTS hw.chores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES hw.children(id) ON DELETE CASCADE,
  routine_type TEXT NOT NULL CHECK (routine_type IN ('morning', 'bedtime', 'chores')),
  text TEXT NOT NULL,
  emoji TEXT DEFAULT '✅',
  stars INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chores_child ON hw.chores(child_id);
CREATE INDEX IF NOT EXISTS idx_chores_routine ON hw.chores(child_id, routine_type);

-- Seed sample chores for Bria (age 4)
INSERT INTO hw.chores (child_id, routine_type, text, emoji, stars, sort_order) VALUES
  ('bria', 'morning', 'Brush teeth', '🪥', 1, 1),
  ('bria', 'morning', 'Get dressed', '👕', 1, 2),
  ('bria', 'morning', 'Eat breakfast', '🥣', 1, 3),
  ('bria', 'morning', 'Pack backpack', '🎒', 1, 4),
  ('bria', 'bedtime', 'Take a bath', '🛁', 1, 1),
  ('bria', 'bedtime', 'Put on PJs', '👚', 1, 2),
  ('bria', 'bedtime', 'Brush teeth', '🪥', 1, 3),
  ('bria', 'bedtime', 'Story time', '📖', 1, 4),
  ('bria', 'chores', 'Put toys away', '🧸', 2, 1),
  ('bria', 'chores', 'Help set table', '🍽️', 2, 2)
ON CONFLICT DO NOTHING;

-- Seed sample chores for Naya (age 8)
INSERT INTO hw.chores (child_id, routine_type, text, emoji, stars, sort_order) VALUES
  ('naya', 'morning', 'Brush teeth', '🪥', 1, 1),
  ('naya', 'morning', 'Get dressed', '👕', 1, 2),
  ('naya', 'morning', 'Make bed', '🛏️', 1, 3),
  ('naya', 'morning', 'Eat breakfast', '🥣', 1, 4),
  ('naya', 'morning', 'Pack backpack', '🎒', 1, 5),
  ('naya', 'bedtime', 'Shower', '🚿', 1, 1),
  ('naya', 'bedtime', 'Put on PJs', '👚', 1, 2),
  ('naya', 'bedtime', 'Brush teeth', '🪥', 1, 3),
  ('naya', 'bedtime', 'Reading time', '📚', 1, 4),
  ('naya', 'chores', 'Clean room', '🧹', 2, 1),
  ('naya', 'chores', 'Do homework', '📝', 2, 2),
  ('naya', 'chores', 'Feed pet', '🐕', 2, 3)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. CHORE COMPLETIONS TABLE - Daily tracking of completed tasks
-- ============================================================================
CREATE TABLE IF NOT EXISTS hw.chore_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chore_id UUID NOT NULL REFERENCES hw.chores(id) ON DELETE CASCADE,
  child_id TEXT NOT NULL REFERENCES hw.children(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chore_completions_unique UNIQUE (chore_id, completed_date)
);

CREATE INDEX IF NOT EXISTS idx_completions_date ON hw.chore_completions(completed_date);
CREATE INDEX IF NOT EXISTS idx_completions_child_date ON hw.chore_completions(child_id, completed_date);

-- ============================================================================
-- 4. STAR LOG TABLE - Legacy star history
-- ============================================================================
CREATE TABLE IF NOT EXISTS hw.star_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES hw.children(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_star_log_child ON hw.star_log(child_id);
CREATE INDEX IF NOT EXISTS idx_star_log_date ON hw.star_log(created_at);

-- ============================================================================
-- 5. DAILY STARS TABLE - Per-day, per-area star tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS hw.daily_stars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES hw.children(id) ON DELETE CASCADE,
  day_date DATE NOT NULL,
  star_area_id TEXT NOT NULL CHECK (star_area_id IN ('morning', 'bedtime', 'chores', 'timer', 'bonus', 'challenge')),
  stars INTEGER NOT NULL DEFAULT 0,
  reason TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT daily_stars_unique UNIQUE (child_id, day_date, star_area_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_stars_child_date ON hw.daily_stars(child_id, day_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_stars_date ON hw.daily_stars(day_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_stars_updated ON hw.daily_stars(updated_at DESC);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION hw.update_daily_stars_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_daily_stars_updated_at ON hw.daily_stars;
CREATE TRIGGER trigger_daily_stars_updated_at
  BEFORE UPDATE ON hw.daily_stars
  FOR EACH ROW
  EXECUTE FUNCTION hw.update_daily_stars_updated_at();

-- ============================================================================
-- 6. DAILY LOGS TABLE - Historical daily summaries
-- ============================================================================
CREATE TABLE IF NOT EXISTS hw.daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  log_date DATE NOT NULL,
  child_id TEXT NOT NULL REFERENCES hw.children(id) ON DELETE CASCADE,
  morning_completed BOOLEAN DEFAULT FALSE,
  bedtime_completed BOOLEAN DEFAULT FALSE,
  chores_completed INTEGER DEFAULT 0,
  stars_earned INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT daily_logs_unique UNIQUE (log_date, child_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON hw.daily_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_logs_child ON hw.daily_logs(child_id, log_date DESC);

-- ============================================================================
-- 7. EVENTS TABLE - Calendar events with categories
-- ============================================================================
CREATE TABLE IF NOT EXISTS hw.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  emoji TEXT DEFAULT '📅',
  category TEXT DEFAULT 'other',
  event_date DATE NOT NULL,
  event_time TEXT,
  child_id TEXT REFERENCES hw.children(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON hw.events(event_date);

-- ============================================================================
-- 8. NOTES TABLE - Family notes/messages
-- ============================================================================
CREATE TABLE IF NOT EXISTS hw.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_type TEXT NOT NULL CHECK (note_type IN ('text', 'drawing', 'voice', 'sticker')),
  content TEXT NOT NULL,
  author TEXT,
  color TEXT DEFAULT 'yellow',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_date ON hw.notes(created_at DESC);

-- ============================================================================
-- 9. HEARTS TABLE - Kindness/appreciation messages between siblings
-- ============================================================================
CREATE TABLE IF NOT EXISTS hw.hearts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_child TEXT NOT NULL REFERENCES hw.children(id) ON DELETE CASCADE,
  to_child TEXT NOT NULL REFERENCES hw.children(id) ON DELETE CASCADE,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hearts_to ON hw.hearts(to_child);
CREATE INDEX IF NOT EXISTS idx_hearts_date ON hw.hearts(created_at DESC);

-- ============================================================================
-- 10. STREAKS TABLE - Consecutive day tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS hw.streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES hw.children(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_completed_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT streaks_child_unique UNIQUE (child_id)
);

-- Seed initial streaks
INSERT INTO hw.streaks (child_id, current_streak, longest_streak)
VALUES
  ('bria', 0, 0),
  ('naya', 0, 0)
ON CONFLICT (child_id) DO NOTHING;

-- ============================================================================
-- 11. CHALLENGES TABLE - Sibling collaboration challenges
-- ============================================================================
CREATE TABLE IF NOT EXISTS hw.challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '🎯',
  target_count INTEGER NOT NULL DEFAULT 10,
  reward_stars INTEGER NOT NULL DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 12. CHALLENGE PROGRESS TABLE - Track progress on challenges
-- ============================================================================
CREATE TABLE IF NOT EXISTS hw.challenge_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES hw.challenges(id) ON DELETE CASCADE,
  child_id TEXT NOT NULL REFERENCES hw.children(id) ON DELETE CASCADE,
  progress_count INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT challenge_progress_unique UNIQUE (challenge_id, child_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_progress_child ON hw.challenge_progress(child_id);

-- ============================================================================
-- 13. GROCERY LIST TABLE - Family shopping list
-- ============================================================================
CREATE TABLE IF NOT EXISTS hw.grocery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item TEXT NOT NULL,
  emoji TEXT DEFAULT '🛒',
  category TEXT,
  completed BOOLEAN DEFAULT FALSE,
  added_by TEXT REFERENCES hw.children(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grocery_completed ON hw.grocery_items(completed);

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- Daily totals per child (all star areas summed)
CREATE OR REPLACE VIEW hw.daily_star_totals AS
SELECT
  child_id,
  day_date,
  SUM(stars) as total_stars,
  MAX(updated_at) as last_updated
FROM hw.daily_stars
GROUP BY child_id, day_date
ORDER BY day_date DESC;

-- All-time totals per child
CREATE OR REPLACE VIEW hw.child_star_totals AS
SELECT
  child_id,
  SUM(stars) as total_stars,
  COUNT(DISTINCT day_date) as active_days,
  MIN(day_date) as first_star_date,
  MAX(day_date) as last_star_date
FROM hw.daily_stars
GROUP BY child_id;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Enable for all tables - allow all operations for family app
-- ============================================================================

ALTER TABLE hw.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE hw.chores ENABLE ROW LEVEL SECURITY;
ALTER TABLE hw.chore_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hw.star_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE hw.daily_stars ENABLE ROW LEVEL SECURITY;
ALTER TABLE hw.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hw.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE hw.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hw.hearts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hw.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE hw.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE hw.challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE hw.grocery_items ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (family app without auth)
CREATE POLICY "Allow all on children" ON hw.children FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on chores" ON hw.chores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on chore_completions" ON hw.chore_completions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on star_log" ON hw.star_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on daily_stars" ON hw.daily_stars FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on daily_logs" ON hw.daily_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on events" ON hw.events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on notes" ON hw.notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on hearts" ON hw.hearts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on streaks" ON hw.streaks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on challenges" ON hw.challenges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on challenge_progress" ON hw.challenge_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on grocery_items" ON hw.grocery_items FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- ENABLE REALTIME
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE hw.children;
ALTER PUBLICATION supabase_realtime ADD TABLE hw.chore_completions;
ALTER PUBLICATION supabase_realtime ADD TABLE hw.daily_stars;
ALTER PUBLICATION supabase_realtime ADD TABLE hw.grocery_items;

-- ============================================================================
-- DONE! Your database is ready.
-- ============================================================================

/*
TABLES SUMMARY (all in 'hw' schema):
------------------------------------
1.  hw.children           - Child profiles (Bria, Naya)
2.  hw.chores             - Task definitions (morning, bedtime, chores routines)
3.  hw.chore_completions  - Daily chore tracking
4.  hw.star_log           - Legacy star history
5.  hw.daily_stars        - Production star tracking (per-day, per-area)
6.  hw.daily_logs         - Historical daily summaries
7.  hw.events             - Calendar events with categories
8.  hw.notes              - Family notes/messages
9.  hw.hearts             - Kindness messages between siblings
10. hw.streaks            - Consecutive day tracking
11. hw.challenges         - Sibling collaboration challenges
12. hw.challenge_progress - Progress on challenges
13. hw.grocery_items      - Family shopping list

EVENT CATEGORIES:
-----------------
school, work, doctor, dentist, sports, birthday, holiday,
family, appointment, activity, playdate, travel, other

STAR AREAS (daily_stars.star_area_id):
--------------------------------------
- 'morning'   : Morning routine tasks
- 'bedtime'   : Bedtime routine tasks
- 'chores'    : General chores
- 'timer'     : Timer completion rewards
- 'bonus'     : Bonuses and penalties
- 'challenge' : Challenge rewards
*/
