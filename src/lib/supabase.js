import { createClient } from '@supabase/supabase-js'
import { getTodayString } from './timezone'

const supabaseUrl = 'https://hrsljgzzmmppfmlmtltd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhyc2xqZ3p6bW1wcGZtbG10bHRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMjkyODIsImV4cCI6MjA4MDgwNTI4Mn0.y-b-WZAOEw4qiqmim6b3HTGt3rKGUC59bYQ7to3S0GA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for database operations

// Children
export async function getChildren() {
  const { data, error } = await supabase
    .from('children')
    .select('*')
  if (error) throw error
  return data
}

export async function updateChildStars(childId, stars) {
  const { error } = await supabase
    .from('children')
    .update({ stars })
    .eq('id', childId)
  if (error) throw error
}

// Chores
export async function getChores() {
  const { data, error } = await supabase
    .from('chores')
    .select('*')
    .order('sort_order')
  if (error) throw error
  return data
}

// Chore Completions (today's)
export async function getTodayCompletions() {
  const today = getTodayString()
  const { data, error } = await supabase
    .from('chore_completions')
    .select('*')
    .eq('completed_date', today)
  if (error) throw error
  return data
}

export async function completeChore(choreId, childId) {
  const today = getTodayString()
  const { error } = await supabase
    .from('chore_completions')
    .upsert({
      chore_id: choreId,
      child_id: childId,
      completed_date: today
    })
  if (error) throw error
}

export async function uncompleteChore(choreId) {
  const today = getTodayString()
  const { error } = await supabase
    .from('chore_completions')
    .delete()
    .eq('chore_id', choreId)
    .eq('completed_date', today)
  if (error) throw error
}

// Star Log
export async function addStarLogEntry(childId, amount, reason) {
  const { error } = await supabase
    .from('star_log')
    .insert({ child_id: childId, amount, reason })
  if (error) throw error
}

export async function getStarLog(childId, limit = 100) {
  const { data, error } = await supabase
    .from('star_log')
    .select('*')
    .eq('child_id', childId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

// Daily Logs
export async function getDailyLogs(days = 30) {
  const date = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Toronto' }))
  date.setDate(date.getDate() - days)
  const startDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .gte('log_date', startDate)
    .order('log_date', { ascending: false })
  if (error) throw error
  return data
}

export async function saveDailyLog(logDate, childId, morning, bedtime, chores, starsEarned) {
  const { error } = await supabase
    .from('daily_logs')
    .upsert({
      log_date: logDate,
      child_id: childId,
      morning_completed: morning,
      bedtime_completed: bedtime,
      chores_completed: chores,
      stars_earned: starsEarned
    })
  if (error) throw error
}

// Events
export async function getEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date')
  if (error) throw error
  return data
}

export async function addEvent(event) {
  const { data, error } = await supabase
    .from('events')
    .insert({
      title: event.title,
      emoji: event.emoji,
      event_date: event.date,
      child_id: event.child,
      sticker: event.sticker,
      notes: event.notes
    })
    .select()
  if (error) throw error
  return data[0]
}

export async function deleteEvent(eventId) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)
  if (error) throw error
}

// Notes
export async function getNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function addNote(note) {
  const { data, error } = await supabase
    .from('notes')
    .insert({
      note_type: note.type,
      content: note.content,
      author: note.author,
      color: note.color
    })
    .select()
  if (error) throw error
  return data[0]
}

export async function deleteNote(noteId) {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
  if (error) throw error
}

// Hearts
export async function getHearts() {
  const { data, error } = await supabase
    .from('hearts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function sendHeart(fromChild, toChild) {
  const { data, error } = await supabase
    .from('hearts')
    .insert({ from_child: fromChild, to_child: toChild })
    .select()
  if (error) throw error
  return data[0]
}

// Streaks
export async function getStreaks() {
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
  if (error) throw error
  return data
}

export async function updateStreak(childId, currentStreak, longestStreak, lastCompletedDate) {
  const { error } = await supabase
    .from('streaks')
    .upsert({
      child_id: childId,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_completed_date: lastCompletedDate,
      updated_at: new Date().toISOString()
    })
  if (error) throw error
}

// Challenges
export async function getChallenges() {
  const { data, error } = await supabase
    .from('challenges')
    .select(`
      *,
      challenge_progress (*)
    `)
  if (error) throw error
  return data
}

// ============================================================================
// DAILY STARS - Per-day, per-area star tracking
// ============================================================================

/**
 * Upsert daily star record (idempotent)
 */
export async function upsertDailyStars(childId, dayDate, starAreaId, stars, reason = null) {
  const { data, error } = await supabase
    .from('daily_stars')
    .upsert({
      child_id: childId,
      day_date: dayDate,
      star_area_id: starAreaId,
      stars,
      reason,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'child_id,day_date,star_area_id',
    })
    .select()

  if (error) throw error
  return data?.[0]
}

/**
 * Get daily stars for a child within a date range
 */
export async function getDailyStars(childId, startDate, endDate = null) {
  let query = supabase
    .from('daily_stars')
    .select('*')
    .eq('child_id', childId)
    .gte('day_date', startDate)
    .order('day_date', { ascending: false })

  if (endDate) {
    query = query.lte('day_date', endDate)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

/**
 * Get all daily stars for all children within a date range
 */
export async function getAllDailyStars(startDate, endDate = null) {
  let query = supabase
    .from('daily_stars')
    .select('*')
    .gte('day_date', startDate)
    .order('day_date', { ascending: false })

  if (endDate) {
    query = query.lte('day_date', endDate)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

/**
 * Get star totals per child
 */
export async function getChildStarTotals() {
  const { data, error } = await supabase
    .rpc('get_child_star_totals')

  if (error) {
    // RPC might not exist, calculate via query
    console.warn('[Supabase] get_child_star_totals RPC not available')
    return null
  }
  return data || []
}

/**
 * Get daily totals for a child (all areas summed per day)
 */
export async function getDailyStarTotals(childId, days = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('daily_stars')
    .select('day_date, stars')
    .eq('child_id', childId)
    .gte('day_date', startDateStr)
    .order('day_date', { ascending: false })

  if (error) throw error

  // Aggregate by day
  const totals = {}
  for (const row of (data || [])) {
    totals[row.day_date] = (totals[row.day_date] || 0) + row.stars
  }

  return Object.entries(totals).map(([day_date, total_stars]) => ({
    day_date,
    total_stars
  }))
}

/**
 * Subscribe to daily_stars changes (real-time)
 */
export function subscribeToDailyStars(callback) {
  return supabase
    .channel('daily-stars-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_stars' }, callback)
    .subscribe()
}

// ============================================================================
// Real-time subscriptions
// ============================================================================

export function subscribeToChildren(callback) {
  return supabase
    .channel('children-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'children' }, callback)
    .subscribe()
}

export function subscribeToChoreCompletions(callback) {
  return supabase
    .channel('completions-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'chore_completions' }, callback)
    .subscribe()
}
