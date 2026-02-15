/**
 * Supabase Sync Hook - LOCAL-FIRST / OFFLINE-CAPABLE
 * Works fully offline, syncs with Supabase when online
 */

import { useEffect, useRef, useCallback } from 'react'
import useStore from '../store/useStore'
import { checkOnline } from './useNetworkStatus'
import {
  getChildren,
  getChores,
  getTodayCompletions,
  getEvents,
  getNotes,
  getHearts,
  getStreaks,
  updateChildStars,
  completeChore as dbCompleteChore,
  addStarLogEntry,
  saveDailyLog,
  addEvent as dbAddEvent,
  deleteEvent as dbDeleteEvent,
  addNote as dbAddNote,
  deleteNote as dbDeleteNote,
  sendHeart as dbSendHeart,
  updateStreak as dbUpdateStreak,
  subscribeToChildren,
  subscribeToChoreCompletions,
} from '../lib/supabase'

// Offline queue storage key
const SYNC_QUEUE_KEY = 'ur1ife-sync-queue'

// Get pending sync operations
function getSyncQueue() {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// Save pending sync operations
function saveSyncQueue(queue) {
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue))
  } catch (error) {
    console.error('[Sync] Error saving queue:', error)
  }
}

// Add operation to sync queue
function enqueueSync(operation) {
  const queue = getSyncQueue()
  queue.push({
    ...operation,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    queuedAt: Date.now(),
  })
  saveSyncQueue(queue)
}

// Get queue length for UI display
export function getSyncQueueLength() {
  return getSyncQueue().length
}

// Flush pending sync queue
async function flushSyncQueue() {
  if (!checkOnline()) return

  const queue = getSyncQueue()
  if (queue.length === 0) return

  console.log(`[Sync] Flushing ${queue.length} pending operations...`)
  const remaining = []

  for (const op of queue) {
    try {
      switch (op.type) {
        case 'COMPLETE_CHORE':
          await dbCompleteChore(op.choreId, op.childId)
          await updateChildStars(op.childId, op.newStars)
          break
        case 'ADD_EVENT':
          await dbAddEvent(op.event)
          break
        case 'DELETE_EVENT':
          await dbDeleteEvent(op.eventId)
          break
        case 'ADD_NOTE':
          await dbAddNote(op.note)
          break
        case 'DELETE_NOTE':
          await dbDeleteNote(op.noteId)
          break
        case 'SEND_HEART':
          await dbSendHeart(op.from, op.to)
          break
        case 'UPDATE_STREAK':
          await dbUpdateStreak(op.childId, op.currentStreak, op.longestStreak, op.lastCompletedDate)
          break
        default:
          console.warn('[Sync] Unknown operation type:', op.type)
      }
    } catch (error) {
      console.warn('[Sync] Failed to sync operation:', op.type, error.message)
      if ((op.retryCount || 0) < 3) {
        remaining.push({ ...op, retryCount: (op.retryCount || 0) + 1 })
      }
    }
  }

  saveSyncQueue(remaining)
  console.log(`[Sync] Flush complete. ${remaining.length} operations remaining.`)
}

