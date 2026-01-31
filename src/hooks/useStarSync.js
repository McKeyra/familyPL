/**
 * Star Sync Hook
 * Handles initialization, migration, and syncing of star data
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import useStore from '../store/useStore'
import {
  STAR_AREAS,
  addStarsToArea,
  getTotalStars,
  getStarsForDay,
  getRecentStarHistory,
  performFullSync,
  flushPendingQueue,
  migrateFromOldStarLog,
  needsMigration,
  getLocalStarCache,
  saveLocalStarCache,
  recalculateTotals,
} from '../lib/starService'
import { subscribeToDailyStars } from '../lib/supabase'

export default function useStarSync() {
  const hasInitialized = useRef(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState(null)
  const [syncError, setSyncError] = useState(null)

  const {
    children,
    starLog,
    setCurrentChild,
  } = useStore()

  // Initialize star service on mount
  const initialize = useCallback(async () => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    console.log('[useStarSync] Initializing star service...')

    try {
      // Check if migration from old schema is needed
      if (needsMigration() && starLog && starLog.length > 0) {
        console.log('[useStarSync] Migrating from old star log...')
        migrateFromOldStarLog(starLog, children)
      }

      // Perform full sync with Supabase
      setIsSyncing(true)
      const result = await performFullSync(['bria', 'naya'])

      if (result.success) {
        setLastSyncedAt(Date.now())
        console.log('[useStarSync] Sync complete:', result)

        // Update store with synced totals
        const cache = getLocalStarCache()
        Object.keys(children).forEach(childId => {
          const syncedTotal = cache.totals[childId] || 0
          if (children[childId].stars !== syncedTotal) {
            // Update the store's star count to match synced value
            useStore.setState((state) => ({
              children: {
                ...state.children,
                [childId]: {
                  ...state.children[childId],
                  stars: syncedTotal,
                }
              }
            }))
          }
        })
      } else {
        console.error('[useStarSync] Sync failed:', result.error)
        setSyncError(result.error)
      }
    } catch (error) {
      console.error('[useStarSync] Initialization error:', error)
      setSyncError(error.message)
    } finally {
      setIsSyncing(false)
    }
  }, [children, starLog])

  // Set up real-time subscription
  useEffect(() => {
    initialize()

    // Subscribe to daily_stars changes from other devices
    const subscription = subscribeToDailyStars((payload) => {
      console.log('[useStarSync] Real-time update:', payload)

      if (payload.new) {
        const { child_id, day_date, star_area_id, stars, updated_at } = payload.new

        // Update local cache with remote change
        const cache = getLocalStarCache()

        if (!cache.dailyStars[child_id]) {
          cache.dailyStars[child_id] = {}
        }
        if (!cache.dailyStars[child_id][day_date]) {
          cache.dailyStars[child_id][day_date] = {}
        }

        const local = cache.dailyStars[child_id][day_date][star_area_id]

        // Only update if remote is newer
        if (!local || !local.updatedAt || new Date(updated_at) > new Date(local.updatedAt)) {
          cache.dailyStars[child_id][day_date][star_area_id] = {
            stars,
            updatedAt: updated_at,
          }
          saveLocalStarCache(cache)

          // Recalculate and update store
          const newTotal = recalculateTotals(child_id)
          useStore.setState((state) => ({
            children: {
              ...state.children,
              [child_id]: {
                ...state.children[child_id],
                stars: newTotal,
              }
            }
          }))
        }
      }
    })

    // Periodic queue flush (every 30 seconds)
    const flushInterval = setInterval(async () => {
      try {
        await flushPendingQueue()
      } catch (error) {
        console.warn('[useStarSync] Queue flush failed:', error)
      }
    }, 30000)

    return () => {
      subscription.unsubscribe()
      clearInterval(flushInterval)
    }
  }, [initialize])

  // Manual sync trigger
  const triggerSync = useCallback(async () => {
    setIsSyncing(true)
    setSyncError(null)

    try {
      const result = await performFullSync(['bria', 'naya'])
      if (result.success) {
        setLastSyncedAt(Date.now())
      } else {
        setSyncError(result.error)
      }
      return result
    } catch (error) {
      setSyncError(error.message)
      return { success: false, error: error.message }
    } finally {
      setIsSyncing(false)
    }
  }, [])

  return {
    isSyncing,
    lastSyncedAt,
    syncError,
    triggerSync,
    // Star operations (convenience exports)
    STAR_AREAS,
    addStarsToArea,
    getTotalStars,
    getStarsForDay,
    getRecentStarHistory,
  }
}

/**
 * Helper hook for accessing star data for a specific child
 */
export function useChildStars(childId) {
  const [starData, setStarData] = useState({
    total: 0,
    today: { total: 0, byArea: {} },
    weekHistory: [],
  })

  useEffect(() => {
    if (!childId) return

    // Load initial data
    const total = getTotalStars(childId)
    const today = getStarsForDay(childId)
    const weekHistory = getRecentStarHistory(childId, 7)

    setStarData({ total, today, weekHistory })

    // Update periodically
    const interval = setInterval(() => {
      setStarData({
        total: getTotalStars(childId),
        today: getStarsForDay(childId),
        weekHistory: getRecentStarHistory(childId, 7),
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [childId])

  return starData
}
