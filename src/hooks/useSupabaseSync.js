import { useEffect, useRef, useCallback } from 'react'
import useStore from '../store/useStore'
import {
  supabase,
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

export default function useSupabaseSync() {
  const hasLoaded = useRef(false)
  const store = useStore()

  // Load initial data from Supabase
  const loadFromSupabase = useCallback(async () => {
    if (hasLoaded.current) return
    hasLoaded.current = true

    try {
      console.log('[Supabase] Loading data...')

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
        useStore.setState({ children: childrenObj })
      }

      // Load chores and today's completions
      const [choresData, completionsData] = await Promise.all([
        getChores(),
        getTodayCompletions()
      ])

      if (choresData && choresData.length > 0) {
        const completedIds = new Set(completionsData?.map(c => c.chore_id) || [])
        const choresObj = {}

        choresData.forEach(chore => {
          if (!choresObj[chore.child_id]) {
            choresObj[chore.child_id] = { morning: [], bedtime: [], chores: [] }
          }
          choresObj[chore.child_id][chore.routine_type].push({
            id: chore.id,
            text: chore.text,
            emoji: chore.emoji,
            stars: chore.stars,
            completed: completedIds.has(chore.id),
          })
        })

        useStore.setState({ chores: choresObj })
      }

      // Load events
      const eventsData = await getEvents()
      if (eventsData) {
        const events = eventsData.map(e => ({
          id: e.id,
          title: e.title,
          emoji: e.emoji,
          date: e.event_date,
          child: e.child_id,
          sticker: e.sticker,
          notes: e.notes,
        }))
        useStore.setState({ events })
      }

      // Load notes
      const notesData = await getNotes()
      if (notesData) {
        const notes = notesData.map(n => ({
          id: n.id,
          type: n.note_type,
          content: n.content,
          author: n.author,
          color: n.color,
          createdAt: new Date(n.created_at).getTime(),
        }))
        useStore.setState({ notes })
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

      console.log('[Supabase] Data loaded successfully')
    } catch (error) {
      console.error('[Supabase] Error loading data:', error)
    }
  }, [])

  // Set up real-time subscriptions
  useEffect(() => {
    loadFromSupabase()

    // Subscribe to children changes (stars updates)
    const childrenSub = subscribeToChildren((payload) => {
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
    const completionsSub = subscribeToChoreCompletions((payload) => {
      // Reload completions when changes happen
      getTodayCompletions().then(completionsData => {
        const completedIds = new Set(completionsData?.map(c => c.chore_id) || [])
        useStore.setState((state) => {
          const newChores = { ...state.chores }
          Object.keys(newChores).forEach(childId => {
            Object.keys(newChores[childId]).forEach(routineType => {
              newChores[childId][routineType] = newChores[childId][routineType].map(chore => ({
                ...chore,
                completed: completedIds.has(chore.id),
              }))
            })
          })
          return { chores: newChores }
        })
      })
    })

    return () => {
      childrenSub.unsubscribe()
      completionsSub.unsubscribe()
    }
  }, [loadFromSupabase])

  return { loadFromSupabase }
}

// Wrapper functions that sync to Supabase
export async function syncCompleteChore(childId, choreId, stars) {
  try {
    await dbCompleteChore(choreId, childId)
    const child = useStore.getState().children[childId]
    await updateChildStars(childId, child.stars + stars)
    await addStarLogEntry(childId, stars, `Completed chore`)
  } catch (error) {
    console.error('[Supabase] Error completing chore:', error)
  }
}

export async function syncAddEvent(event) {
  try {
    return await dbAddEvent(event)
  } catch (error) {
    console.error('[Supabase] Error adding event:', error)
  }
}

export async function syncDeleteEvent(eventId) {
  try {
    await dbDeleteEvent(eventId)
  } catch (error) {
    console.error('[Supabase] Error deleting event:', error)
  }
}

export async function syncAddNote(note) {
  try {
    return await dbAddNote(note)
  } catch (error) {
    console.error('[Supabase] Error adding note:', error)
  }
}

export async function syncDeleteNote(noteId) {
  try {
    await dbDeleteNote(noteId)
  } catch (error) {
    console.error('[Supabase] Error deleting note:', error)
  }
}

export async function syncSendHeart(from, to) {
  try {
    return await dbSendHeart(from, to)
  } catch (error) {
    console.error('[Supabase] Error sending heart:', error)
  }
}

export async function syncDailyLog(date, childId, morning, bedtime, chores, starsEarned) {
  try {
    await saveDailyLog(date, childId, morning, bedtime, chores, starsEarned)
  } catch (error) {
    console.error('[Supabase] Error saving daily log:', error)
  }
}

export async function syncUpdateStreak(childId, currentStreak, longestStreak, lastCompletedDate) {
  try {
    await dbUpdateStreak(childId, currentStreak, longestStreak, lastCompletedDate)
  } catch (error) {
    console.error('[Supabase] Error updating streak:', error)
  }
}
