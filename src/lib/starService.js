/**
 * Star Service - Production-ready star tracking with:
 * - Per-day, per-area star tracking
 * - Offline support with pending mutations queue
 * - Conflict resolution (latest updated_at wins)
 * - 365-day lookback support
 * - Schema versioning for migrations
 */

import { supabase } from './supabase'
import { getTodayString, formatDateString, getTorontoDate } from './timezone'

// Schema version for local storage migrations
const SCHEMA_VERSION = 1
const STORAGE_KEY = 'ur1ife-stars-v1'
const QUEUE_KEY = 'ur1ife-star-queue'

// Star area IDs (routine types + bonuses)
export const STAR_AREAS = {
  MORNING: 'morning',
  BEDTIME: 'bedtime',
  CHORES: 'chores',
  TIMER: 'timer',
  BONUS: 'bonus',
  CHALLENGE: 'challenge',
}

// ============================================================================
// LOCAL STORAGE PERSISTENCE
// ============================================================================

/**
 * Get local star cache with schema validation
 */
export function getLocalStarCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createEmptyCache()

    const parsed = JSON.parse(raw)

    // Validate schema version
    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      console.log('[StarService] Schema version mismatch, migrating...')
      return migrateLocalSchema(parsed)
    }

    return parsed
  } catch (error) {
    console.error('[StarService] Error reading local cache:', error)
    return createEmptyCache()
  }
}

/**
 * Save local star cache
 */
export function saveLocalStarCache(cache) {
  try {
    cache.schemaVersion = SCHEMA_VERSION
    cache.lastModified = Date.now()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.error('[StarService] Error saving local cache:', error)
  }
}

/**
 * Create empty cache structure
 */
function createEmptyCache() {
  return {
    schemaVersion: SCHEMA_VERSION,
    lastModified: Date.now(),
    lastSyncedAt: null,
    // Structure: { [childId]: { [dayDate]: { [starAreaId]: { stars, updatedAt } } } }
    dailyStars: {},
    // Cumulative totals for quick access
    totals: {},
  }
}

/**
 * Migrate from old schema versions
 */
function migrateLocalSchema(oldData) {
  console.log('[StarService] Migrating from schema version:', oldData.schemaVersion || 'unknown')

  // Start fresh with new schema
  const newCache = createEmptyCache()

  // If there's old daily data, try to preserve it
  if (oldData.dailyStars) {
    newCache.dailyStars = oldData.dailyStars
  }

  return newCache
}

// ============================================================================
// PENDING MUTATIONS QUEUE (for offline support)
// ============================================================================

/**
 * Get pending mutations queue
 */
export function getPendingQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Save pending mutations queue
 */
export function savePendingQueue(queue) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  } catch (error) {
    console.error('[StarService] Error saving pending queue:', error)
  }
}

/**
 * Add mutation to queue
 */
export function enqueueMutation(mutation) {
  const queue = getPendingQueue()
  queue.push({
    ...mutation,
    queuedAt: Date.now(),
    retryCount: 0,
  })
  savePendingQueue(queue)
}

/**
 * Remove mutation from queue
 */
export function dequeueMutation(mutationId) {
  const queue = getPendingQueue()
  const newQueue = queue.filter(m => m.id !== mutationId)
  savePendingQueue(newQueue)
}

// ============================================================================
// STAR OPERATIONS (Local + Remote)
// ============================================================================

/**
 * Get star record key
 */
function getStarKey(childId, dayDate, starAreaId) {
  return `${childId}:${dayDate}:${starAreaId}`
}

/**
 * Add stars to a specific area for a specific day
 * This is the main entry point for star updates
 */
export async function addStarsToArea(childId, starAreaId, amount, reason, dayDate = null) {
  const date = dayDate || getTodayString()
  const now = Date.now()
  const updatedAt = new Date(now).toISOString()

  // 1. Update local cache immediately
  const cache = getLocalStarCache()

  if (!cache.dailyStars[childId]) {
    cache.dailyStars[childId] = {}
  }
  if (!cache.dailyStars[childId][date]) {
    cache.dailyStars[childId][date] = {}
  }

  const currentRecord = cache.dailyStars[childId][date][starAreaId] || { stars: 0, updatedAt: null }
  const newStars = currentRecord.stars + amount

  cache.dailyStars[childId][date][starAreaId] = {
    stars: newStars,
    updatedAt,
    reason: reason || currentRecord.reason,
  }

  // Update totals
  if (!cache.totals[childId]) {
    cache.totals[childId] = 0
  }
  cache.totals[childId] += amount

  saveLocalStarCache(cache)

  // 2. Create mutation for sync
  const mutation = {
    id: `${childId}-${date}-${starAreaId}-${now}`,
    type: 'UPSERT_DAILY_STARS',
    childId,
    dayDate: date,
    starAreaId,
    stars: newStars,
    updatedAt,
    reason,
  }

  // 3. Try immediate sync, or queue if offline
  try {
    await syncMutationToSupabase(mutation)
  } catch (error) {
    console.log('[StarService] Queueing mutation for later sync:', error.message)
    enqueueMutation(mutation)
  }

  return {
    success: true,
    newStars,
    totalStars: cache.totals[childId],
  }
}

