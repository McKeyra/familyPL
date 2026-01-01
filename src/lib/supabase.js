import { createClient } from '@supabase/supabase-js'

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
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('chore_completions')
    .select('*')
    .eq('completed_date', today)
  if (error) throw error
  return data
}

export async function completeChore(choreId, childId) {
  const today = new Date().toISOString().split('T')[0]
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
  const today = new Date().toISOString().split('T')[0]
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
  const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0]
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

// Real-time subscriptions
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
