# Star System Validation Checklist

## Overview
This checklist validates the production-ready star tracking system with per-day, per-area tracking, offline support, and Supabase sync.

---

## 1. Star Area Independence

### Test Steps:
- [ ] Open app as Bria
- [ ] Complete 1 morning task -> verify morning stars increment
- [ ] Complete 1 chore task -> verify chore stars increment separately
- [ ] Verify morning stars unchanged when chore stars change
- [ ] Check Dashboard shows correct breakdown by area

### Expected Results:
- Each star area (morning, bedtime, chores, timer, bonus, challenge) tracks independently
- Completing tasks in one area does not affect other areas
- Total stars = sum of all area stars

---

## 2. Per-Day Tracking

### Test Steps:
- [ ] Earn stars today
- [ ] Check Progress page shows today's stars
- [ ] Verify stars from previous days are preserved
- [ ] Check 7-day history in Progress

### Expected Results:
- Stars are tracked per-day per-area
- Each day maintains separate records
- History is preserved across app restarts

---

## 3. Local Persistence (No Data Loss)

### Test Steps:
- [ ] Earn some stars
- [ ] Force close the app (swipe away)
- [ ] Reopen app -> verify stars preserved
- [ ] Refresh browser -> verify stars preserved
- [ ] Check localStorage has `happy-day-helper-stars-v1` key

### Expected Results:
- Stars persist through app close/refresh
- localStorage contains proper schema version
- No star data lost on restart

---

## 4. Offline Support

### Test Steps:
- [ ] Put device in airplane mode
- [ ] Earn stars while offline
- [ ] Verify stars appear immediately in UI
- [ ] Check localStorage queue has pending mutations
- [ ] Reconnect to internet
- [ ] Wait 30 seconds (or trigger manual sync)
- [ ] Verify queue is flushed

### Expected Results:
- Stars update immediately in UI even when offline
- Pending mutations queue builds up while offline
- Queue flushes when connectivity restored

---

## 5. Supabase Sync

### Test Steps:
- [ ] Earn stars while online
- [ ] Check Supabase `daily_stars` table for new records
- [ ] Verify `child_id`, `day_date`, `star_area_id`, `stars` are correct
- [ ] Check `updated_at` timestamp is present

### Expected Results:
- Records appear in Supabase within seconds
- Composite key (child_id, day_date, star_area_id) is unique
- Stars value is cumulative for that day/area

---

## 6. Conflict Resolution

### Test Steps:
- [ ] On Device A: Earn 3 morning stars for Bria
- [ ] On Device B (offline): Earn 2 morning stars for Bria
- [ ] Reconnect Device B
- [ ] Wait for sync
- [ ] Verify the newer timestamp wins

### Expected Results:
- Latest `updated_at` timestamp wins
- No duplicate records created
- Both devices converge to same value

---

## 7. Real-time Updates

### Test Steps:
- [ ] Open app on two devices
- [ ] Earn stars on Device A
- [ ] Check Device B receives update via real-time subscription

### Expected Results:
- Changes propagate across devices
- UI updates without manual refresh
- Store state matches synced value

---

## 8. 365-Day Lookback

### Test Steps:
- [ ] In Supabase, insert records for dates > 30 days ago
- [ ] Trigger full sync
- [ ] Verify old records are loaded into local cache

### Expected Results:
- Sync fetches up to 365 days of history
- Old records contribute to total stars
- Performance remains acceptable

---

## 9. Migration from Old Schema

### Test Steps:
- [ ] Clear localStorage
- [ ] Set up old-format star log in Zustand store
- [ ] Reload app
- [ ] Check migration runs (console logs)
- [ ] Verify old stars appear in new format

### Expected Results:
- `needsMigration()` detects empty new cache
- `migrateFromOldStarLog()` converts old entries
- Area detection from reason text works correctly

---

## 10. Spend Stars (Rewards)

### Test Steps:
- [ ] Have child with 10+ stars
- [ ] Redeem a 5-star reward
- [ ] Verify total stars decreased by 5
- [ ] Check BONUS area has -5 entry
- [ ] Try to spend more stars than available -> should fail

### Expected Results:
- Spending deducts from total
- Negative entry in BONUS area
- Insufficient stars error when spending too much

---

## 11. Store Integration

### Test Steps:
- [ ] Complete task using existing `addStars` function
- [ ] Verify star service also receives the update
- [ ] Check both store and star service have same total

### Expected Results:
- Store's `addStars` calls star service
- Auto-detection of area from reason text
- Dual-write to both store and service

---

## 12. Automated Tests

### Test Steps:
- [ ] Run `npm run test:run`
- [ ] Verify all 31 tests pass

### Test Coverage:
- [x] STAR_AREAS constants
- [x] Star Area Independence (4 tests)
- [x] Local Persistence Round-trip (4 tests)
- [x] Pending Mutations Queue (3 tests)
- [x] Queue Flush Behavior (2 tests)
- [x] Recalculate Totals (2 tests)
- [x] Spend Stars (3 tests)
- [x] Get Stars For Day (2 tests)
- [x] Recent Star History (1 test)
- [x] Migration (3 tests)
- [x] Merge/Conflict Resolution (2 tests)
- [x] Edge Cases (4 tests)

---

## Files Created/Modified

### New Files:
- `src/lib/starService.js` - Core star tracking service
- `src/hooks/useStarSync.js` - React hook for sync integration
- `src/lib/starService.test.js` - Test suite (31 tests)
- `src/test/setup.js` - Vitest test setup
- `supabase/migrations/001_create_daily_stars.sql` - DB schema

### Modified Files:
- `src/lib/supabase.js` - Added daily_stars functions
- `src/store/useStore.js` - Updated addStars/spendStars
- `src/components/Layout.jsx` - Added useStarSync hook
- `vite.config.js` - Added test configuration
- `package.json` - Added test scripts and dependencies

---

## Supabase Setup Required

Run the migration SQL in Supabase SQL Editor:

```sql
-- See supabase/migrations/001_create_daily_stars.sql
CREATE TABLE IF NOT EXISTS daily_stars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id TEXT NOT NULL,
  day_date DATE NOT NULL,
  star_area_id TEXT NOT NULL,
  stars INTEGER NOT NULL DEFAULT 0,
  reason TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT daily_stars_unique UNIQUE (child_id, day_date, star_area_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_stars_child_date
  ON daily_stars(child_id, day_date);
CREATE INDEX IF NOT EXISTS idx_daily_stars_date
  ON daily_stars(day_date);

ALTER TABLE daily_stars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON daily_stars FOR ALL TO anon USING (true);
```

---

## Sign-off

| Validator | Date | Status |
|-----------|------|--------|
| ___________ | ___/___/___ | [ ] Passed / [ ] Failed |

Notes:
