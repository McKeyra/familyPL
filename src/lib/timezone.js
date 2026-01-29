// Toronto timezone utilities
export const TIMEZONE = 'America/Toronto'

// Get current date in Toronto timezone
export function getTorontoDate() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }))
}

// Get today's date string in Toronto timezone (YYYY-MM-DD)
export function getTodayString() {
  const date = getTorontoDate()
  return formatDateString(date)
}

// Get yesterday's date string in Toronto timezone
export function getYesterdayString() {
  const date = getTorontoDate()
  date.setDate(date.getDate() - 1)
  return formatDateString(date)
}

// Format a date as YYYY-MM-DD
export function formatDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Get current time parts in Toronto timezone
export function getTorontoTime() {
  const date = getTorontoDate()
  return {
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
    day: date.getDay(),
    date: date.getDate(),
    month: date.getMonth(),
    year: date.getFullYear(),
  }
}

// Format time for display
export function formatTime(date) {
  const options = {
    timeZone: TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }
  return new Intl.DateTimeFormat('en-US', options).format(date)
}

// Format date for display
export function formatDisplayDate(date) {
  const options = {
    timeZone: TIMEZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }
  return new Intl.DateTimeFormat('en-US', options).format(date)
}

// Get day of week name
export function getDayName(date, short = false) {
  const options = {
    timeZone: TIMEZONE,
    weekday: short ? 'short' : 'long',
  }
  return new Intl.DateTimeFormat('en-US', options).format(date)
}

// Get month name
export function getMonthName(date, short = false) {
  const options = {
    timeZone: TIMEZONE,
    month: short ? 'short' : 'long',
  }
  return new Intl.DateTimeFormat('en-US', options).format(date)
}
