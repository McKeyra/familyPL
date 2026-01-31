/**
 * Star Service Tests
 * Tests for star area independence, local persistence, merge logic, and queue flush
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  STAR_AREAS,
  getLocalStarCache,
  saveLocalStarCache,
  addStarsToArea,
  getStarsForArea,
  getStarsForDay,
  getTotalStars,
  recalculateTotals,
  spendStars,
  getPendingQueue,
  savePendingQueue,
  enqueueMutation,
  flushPendingQueue,
  performFullSync,
  migrateFromOldStarLog,
  needsMigration,
  getRecentStarHistory,
} from './starService'

describe('STAR_AREAS', () => {
  it('should have all required star area constants', () => {
    expect(STAR_AREAS.MORNING).toBe('morning')
    expect(STAR_AREAS.BEDTIME).toBe('bedtime')
    expect(STAR_AREAS.CHORES).toBe('chores')
    expect(STAR_AREAS.TIMER).toBe('timer')
    expect(STAR_AREAS.BONUS).toBe('bonus')
    expect(STAR_AREAS.CHALLENGE).toBe('challenge')
  })
})

describe('Star Area Independence', () => {
  it('should track stars independently for each area', async () => {
    // Add stars to MORNING for bria
    await addStarsToArea('bria', STAR_AREAS.MORNING, 2, 'Brushed teeth')

    // Add stars to BEDTIME for bria
    await addStarsToArea('bria', STAR_AREAS.BEDTIME, 1, 'Put on PJs')

    // Add stars to CHORES for bria
    await addStarsToArea('bria', STAR_AREAS.CHORES, 3, 'Cleaned room')

    // Verify each area has correct count
    expect(getStarsForArea('bria', STAR_AREAS.MORNING)).toBe(2)
    expect(getStarsForArea('bria', STAR_AREAS.BEDTIME)).toBe(1)
    expect(getStarsForArea('bria', STAR_AREAS.CHORES)).toBe(3)

    // Verify total is correct
    expect(getTotalStars('bria')).toBe(6)
  })

  it('should track stars independently for each child', async () => {
    await addStarsToArea('bria', STAR_AREAS.MORNING, 2, 'Morning routine')
    await addStarsToArea('naya', STAR_AREAS.MORNING, 5, 'Morning routine')

    expect(getStarsForArea('bria', STAR_AREAS.MORNING)).toBe(2)
    expect(getStarsForArea('naya', STAR_AREAS.MORNING)).toBe(5)

    expect(getTotalStars('bria')).toBe(2)
    expect(getTotalStars('naya')).toBe(5)
  })

  it('should track stars independently for each day', async () => {
    await addStarsToArea('bria', STAR_AREAS.MORNING, 2, 'Day 1', '2024-01-14')
    await addStarsToArea('bria', STAR_AREAS.MORNING, 3, 'Day 2', '2024-01-15')

    expect(getStarsForArea('bria', STAR_AREAS.MORNING, '2024-01-14')).toBe(2)
    expect(getStarsForArea('bria', STAR_AREAS.MORNING, '2024-01-15')).toBe(3)

    // Total should include both days
    expect(getTotalStars('bria')).toBe(5)
  })

  it('should not affect other areas when updating one area', async () => {
    await addStarsToArea('bria', STAR_AREAS.MORNING, 5, 'Initial')
    await addStarsToArea('bria', STAR_AREAS.BEDTIME, 3, 'Initial')

    // Add more to MORNING only
    await addStarsToArea('bria', STAR_AREAS.MORNING, 2, 'Additional')

    // BEDTIME should remain unchanged
    expect(getStarsForArea('bria', STAR_AREAS.BEDTIME)).toBe(3)
    expect(getStarsForArea('bria', STAR_AREAS.MORNING)).toBe(7)
  })
})

describe('Local Persistence Round-trip', () => {
  it('should persist and retrieve star data correctly', async () => {
    // Add some stars
    await addStarsToArea('bria', STAR_AREAS.MORNING, 5, 'Test persistence')

    // Read back from localStorage (simulating app restart)
    const cache = getLocalStarCache()

    expect(cache.dailyStars.bria).toBeDefined()
    expect(cache.dailyStars.bria['2024-01-15']).toBeDefined()
    expect(cache.dailyStars.bria['2024-01-15'][STAR_AREAS.MORNING].stars).toBe(5)
    expect(cache.totals.bria).toBe(5)
  })

  it('should correctly handle multiple save/load cycles', async () => {
    await addStarsToArea('bria', STAR_AREAS.MORNING, 3, 'First')
    await addStarsToArea('bria', STAR_AREAS.MORNING, 2, 'Second')
    await addStarsToArea('bria', STAR_AREAS.BEDTIME, 1, 'Different area')

    const cache = getLocalStarCache()

    expect(cache.dailyStars.bria['2024-01-15'][STAR_AREAS.MORNING].stars).toBe(5)
    expect(cache.dailyStars.bria['2024-01-15'][STAR_AREAS.BEDTIME].stars).toBe(1)
    expect(cache.totals.bria).toBe(6)
  })

  it('should preserve schema version on save', () => {
    const cache = getLocalStarCache()
    cache.dailyStars.bria = { '2024-01-15': { morning: { stars: 5 } } }
    cache.totals.bria = 5
    saveLocalStarCache(cache)

    const loaded = getLocalStarCache()
    expect(loaded.schemaVersion).toBe(1)
  })

  it('should handle empty cache gracefully', () => {
    const cache = getLocalStarCache()

    expect(cache.schemaVersion).toBe(1)
    expect(cache.dailyStars).toBeDefined()
    expect(cache.totals).toBeDefined()
    expect(Object.keys(cache.dailyStars)).toHaveLength(0)
  })
})

describe('Pending Mutations Queue', () => {
  it('should enqueue mutations correctly', () => {
    const mutation = {
      id: 'test-1',
      type: 'UPSERT_DAILY_STARS',
      childId: 'bria',
      dayDate: '2024-01-15',
      starAreaId: STAR_AREAS.MORNING,
      stars: 5,
    }

    enqueueMutation(mutation)

    const queue = getPendingQueue()
    expect(queue).toHaveLength(1)
    expect(queue[0].id).toBe('test-1')
    expect(queue[0].retryCount).toBe(0)
    expect(queue[0].queuedAt).toBeDefined()
  })

  it('should dequeue processed mutations', () => {
    enqueueMutation({ id: 'test-1', type: 'UPSERT' })
    enqueueMutation({ id: 'test-2', type: 'UPSERT' })

    let queue = getPendingQueue()
    expect(queue).toHaveLength(2)

    // Simulate processing (remove test-1)
    savePendingQueue(queue.filter(m => m.id !== 'test-1'))

    queue = getPendingQueue()
    expect(queue).toHaveLength(1)
    expect(queue[0].id).toBe('test-2')
  })

  it('should track retry count for failed mutations', () => {
    const mutation = { id: 'test-fail', type: 'UPSERT' }
    enqueueMutation(mutation)

    let queue = getPendingQueue()
    queue[0].retryCount = 3
    savePendingQueue(queue)

    queue = getPendingQueue()
    expect(queue[0].retryCount).toBe(3)
  })
})

describe('Queue Flush Behavior', () => {
  it('should return early when queue is empty', async () => {
    const result = await flushPendingQueue()

    expect(result.success).toBe(true)
    expect(result.synced).toBe(0)
  })

  it('should attempt to sync queued mutations', async () => {
    enqueueMutation({
      id: 'test-sync-1',
      type: 'UPSERT_DAILY_STARS',
      childId: 'bria',
      dayDate: '2024-01-15',
      starAreaId: STAR_AREAS.MORNING,
      stars: 5,
    })

    const result = await flushPendingQueue()

    // Should sync successfully with mocked supabase
    expect(result.success).toBe(true)
    expect(result.synced).toBe(1)

    // Queue should be empty after flush
    const queue = getPendingQueue()
    expect(queue).toHaveLength(0)
  })
})

describe('Recalculate Totals', () => {
  it('should recalculate totals from daily data', async () => {
    // Manually set up daily data
    const cache = getLocalStarCache()
    cache.dailyStars.bria = {
      '2024-01-14': {
        [STAR_AREAS.MORNING]: { stars: 2 },
        [STAR_AREAS.BEDTIME]: { stars: 1 },
      },
      '2024-01-15': {
        [STAR_AREAS.MORNING]: { stars: 3 },
        [STAR_AREAS.CHORES]: { stars: 5 },
      },
    }
    cache.totals.bria = 0 // Incorrect total
    saveLocalStarCache(cache)

    // Recalculate
    const newTotal = recalculateTotals('bria')

    expect(newTotal).toBe(11) // 2 + 1 + 3 + 5
    expect(getTotalStars('bria')).toBe(11)
  })

  it('should handle missing child data gracefully', () => {
    const total = recalculateTotals('nonexistent-child')
    expect(total).toBe(0)
  })
})

describe('Spend Stars', () => {
  it('should deduct stars when spending', async () => {
    await addStarsToArea('bria', STAR_AREAS.MORNING, 10, 'Earned')

    const result = await spendStars('bria', 5, 'Extra screen time')

    expect(result.success).toBe(true)
    expect(result.newTotal).toBe(5)
    expect(getTotalStars('bria')).toBe(5)
  })

  it('should reject spending more than available', async () => {
    await addStarsToArea('bria', STAR_AREAS.MORNING, 3, 'Earned')

    const result = await spendStars('bria', 10, 'Too expensive reward')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Insufficient stars')
    expect(getTotalStars('bria')).toBe(3) // Unchanged
  })

  it('should record spend as negative in BONUS area', async () => {
    await addStarsToArea('bria', STAR_AREAS.MORNING, 10, 'Earned')
    await spendStars('bria', 5, 'Game night')

    const bonusStars = getStarsForArea('bria', STAR_AREAS.BONUS)
    expect(bonusStars).toBe(-5)
  })
})

describe('Get Stars For Day', () => {
  it('should return total and breakdown by area for a day', async () => {
    await addStarsToArea('bria', STAR_AREAS.MORNING, 3, 'Morning')
    await addStarsToArea('bria', STAR_AREAS.BEDTIME, 2, 'Bedtime')
    await addStarsToArea('bria', STAR_AREAS.CHORES, 4, 'Chores')

    const dayData = getStarsForDay('bria', '2024-01-15')

    expect(dayData.total).toBe(9)
    expect(dayData.byArea[STAR_AREAS.MORNING]).toBe(3)
    expect(dayData.byArea[STAR_AREAS.BEDTIME]).toBe(2)
    expect(dayData.byArea[STAR_AREAS.CHORES]).toBe(4)
  })

  it('should return zeros for day with no stars', () => {
    const dayData = getStarsForDay('bria', '2024-01-01')

    expect(dayData.total).toBe(0)
    expect(Object.keys(dayData.byArea)).toHaveLength(0)
  })
})

describe('Recent Star History', () => {
  it('should return star history for specified number of days', async () => {
    // Set up data for multiple days
    const cache = getLocalStarCache()
    cache.dailyStars.bria = {
      '2024-01-13': { [STAR_AREAS.MORNING]: { stars: 2 } },
      '2024-01-14': { [STAR_AREAS.MORNING]: { stars: 3 } },
      '2024-01-15': { [STAR_AREAS.MORNING]: { stars: 5 } },
    }
    saveLocalStarCache(cache)

    const history = getRecentStarHistory('bria', 7)

    expect(history).toHaveLength(7)

    // Find the day with data
    const jan15 = history.find(d => d.date === '2024-01-15')
    expect(jan15.total).toBe(5)
  })
})

describe('Migration from Old Schema', () => {
  it('should detect when migration is needed', () => {
    // Empty cache means migration might be needed
    expect(needsMigration()).toBe(true)
  })

  it('should not need migration when data exists', async () => {
    await addStarsToArea('bria', STAR_AREAS.MORNING, 1, 'Test')
    expect(needsMigration()).toBe(false)
  })

  it('should migrate old star log format', () => {
    const oldStarLog = [
      { childId: 'bria', amount: 2, reason: 'Morning routine done', timestamp: '2024-01-15T08:00:00' },
      { childId: 'bria', amount: 1, reason: 'Bedtime routine done', timestamp: '2024-01-15T20:00:00' },
      { childId: 'naya', amount: 3, reason: 'Cleaned room (chore)', timestamp: '2024-01-15T15:00:00' },
    ]

    const children = {
      bria: { id: 'bria', stars: 3 },
      naya: { id: 'naya', stars: 3 },
    }

    const cache = migrateFromOldStarLog(oldStarLog, children)

    // Verify migration placed stars in correct areas
    expect(cache.dailyStars.bria['2024-01-15'][STAR_AREAS.MORNING].stars).toBe(2)
    expect(cache.dailyStars.bria['2024-01-15'][STAR_AREAS.BEDTIME].stars).toBe(1)
    expect(cache.dailyStars.naya['2024-01-15'][STAR_AREAS.CHORES].stars).toBe(3)

    // Verify totals preserved from children
    expect(cache.totals.bria).toBe(3)
    expect(cache.totals.naya).toBe(3)
  })
})

describe('Merge/Conflict Resolution', () => {
  it('should perform full sync and merge remote data', async () => {
    // Set up local data
    await addStarsToArea('bria', STAR_AREAS.MORNING, 5, 'Local')

    // Perform sync (with mocked empty remote)
    const result = await performFullSync(['bria', 'naya'])

    expect(result.success).toBe(true)

    // Local data should be preserved
    expect(getTotalStars('bria')).toBe(5)
  })

  it('should set lastSyncedAt after successful sync', async () => {
    await performFullSync(['bria'])

    const cache = getLocalStarCache()
    expect(cache.lastSyncedAt).toBeDefined()
    expect(cache.lastSyncedAt).toBeGreaterThan(0)
  })
})

describe('Edge Cases', () => {
  it('should handle adding 0 stars', async () => {
    await addStarsToArea('bria', STAR_AREAS.MORNING, 5, 'Initial')
    await addStarsToArea('bria', STAR_AREAS.MORNING, 0, 'Zero add')

    expect(getStarsForArea('bria', STAR_AREAS.MORNING)).toBe(5)
  })

  it('should handle negative star additions (corrections)', async () => {
    await addStarsToArea('bria', STAR_AREAS.MORNING, 5, 'Initial')
    await addStarsToArea('bria', STAR_AREAS.MORNING, -2, 'Correction')

    expect(getStarsForArea('bria', STAR_AREAS.MORNING)).toBe(3)
    expect(getTotalStars('bria')).toBe(3)
  })

  it('should handle very large star counts', async () => {
    await addStarsToArea('bria', STAR_AREAS.MORNING, 99999, 'Big reward')

    expect(getStarsForArea('bria', STAR_AREAS.MORNING)).toBe(99999)
    expect(getTotalStars('bria')).toBe(99999)
  })

  it('should handle special characters in reason', async () => {
    await addStarsToArea('bria', STAR_AREAS.MORNING, 1, 'Did chores! 🌟 Great job!')

    const cache = getLocalStarCache()
    expect(cache.dailyStars.bria['2024-01-15'][STAR_AREAS.MORNING].reason).toBe('Did chores! 🌟 Great job!')
  })
})
