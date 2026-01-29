import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import useStore from '../store/useStore'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function HomeScreen() {
  const navigate = useNavigate()
  const { children, chores, events, setCurrentChild } = useStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const today = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  // Generate calendar days
  const calendarDays = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  // Check if a day has events
  const getEventsForDay = (day) => {
    if (!day) return []
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date === dateStr)
  }

  // Navigate months
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  // Get task progress for each child
  const getTaskProgress = (childId) => {
    const childChores = chores[childId]
    if (!childChores) return { completed: 0, total: 0 }

    let completed = 0
    let total = 0

    Object.values(childChores).forEach(routine => {
      routine.forEach(task => {
        total++
        if (task.completed) completed++
      })
    })

    return { completed, total }
  }

  const briaProgress = getTaskProgress('bria')
  const nayaProgress = getTaskProgress('naya')

  // Format time
  const hours = currentTime.getHours()
  const minutes = currentTime.getMinutes().toString().padStart(2, '0')
  const amPm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12

  const isToday = (day) => {
    return day === today.getDate() &&
           currentMonth === today.getMonth() &&
           currentYear === today.getFullYear()
  }

  const handleChildClick = (childId) => {
    setCurrentChild(childId)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 p-4 sm:p-6">
      {/* Header with Time */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-gray-800">
          {displayHours}:{minutes} <span className="text-2xl sm:text-3xl">{amPm}</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 font-display mt-1">
          {DAYS[today.getDay()]}, {MONTHS[today.getMonth()]} {today.getDate()}
        </p>
      </motion.div>

      {/* Kids Quick Access */}
      <motion.div
        className="flex justify-center gap-4 sm:gap-6 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Bria */}
        <button
          onClick={() => handleChildClick('bria')}
          className="flex flex-col items-center p-4 sm:p-5 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/30 rounded-full flex items-center justify-center mb-2">
            <span className="text-3xl sm:text-4xl font-display font-bold text-white">B</span>
          </div>
          <span className="text-white font-display font-semibold text-sm sm:text-base">Bria</span>
          <div className="flex items-center gap-1 mt-1 bg-white/20 px-2 py-0.5 rounded-full">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300 fill-yellow-300" />
            <span className="text-xs sm:text-sm text-white font-bold">{children.bria?.stars || 0}</span>
          </div>
          <div className="text-xs text-white/80 mt-1">
            {briaProgress.completed}/{briaProgress.total} tasks
          </div>
        </button>

        {/* Naya */}
        <button
          onClick={() => handleChildClick('naya')}
          className="flex flex-col items-center p-4 sm:p-5 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/30 rounded-full flex items-center justify-center mb-2">
            <span className="text-3xl sm:text-4xl font-display font-bold text-white">N</span>
          </div>
          <span className="text-white font-display font-semibold text-sm sm:text-base">Naya</span>
          <div className="flex items-center gap-1 mt-1 bg-white/20 px-2 py-0.5 rounded-full">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300 fill-yellow-300" />
            <span className="text-xs sm:text-sm text-white font-bold">{children.naya?.stars || 0}</span>
          </div>
          <div className="text-xs text-white/80 mt-1">
            {nayaProgress.completed}/{nayaProgress.total} tasks
          </div>
        </button>
      </motion.div>

      {/* Calendar */}
      <motion.div
        className="bg-white/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </button>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-800">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map(day => (
            <div key={day} className="text-center text-xs sm:text-sm font-display font-semibold text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDay(day)
            const hasBriaEvent = dayEvents.some(e => e.child === 'bria' || e.child === 'both')
            const hasNayaEvent = dayEvents.some(e => e.child === 'naya' || e.child === 'both')

            return (
              <div
                key={index}
                className={`
                  aspect-square flex flex-col items-center justify-center rounded-lg sm:rounded-xl
                  text-sm sm:text-base font-display transition-colors relative
                  ${!day ? '' : 'hover:bg-white/50 cursor-pointer'}
                  ${isToday(day) ? 'bg-purple-500 text-white font-bold' : 'text-gray-700'}
                `}
              >
                {day && (
                  <>
                    <span>{day}</span>
                    {/* Event indicators */}
                    {(hasBriaEvent || hasNayaEvent) && (
                      <div className="flex gap-0.5 mt-0.5">
                        {hasBriaEvent && (
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-orange-400" />
                        )}
                        {hasNayaEvent && (
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-400" />
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 mt-4 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-orange-400" />
            <span>B</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-cyan-400" />
            <span>N</span>
          </div>
        </div>
      </motion.div>

      {/* Today's Tasks */}
      <motion.div
        className="bg-white/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-800 mb-4">
          Today's Tasks
        </h2>

        {/* Bria's Tasks */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-400 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-base">B</span>
            </div>
            <span className="font-display font-semibold text-gray-700">Bria</span>
            <span className="text-sm text-gray-500">
              ({briaProgress.completed}/{briaProgress.total})
            </span>
          </div>
          <div className="ml-8 sm:ml-10 space-y-1">
            {chores.bria && Object.entries(chores.bria).map(([routineType, tasks]) => (
              tasks.slice(0, 3).map(task => (
                <div
                  key={task.id}
                  className={`flex items-center gap-2 text-sm sm:text-base ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}
                >
                  <span>{task.emoji}</span>
                  <span>{task.text}</span>
                  {task.completed && <span className="text-green-500">✓</span>}
                </div>
              ))
            )).flat().slice(0, 5)}
          </div>
        </div>

        {/* Naya's Tasks */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-cyan-400 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-base">N</span>
            </div>
            <span className="font-display font-semibold text-gray-700">Naya</span>
            <span className="text-sm text-gray-500">
              ({nayaProgress.completed}/{nayaProgress.total})
            </span>
          </div>
          <div className="ml-8 sm:ml-10 space-y-1">
            {chores.naya && Object.entries(chores.naya).map(([routineType, tasks]) => (
              tasks.slice(0, 3).map(task => (
                <div
                  key={task.id}
                  className={`flex items-center gap-2 text-sm sm:text-base ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}
                >
                  <span>{task.emoji}</span>
                  <span>{task.text}</span>
                  {task.completed && <span className="text-green-500">✓</span>}
                </div>
              ))
            )).flat().slice(0, 5)}
          </div>
        </div>
      </motion.div>

      {/* Today's Events */}
      {events.filter(e => e.date === today.toISOString().split('T')[0]).length > 0 && (
        <motion.div
          className="bg-white/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-800 mb-4">
            Today's Events
          </h2>
          <div className="space-y-2">
            {events
              .filter(e => e.date === today.toISOString().split('T')[0])
              .map(event => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 bg-white/50 rounded-xl"
                >
                  <span className="text-2xl">{event.emoji}</span>
                  <div>
                    <p className="font-display font-semibold text-gray-800">{event.title}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      {(event.child === 'bria' || event.child === 'both') && (
                        <span className="w-4 h-4 bg-orange-400 rounded-full flex items-center justify-center text-white text-[10px] font-bold">B</span>
                      )}
                      {(event.child === 'naya' || event.child === 'both') && (
                        <span className="w-4 h-4 bg-cyan-400 rounded-full flex items-center justify-center text-white text-[10px] font-bold">N</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
