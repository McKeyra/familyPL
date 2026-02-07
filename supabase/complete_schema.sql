-- ============================================================================
-- HAPPY DAY HELPER - COMPLETE SUPABASE SCHEMA
-- Run this in Supabase SQL Editor to create all tables
-- ============================================================================

-- ============================================================================
-- 1. CHILDREN TABLE - Child profiles
-- ============================================================================
CREATE TABLE IF NOT EXISTS children (
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
INSERT INTO children (id, name, age, avatar, theme, stars, color)
VALUES
  ('bria', 'Bria', 4, 'B', 'bria', 0, 'orange'),
  ('naya', 'Naya', 8, 'N', 'naya', 0, 'cyan')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. CHORES TABLE - Task/routine definitions
-- ============================================================================
CREATE TABLE IF NOT EXISTS chores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  routine_type TEXT NOT NULL CHECK (routine_type IN ('morning', 'bedtime', 'chores')),
  text TEXT NOT NULL,
  emoji TEXT DEFAULT '✅',
  stars INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chores_child ON chores(child_id);
CREATE INDEX IF NOT EXISTS idx_chores_routine ON chores(child_id, routine_type);

-- Seed sample chores for Bria (age 4)
INSERT INTO chores (child_id, routine_type, text, emoji, stars, sort_order) VALUES
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
INSERT INTO chores (child_id, routine_type, text, emoji, stars, sort_order) VALUES
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
CREATE TABLE IF NOT EXISTS chore_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chore_id UUID NOT NULL REFERENCES chores(id) ON DELETE CASCADE,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chore_completions_unique UNIQUE (chore_id, completed_date)
);

CREATE INDEX IF NOT EXISTS idx_completions_date ON chore_completions(completed_date);
CREATE INDEX IF NOT EXISTS idx_completions_child_date ON chore_completions(child_id, completed_date);

-- ============================================================================
-- 4. STAR LOG TABLE - Legacy star history (before daily_stars)
-- ============================================================================
CREATE TABLE IF NOT EXISTS star_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_star_log_child ON star_log(child_id);
CREATE INDEX IF NOT EXISTS idx_star_log_date ON star_log(created_at);

-- ============================================================================
-- 5. DAILY STARS TABLE - Per-day, per-area star tracking (Production)
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_stars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  day_date DATE NOT NULL,
  star_area_id TEXT NOT NULL CHECK (star_area_id IN ('morning', 'bedtime', 'chores', 'timer', 'bonus', 'challenge')),
  stars INTEGER NOT NULL DEFAULT 0,
  reason TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT daily_stars_unique UNIQUE (child_id, day_date, star_area_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_stars_child_date ON daily_stars(child_id, day_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_stars_date ON daily_stars(day_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_stars_updated ON daily_stars(updated_at DESC);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_daily_stars_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_daily_stars_updated_at ON daily_stars;
CREATE TRIGGER trigger_daily_stars_updated_at
  BEFORE UPDATE ON daily_stars
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_stars_updated_at();

-- ============================================================================
-- 6. DAILY LOGS TABLE - Historical daily summaries
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  log_date DATE NOT NULL,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  morning_completed BOOLEAN DEFAULT FALSE,
  bedtime_completed BOOLEAN DEFAULT FALSE,
  chores_completed INTEGER DEFAULT 0,
  stars_earned INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT daily_logs_unique UNIQUE (log_date, child_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_logs_child ON daily_logs(child_id, log_date DESC);

-- ============================================================================
-- 7. EVENTS TABLE - Calendar events
-- ============================================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  emoji TEXT DEFAULT '📅',
  event_date DATE NOT NULL,
  child_id TEXT REFERENCES children(id) ON DELETE SET NULL,
  sticker TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);

-- ============================================================================
-- 8. NOTES TABLE - Family notes/messages
-- ============================================================================
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_type TEXT NOT NULL CHECK (note_type IN ('text', 'drawing', 'voice', 'sticker')),
  content TEXT NOT NULL,
  author TEXT,
  color TEXT DEFAULT 'yellow',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_date ON notes(created_at DESC);

-- ============================================================================
-- 9. HEARTS TABLE - Kindness/appreciation messages between siblings
-- ============================================================================
CREATE TABLE IF NOT EXISTS hearts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_child TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  to_child TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hearts_to ON hearts(to_child);
CREATE INDEX IF NOT EXISTS idx_hearts_date ON hearts(created_at DESC);

-- ============================================================================
-- 10. STREAKS TABLE - Consecutive day tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_completed_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT streaks_child_unique UNIQUE (child_id)
);

-- Seed initial streaks
INSERT INTO streaks (child_id, current_streak, longest_streak)
VALUES
  ('bria', 0, 0),
  ('naya', 0, 0)
ON CONFLICT (child_id) DO NOTHING;

-- ============================================================================
-- 11. CHALLENGES TABLE - Sibling collaboration challenges
-- ============================================================================
CREATE TABLE IF NOT EXISTS challenges (
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
CREATE TABLE IF NOT EXISTS challenge_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  progress_count INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT challenge_progress_unique UNIQUE (challenge_id, child_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_progress_child ON challenge_progress(child_id);

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- Daily totals per child (all star areas summed)
CREATE OR REPLACE VIEW daily_star_totals AS
SELECT
  child_id,
  day_date,
  SUM(stars) as total_stars,
  MAX(updated_at) as last_updated
FROM daily_stars
GROUP BY child_id, day_date
ORDER BY day_date DESC;

-- All-time totals per child
CREATE OR REPLACE VIEW child_star_totals AS
SELECT
  child_id,
  SUM(stars) as total_stars,
  COUNT(DISTINCT day_date) as active_days,
  MIN(day_date) as first_star_date,
  MAX(day_date) as last_star_date
FROM daily_stars
GROUP BY child_id;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Enable for all tables - allow all operations for family app
-- ============================================================================

ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE chores ENABLE ROW LEVEL SECURITY;
ALTER TABLE chore_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE star_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stars ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hearts ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_progress ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (family app without auth)
CREATE POLICY "Allow all on children" ON children FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on chores" ON chores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on chore_completions" ON chore_completions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on star_log" ON star_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on daily_stars" ON daily_stars FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on daily_logs" ON daily_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on events" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on notes" ON notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on hearts" ON hearts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on streaks" ON streaks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on challenges" ON challenges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on challenge_progress" ON challenge_progress FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- ENABLE REALTIME
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE children;
ALTER PUBLICATION supabase_realtime ADD TABLE chore_completions;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_stars;

-- ============================================================================
-- DONE! Your database is ready.
-- ============================================================================

/*
TABLES SUMMARY:
---------------
1.  children           - Child profiles (Bria, Naya)
2.  chores             - Task definitions (morning, bedtime, chores routines)
3.  chore_completions  - Daily chore tracking
4.  star_log           - Legacy star history
5.  daily_stars        - Production star tracking (per-day, per-area)
6.  daily_logs         - Historical daily summaries
7.  events             - Calendar events
8.  notes              - Family notes/messages
9.  hearts             - Kindness messages between siblings
10. streaks            - Consecutive day tracking
11. challenges         - Sibling collaboration challenges
12. challenge_progress - Progress on challenges

STAR AREAS (daily_stars.star_area_id):
--------------------------------------
- 'morning'   : Morning routine tasks
- 'bedtime'   : Bedtime routine tasks
- 'chores'    : General chores
- 'timer'     : Timer completion rewards
- 'bonus'     : Bonuses and penalties (incl. reward redemptions as negative)
- 'challenge' : Challenge rewards

VIEWS:
------
- daily_star_totals  : Daily totals per child
- child_star_totals  : All-time totals per child
*/