/**
 * Get stars for a specific area on a specific day
 */
export function getStarsForArea(childId, starAreaId, dayDate = null) {
  const date = dayDate || getTodayString()
  const cache = getLocalStarCache()

  return cache.dailyStars[childId]?.[date]?.[starAreaId]?.stars || 0
}

/**
 * Get all stars for a day (all areas)
 */
export function getStarsForDay(childId, dayDate = null) {
  const date = dayDate || getTodayString()
  const cache = getLocalStarCache()

  const dayData = cache.dailyStars[childId]?.[date] || {}
  let total = 0
  const byArea = {}

  Object.entries(dayData).forEach(([areaId, record]) => {
    total += record.stars || 0
    byArea[areaId] = record.stars || 0
  })

  return { total, byArea }
}

/**
 * Get total stars for a child (all time)
 */
export function getTotalStars(childId) {
  const cache = getLocalStarCache()
  return cache.totals[childId] || 0
}

/**
 * Recalculate total stars from daily data
 */
export function recalculateTotals(childId) {
  const cache = getLocalStarCache()
  let total = 0

  const childData = cache.dailyStars[childId] || {}
  Object.values(childData).forEach(dayData => {
    Object.values(dayData).forEach(record => {
      total += record.stars || 0
    })
  })

  cache.totals[childId] = total
  saveLocalStarCache(cache)

  return total
}

/**
 * Spend stars (deduct from total)
 */
export async function spendStars(childId, amount, rewardName) {
  const cache = getLocalStarCache()
  const currentTotal = cache.totals[childId] || 0

  if (currentTotal < amount) {
    return { success: false, error: 'Insufficient stars' }
  }

  // Record the spend as a negative in BONUS area
  const today = getTodayString()
  const result = await addStarsToArea(
    childId,
    STAR_AREAS.BONUS,
    -amount,
    `Redeemed: ${rewardName}`,
    today
  )

  return { success: true, newTotal: result.totalStars }
}

// ============================================================================
// SUPABASE SYNC
// ============================================================================

/**
 * Sync a single mutation to Supabase
 */
async function syncMutationToSupabase(mutation) {
  const { childId, dayDate, starAreaId, stars, updatedAt, reason } = mutation

  const { error } = await supabase
    .from('daily_stars')
    .upsert({
      child_id: childId,
      day_date: dayDate,
      star_area_id: starAreaId,
      stars,
      updated_at: updatedAt,
      reason,
    }, {
      onConflict: 'child_id,day_date,star_area_id',
    })

  if (error) throw error
}

/**
 * Flush pending mutation queue
 */
export async function flushPendingQueue() {
  const queue = getPendingQueue()
  if (queue.length === 0) return { success: true, synced: 0 }

  console.log(`[StarService] Flushing ${queue.length} pending mutations...`)

  let synced = 0
  const failed = []

  for (const mutation of queue) {
    try {
      await syncMutationToSupabase(mutation)
      synced++
    } catch (error) {
      console.error('[StarService] Failed to sync mutation:', mutation.id, error)
      mutation.retryCount = (mutation.retryCount || 0) + 1
      if (mutation.retryCount < 5) {
        failed.push(mutation)
      }
    }
  }

  savePendingQueue(failed)

  return { success: true, synced, remaining: failed.length }
}

/**
 * Load star history from Supabase (last N days)
 */
