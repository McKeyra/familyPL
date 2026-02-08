import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// French translations for days and months
const frenchDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const frenchMonths = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

const englishDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const englishMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function DateTimeDisplay({ isYoungChild = false, theme = 'bria' }) {
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Alternate language based on day of month (odd = French, even = English)
  const dayOfMonth = currentTime.getDate()
  const isFrench = dayOfMonth % 2 === 1

  const dayOfWeek = currentTime.getDay()
  const month = currentTime.getMonth()
  const year = currentTime.getFullYear()

  // Format time
  const hours = currentTime.getHours()
  const minutes = currentTime.getMinutes().toString().padStart(2, '0')
  const seconds = currentTime.getSeconds().toString().padStart(2, '0')

  // 12-hour format for young children
  const displayHours = isYoungChild ? (hours % 12 || 12) : hours
  const amPm = hours >= 12 ? (isFrench ? 'après-midi' : 'PM') : (isFrench ? 'matin' : 'AM')

  // Get translated day and month names
  const dayName = isFrench ? frenchDays[dayOfWeek] : englishDays[dayOfWeek]
  const monthName = isFrench ? frenchMonths[month] : englishMonths[month]

  // Language indicator
  const langLabel = isFrench ? '🇫🇷 Français' : '🇬🇧 English'

  const themeColors = theme === 'bria'
    ? 'from-rose-400/90 to-pink-500/90'
    : 'from-cyan-400/90 to-teal-500/90'

  if (isYoungChild) {
    // Simple, big display for young children
    return (
      <motion.div
        className={`bg-gradient-to-r ${themeColors} rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-lg mb-4`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Big Time Display */}
        <div className="text-center">
          <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-white font-display tracking-wide">
            {displayHours}:{minutes}
            <span className="text-2xl sm:text-3xl ml-2">{isYoungChild ? amPm : ''}</span>
          </div>

          {/* Day and Date */}
          <div className="mt-2 text-xl sm:text-2xl text-white/90 font-display font-semibold">
            {dayName}
          </div>
          <div className="text-lg sm:text-xl text-white/80 font-display">
            {dayOfMonth} {monthName}
          </div>

          {/* Language indicator */}
          <div className="mt-2 text-sm sm:text-base text-white/70 font-display">
            {langLabel}
          </div>
        </div>
      </motion.div>
    )
  }

  // More detailed display for older children
  return (
    <motion.div
      className={`bg-gradient-to-r ${themeColors} rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg mb-4`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        {/* Date Section */}
        <div className="text-left">
          <div className="text-lg sm:text-xl font-bold text-white font-display">
            {dayName}
          </div>
          <div className="text-sm sm:text-base text-white/90 font-display">
            {dayOfMonth} {monthName} {year}
          </div>
          <div className="text-xs sm:text-sm text-white/70 font-display mt-1">
            {langLabel}
          </div>
        </div>

        {/* Time Section */}
        <div className="text-right">
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white font-display tracking-wide">
            {hours.toString().padStart(2, '0')}:{minutes}
            <span className="text-lg sm:text-xl text-white/80">:{seconds}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