export default function useSupabaseSync() {
  const hasLoaded = useRef(false)
  const subscriptionsRef = useRef({ children: null, completions: null })

  // Load initial data - LOCAL FIRST, then try Supabase
  const loadFromSupabase = useCallback(async () => {
    if (hasLoaded.current) return
    hasLoaded.current = true

    // Store already has localStorage data via Zustand persist
    // Only try to load from Supabase if online
    if (!checkOnline()) {
      console.log('[Sync] Offline - using local data only')
      return
    }

    try {
      console.log('[Sync] Online - fetching from Supabase...')

      // Load children
      const childrenData = await getChildren()
      if (childrenData && childrenData.length > 0) {
        const childrenObj = {}
        childrenData.forEach(child => {
          childrenObj[child.id] = {
            id: child.id,
            name: child.name,
            age: child.age,
            avatar: child.avatar,
            theme: child.theme || child.id,
            stars: child.stars,
            color: child.color,
          }
        })
        // Merge with local - prefer higher star count to avoid data loss
        const localChildren = useStore.getState().children
        Object.keys(childrenObj).forEach(childId => {
          if (localChildren[childId]) {
            childrenObj[childId].stars = Math.max(
              childrenObj[childId].stars || 0,
              localChildren[childId].stars || 0
            )
          }
        })
        useStore.setState({ children: childrenObj })
      }

      // Load chores and today's completions
      const [choresData, completionsData] = await Promise.all([
        getChores(),
        getTodayCompletions()
      ])

      if (choresData && choresData.length > 0) {
        const completedIds = new Set(completionsData?.map(c => c.chore_id) || [])
        const localChores = useStore.getState().chores
        const choresObj = {}

        choresData.forEach(chore => {
          if (!choresObj[chore.child_id]) {
            choresObj[chore.child_id] = { morning: [], bedtime: [], chores: [] }
          }
          // Merge completion status - if completed locally, keep it
          const localChoreList = localChores[chore.child_id]?.[chore.routine_type] || []
          const localChore = localChoreList.find(c => c.id === chore.id)
          const isCompleted = completedIds.has(chore.id) || localChore?.completed

          choresObj[chore.child_id][chore.routine_type].push({
            id: chore.id,
            text: chore.text,
            emoji: chore.emoji,
            stars: chore.stars,
            completed: isCompleted,
          })
        })

        useStore.setState({ chores: choresObj })
      }

      // Load events (merge with local)
      const eventsData = await getEvents()
      if (eventsData) {
        const localEvents = useStore.getState().events || []
        const remoteEvents = eventsData.map(e => ({
          id: e.id,
          title: e.title,
          emoji: e.emoji,
          date: e.event_date,
          child: e.child_id,
          sticker: e.sticker,
          notes: e.notes,
        }))
        // Merge: keep local events not in remote, add all remote
        const remoteIds = new Set(remoteEvents.map(e => e.id))
        const merged = [
          ...remoteEvents,
          ...localEvents.filter(e => !remoteIds.has(e.id))
        ]
        useStore.setState({ events: merged })
      }

      // Load notes (merge with local)
      const notesData = await getNotes()
      if (notesData) {
        const localNotes = useStore.getState().notes || []
        const remoteNotes = notesData.map(n => ({
          id: n.id,
          type: n.note_type,
          content: n.content,
          author: n.author,
          color: n.color,
          createdAt: new Date(n.created_at).getTime(),
        }))
        const remoteIds = new Set(remoteNotes.map(n => n.id))
        const merged = [
          ...remoteNotes,
          ...localNotes.filter(n => !remoteIds.has(n.id))
        ]
        useStore.setState({ notes: merged })
      }

      // Load hearts
      const heartsData = await getHearts()
      if (heartsData) {
        const hearts = heartsData.map(h => ({
          id: h.id,
          from: h.from_child,
          to: h.to_child,
          timestamp: new Date(h.created_at).getTime(),
        }))
        useStore.setState({ hearts })
      }

      // Load streaks
      const streaksData = await getStreaks()
      if (streaksData) {
        const streaksObj = {}
        streaksData.forEach(s => {
          streaksObj[s.child_id] = {
            currentStreak: s.current_streak,
            longestStreak: s.longest_streak,
            lastCompletedDate: s.last_completed_date,
            weeklyData: [],
          }
        })
        useStore.setState({ streaks: streaksObj })
      }

      // Flush any pending sync operations
      await flushSyncQueue()

      console.log('[Sync] Data loaded and merged successfully')
    } catch (error) {
      console.warn('[Sync] Error loading from Supabase (using local data):', error.message)
    }
  }, [])

  // Set up real-time subscriptions (only if online)
  // Defer initial load to not block first paint
  useEffect(() => {
    // Use requestIdleCallback if available, otherwise setTimeout
    const scheduleLoad = window.requestIdleCallback || ((cb) => setTimeout(cb, 100))
    const handle = scheduleLoad(() => {
      loadFromSupabase()
    })

    if (!checkOnline()) {
      console.log('[Sync] Offline - skipping subscriptions')
      return () => {
        if (window.cancelIdleCallback) window.cancelIdleCallback(handle)
      }
    }

    try {
      // Subscribe to children changes (stars updates)
      subscriptionsRef.current.children = subscribeToChildren((payload) => {
        if (payload.new) {
          const child = payload.new
          useStore.setState((state) => ({
            children: {
              ...state.children,
              [child.id]: {
                ...state.children[child.id],
                stars: child.stars,
              }
            }
          }))
        }
      })

      // Subscribe to chore completions
      subscriptionsRef.current.completions = subscribeToChoreCompletions((payload) => {
        getTodayCompletions().then(completionsData => {
          const completedIds = new Set(completionsData?.map(c => c.chore_id) || [])
          useStore.setState((state) => {
            const newChores = { ...state.chores }
            Object.keys(newChores).forEach(childId => {
              Object.keys(newChores[childId]).forEach(routineType => {
                newChores[childId][routineType] = newChores[childId][routineType].map(chore => ({
                  ...chore,
                  completed: completedIds.has(chore.id) || chore.completed,
                }))
              })
            })
            return { chores: newChores }
          })
        }).catch(() => {})
      })
    } catch (error) {
      console.warn('[Sync] Error setting up subscriptions:', error.message)
    }

    // Re-sync when coming back online
    const handleOnline = () => {
      console.log('[Sync] Back online - re-syncing...')
      hasLoaded.current = false
      loadFromSupabase()
    }

    window.addEventListener('online', handleOnline)

    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(handle)
      window.removeEventListener('online', handleOnline)
      if (subscriptionsRef.current.children) {
        subscriptionsRef.current.children.unsubscribe()
      }
      if (subscriptionsRef.current.completions) {
        subscriptionsRef.current.completions.unsubscribe()
      }
    }
  }, [loadFromSupabase])

  return { loadFromSupabase }
}