export async function loadStarHistoryFromSupabase(childId, days = 365) {
  const startDate = new Date(getTorontoDate())
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = formatDateString(startDate)

  const { data, error } = await supabase
    .from('daily_stars')
    .select('*')
    .eq('child_id', childId)
    .gte('day_date', startDateStr)
    .order('day_date', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Load all star history for all children
 */
export async function loadAllStarHistory(days = 365) {
  const startDate = new Date(getTorontoDate())
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = formatDateString(startDate)

  const { data, error } = await supabase
    .from('daily_stars')
    .select('*')
    .gte('day_date', startDateStr)
    .order('day_date', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Full sync: merge local + remote with conflict resolution
 */
export async function performFullSync(childIds = ['bria', 'naya']) {
  console.log('[StarService] Starting full sync...')

  try {
    // 1. Load local cache
    const cache = getLocalStarCache()

    // 2. Fetch remote data (last 365 days)
    const remoteData = await loadAllStarHistory(365)

    // 3. Merge with conflict resolution (latest updated_at wins)
    let mergeCount = 0
    let conflictCount = 0

    for (const remote of remoteData) {
      const { child_id, day_date, star_area_id, stars, updated_at, reason } = remote

      if (!cache.dailyStars[child_id]) {
        cache.dailyStars[child_id] = {}
      }
      if (!cache.dailyStars[child_id][day_date]) {
        cache.dailyStars[child_id][day_date] = {}
      }

      const local = cache.dailyStars[child_id][day_date][star_area_id]

      // Conflict resolution: latest updated_at wins
      if (!local || !local.updatedAt) {
        // No local record or no timestamp, use remote
        cache.dailyStars[child_id][day_date][star_area_id] = {
          stars,
          updatedAt: updated_at,
          reason,
        }
        mergeCount++
      } else if (new Date(updated_at) > new Date(local.updatedAt)) {
        // Remote is newer
        cache.dailyStars[child_id][day_date][star_area_id] = {
          stars,
          updatedAt: updated_at,
          reason,
        }
        mergeCount++
        conflictCount++
      }
      // Otherwise, local wins (it's newer)
    }

    // 4. Recalculate totals
    for (const childId of childIds) {
      recalculateTotals(childId)
    }

    // 5. Save merged cache
    cache.lastSyncedAt = Date.now()
    saveLocalStarCache(cache)

    // 6. Flush pending queue
    const queueResult = await flushPendingQueue()

    console.log(`[StarService] Sync complete: ${mergeCount} records merged, ${conflictCount} conflicts resolved`)

    return {
      success: true,
      mergeCount,
      conflictCount,
      queueSynced: queueResult.synced,
      queueRemaining: queueResult.remaining,
    }
  } catch (error) {
    console.error('[StarService] Sync failed:', error)
    return { success: false, error: error.message }
  }
}

// ============================================================================
// 365-DAY LOOKBACK
// ============================================================================

/**
 * Get star data for a date range
 */
export function getStarHistory(childId, startDate, endDate) {
  const cache = getLocalStarCache()
  const childData = cache.dailyStars[childId] || {}

  const result = []
  const current = new Date(startDate)
  const end = new Date(endDate)

  while (current <= end) {
    const dateStr = formatDateString(current)
    const dayData = childData[dateStr] || {}

    let dayTotal = 0
    const byArea = {}

    Object.entries(dayData).forEach(([areaId, record]) => {
      dayTotal += record.stars || 0
      byArea[areaId] = record.stars || 0
    })

    result.push({
      date: dateStr,
      total: dayTotal,
      byArea,
    })

    current.setDate(current.getDate() + 1)
  }

  return result
}

/**
 * Get star data for the last N days
 */
export function getRecentStarHistory(childId, days = 7) {
  const endDate = getTorontoDate()
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - days + 1)

  return getStarHistory(childId, startDate, endDate)
}

// ============================================================================
// MIGRATION FROM OLD SCHEMA
// ============================================================================

/**
 * Migrate from old star log to new daily stars format
 */
export function migrateFromOldStarLog(oldStarLog, children) {
  console.log('[StarService] Migrating from old star log...')

  const cache = getLocalStarCache()

  // Group old star log entries by date
  for (const entry of oldStarLog) {
    const { childId, amount, reason, timestamp } = entry

    if (!childId || !timestamp) continue

    // Convert timestamp to date string
    const date = new Date(timestamp)
    const dayDate = formatDateString(date)

    // Determine star area from reason
    let starAreaId = STAR_AREAS.BONUS
    if (reason?.toLowerCase().includes('morning') || reason?.toLowerCase().includes('brush') || reason?.toLowerCase().includes('breakfast')) {
      starAreaId = STAR_AREAS.MORNING
    } else if (reason?.toLowerCase().includes('bedtime') || reason?.toLowerCase().includes('bath') || reason?.toLowerCase().includes('pjs')) {
      starAreaId = STAR_AREAS.BEDTIME
    } else if (reason?.toLowerCase().includes('chore') || reason?.toLowerCase().includes('clean') || reason?.toLowerCase().includes('homework')) {
      starAreaId = STAR_AREAS.CHORES
    } else if (reason?.toLowerCase().includes('timer')) {
      starAreaId = STAR_AREAS.TIMER
    } else if (reason?.toLowerCase().includes('challenge')) {
      starAreaId = STAR_AREAS.CHALLENGE
    }

    // Initialize structures
    if (!cache.dailyStars[childId]) {
      cache.dailyStars[childId] = {}
    }
    if (!cache.dailyStars[childId][dayDate]) {
      cache.dailyStars[childId][dayDate] = {}
    }

    // Add to area total for that day
    const current = cache.dailyStars[childId][dayDate][starAreaId] || { stars: 0 }
    cache.dailyStars[childId][dayDate][starAreaId] = {
      stars: current.stars + amount,
      updatedAt: new Date(timestamp).toISOString(),
      reason,
    }
  }

  // Calculate totals
  for (const child of Object.values(children)) {
    cache.totals[child.id] = child.stars || recalculateTotals(child.id)
  }

  saveLocalStarCache(cache)

  console.log('[StarService] Migration complete')
  return cache
}

/**
 * Check if migration is needed
 */
export function needsMigration() {
  const cache = getLocalStarCache()
  // Migration needed if cache is empty but old data exists
  const isEmpty = Object.keys(cache.dailyStars).length === 0
  return isEmpty
}

// ============================================================================
// EXPORTS FOR UI COMPONENTS
// ============================================================================

export default {
  STAR_AREAS,
  addStarsToArea,
  getStarsForArea,
  getStarsForDay,
  getTotalStars,
  spendStars,
  performFullSync,
  flushPendingQueue,
  getRecentStarHistory,
  getStarHistory,
  migrateFromOldStarLog,
  needsMigration,
  getLocalStarCache,
}
