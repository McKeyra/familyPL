-- ============================================================================
-- MIGRATION: Create daily_stars table for per-day, per-area star tracking
-- Run this on your Supabase project via SQL Editor
-- ============================================================================

-- Create the daily_stars table
CREATE TABLE IF NOT EXISTS daily_stars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id TEXT NOT NULL,
  day_date DATE NOT NULL,
  star_area_id TEXT NOT NULL,
  stars INTEGER NOT NULL DEFAULT 0,
  reason TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Enforce uniqueness: one record per child + day + area
  CONSTRAINT daily_stars_unique UNIQUE (child_id, day_date, star_area_id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_daily_stars_child_date
  ON daily_stars(child_id, day_date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_stars_date
  ON daily_stars(day_date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_stars_updated
  ON daily_stars(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE daily_stars ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow all operations for now (family app without user auth)
-- In production with user auth, replace with proper user-based policies
CREATE POLICY "Allow all operations on daily_stars"
  ON daily_stars
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create a function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_daily_stars_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at on UPDATE
DROP TRIGGER IF EXISTS trigger_daily_stars_updated_at ON daily_stars;
CREATE TRIGGER trigger_daily_stars_updated_at
  BEFORE UPDATE ON daily_stars
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_stars_updated_at();

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View: Daily totals per child (all areas summed)
CREATE OR REPLACE VIEW daily_star_totals AS
SELECT
  child_id,
  day_date,
  SUM(stars) as total_stars,
  MAX(updated_at) as last_updated
FROM daily_stars
GROUP BY child_id, day_date
ORDER BY day_date DESC;

-- View: All-time totals per child
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
-- SAMPLE DATA CHECK (optional - run separately to verify)
-- ============================================================================
/*
-- Check if table was created successfully
SELECT COUNT(*) FROM daily_stars;

-- Insert a test record
INSERT INTO daily_stars (child_id, day_date, star_area_id, stars, reason)
VALUES ('test', CURRENT_DATE, 'morning', 5, 'Test entry')
ON CONFLICT (child_id, day_date, star_area_id)
DO UPDATE SET stars = daily_stars.stars + 5, reason = 'Updated test';

-- Verify upsert worked
SELECT * FROM daily_stars WHERE child_id = 'test';

-- Clean up test data
DELETE FROM daily_stars WHERE child_id = 'test';
*/

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================
/*
Star Area IDs:
- 'morning'   : Morning routine tasks
- 'bedtime'   : Bedtime routine tasks
- 'chores'    : General chores
- 'timer'     : Timer completion rewards
- 'bonus'     : Bonuses and penalties (including reward redemptions as negative)
- 'challenge' : Challenge rewards

Conflict Resolution:
- Uses updated_at timestamp for conflict resolution
- In app: latest updated_at wins when merging local + remote
- On conflict (same child_id + day_date + star_area_id): upsert with new values

365-Day Lookback:
- Indexed by day_date for efficient range queries
- Query: SELECT * FROM daily_stars WHERE child_id = ? AND day_date >= ? ORDER BY day_date DESC
*/