// Wrapper functions that work offline and queue for sync

export async function syncCompleteChore(childId, choreId, stars) {
  const child = useStore.getState().children[childId]
  const newStars = (child?.stars || 0) + stars

  if (checkOnline()) {
    try {
      await dbCompleteChore(choreId, childId)
      await updateChildStars(childId, newStars)
      await addStarLogEntry(childId, stars, `Completed chore`)
    } catch (error) {
      console.warn('[Sync] Queueing chore completion for later')
      enqueueSync({ type: 'COMPLETE_CHORE', childId, choreId, newStars })
    }
  } else {
    enqueueSync({ type: 'COMPLETE_CHORE', childId, choreId, newStars })
  }
}

export async function syncAddEvent(event) {
  if (checkOnline()) {
    try {
      return await dbAddEvent(event)
    } catch (error) {
      console.warn('[Sync] Queueing event for later')
      enqueueSync({ type: 'ADD_EVENT', event })
    }
  } else {
    enqueueSync({ type: 'ADD_EVENT', event })
  }
}

export async function syncDeleteEvent(eventId) {
  if (checkOnline()) {
    try {
      await dbDeleteEvent(eventId)
    } catch (error) {
      console.warn('[Sync] Queueing event deletion for later')
      enqueueSync({ type: 'DELETE_EVENT', eventId })
    }
  } else {
    enqueueSync({ type: 'DELETE_EVENT', eventId })
  }
}

export async function syncAddNote(note) {
  if (checkOnline()) {
    try {
      return await dbAddNote(note)
    } catch (error) {
      console.warn('[Sync] Queueing note for later')
      enqueueSync({ type: 'ADD_NOTE', note })
    }
  } else {
    enqueueSync({ type: 'ADD_NOTE', note })
  }
}

export async function syncDeleteNote(noteId) {
  if (checkOnline()) {
    try {
      await dbDeleteNote(noteId)
    } catch (error) {
      console.warn('[Sync] Queueing note deletion for later')
      enqueueSync({ type: 'DELETE_NOTE', noteId })
    }
  } else {
    enqueueSync({ type: 'DELETE_NOTE', noteId })
  }
}

export async function syncSendHeart(from, to) {
  if (checkOnline()) {
    try {
      return await dbSendHeart(from, to)
    } catch (error) {
      console.warn('[Sync] Queueing heart for later')
      enqueueSync({ type: 'SEND_HEART', from, to })
    }
  } else {
    enqueueSync({ type: 'SEND_HEART', from, to })
  }
}

export async function syncDailyLog(date, childId, morning, bedtime, chores, starsEarned) {
  if (checkOnline()) {
    try {
      await saveDailyLog(date, childId, morning, bedtime, chores, starsEarned)
    } catch (error) {
      console.warn('[Sync] Daily log sync failed:', error.message)
    }
  }
}

export async function syncUpdateStreak(childId, currentStreak, longestStreak, lastCompletedDate) {
  if (checkOnline()) {
    try {
      await dbUpdateStreak(childId, currentStreak, longestStreak, lastCompletedDate)
    } catch (error) {
      console.warn('[Sync] Queueing streak update for later')
      enqueueSync({ type: 'UPDATE_STREAK', childId, currentStreak, longestStreak, lastCompletedDate })
    }
  } else {
    enqueueSync({ type: 'UPDATE_STREAK', childId, currentStreak, longestStreak, lastCompletedDate })
  }
}
