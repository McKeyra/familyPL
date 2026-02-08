import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  ShoppingCart,
  Users,
  Settings,
  ChevronRight,
  Clock,
  Star,
  CheckCircle2,
} from 'lucide-react'
import useStore from '../store/useStore'
import { getTorontoDate } from '../lib/timezone'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 28 }
  }
}

export default function Landing() {
  const navigate = useNavigate()
  const { children, events, chores, groceryList } = useStore()
  const [currentTime, setCurrentTime] = useState(getTorontoDate())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(getTorontoDate()), 1000)
    return () => clearInterval(timer)
  }, [])

  const today = getTorontoDate()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // Get today's and upcoming events
  const upcomingEvents = events
    .filter(e => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)

  const todaysEvents = events.filter(e => e.date === todayStr)

  // Time formatting
  const hours = currentTime.getHours()
  const minutes = currentTime.getMinutes().toString().padStart(2, '0')
  const displayHours = hours % 12 || 12
  const amPm = hours >= 12 ? 'PM' : 'AM'

  // Get task progress for both kids
  const getTaskProgress = useCallback((childId) => {
    const childChores = chores[childId]
    if (!childChores) return { completed: 0, total: 0 }
    let completed = 0, total = 0
    Object.values(childChores).forEach(routine => {
      routine.forEach(task => { total++; if (task.completed) completed++ })
    })
    return { completed, total }
  }, [chores])

  const briaProgress = getTaskProgress('bria')
  const nayaProgress = getTaskProgress('naya')

  // Grocery count
  const groceryCount = groceryList?.filter(item => !item.checked)?.length || 0

  // Get person label for events
  const getPersonLabel = (child) => {
    const labels = {
      bria: 'Bria',
      naya: 'Naya',
      mom: 'Mom',
      dad: 'Dad',
      parents: 'Parents',
      both: 'Everyone'
    }
    return labels[child] || 'Everyone'
  }

  const getPersonColor = (child) => {
    const colors = {
      bria: 'bg-rose-100 text-rose-600',
      naya: 'bg-cyan-100 text-cyan-600',
      mom: 'bg-purple-100 text-purple-600',
      dad: 'bg-blue-100 text-blue-600',
      parents: 'bg-amber-100 text-amber-600',
      both: 'bg-gray-100 text-gray-600'
    }
    return colors[child] || 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-stone-100 via-amber-50 to-stone-50">
      <motion.div
        className="p-4 sm:p-6 md:p-8 pb-28 max-w-4xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header with Time */}
        <motion.header className="mb-6 sm:mb-8" variants={itemVariants}>
          <div className="text-center">
            {/* Large Time Display */}
            <div className="mb-2">
              <span className="text-6xl sm:text-7xl md:text-8xl font-light text-stone-800 tracking-tight">
                {displayHours}:{minutes}
              </span>
              <span className="text-2xl sm:text-3xl text-stone-500 ml-2">{amPm}</span>
            </div>

            {/* Date */}
            <p className="text-lg sm:text-xl text-stone-600 font-medium">
              {DAYS[today.getDay()]}, {MONTHS[today.getMonth()]} {today.getDate()}
            </p>
          </div>
        </motion.header>

        {/* Family Overview Cards */}
        <motion.section className="mb-6" variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">Family</h2>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-stone-500 hover:text-stone-700 flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Bria Card */}
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="p-4 sm:p-5 bg-white rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-all text-left"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-bold">B</span>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800">Bria</h3>
                  <div className="flex items-center gap-1 text-sm text-stone-500">
                    <Star className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <span>{children.bria?.stars || 0}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>{briaProgress.completed}/{briaProgress.total} tasks</span>
              </div>
            </motion.button>

            {/* Naya Card */}
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="p-4 sm:p-5 bg-white rounded-2xl border border-cyan-100 shadow-sm hover:shadow-md transition-all text-left"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center">
                  <span className="text-white font-bold">N</span>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800">Naya</h3>
                  <div className="flex items-center gap-1 text-sm text-stone-500">
                    <Star className="w-3.5 h-3.5 text-cyan-500 fill-cyan-500" />
                    <span>{children.naya?.stars || 0}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>{nayaProgress.completed}/{nayaProgress.total} tasks</span>
              </div>
            </motion.button>
          </div>
        </motion.section>

        {/* Today's Schedule */}
        <motion.section className="mb-6" variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">Today's Schedule</h2>
            <button
              onClick={() => navigate('/calendar')}
              className="text-sm text-stone-500 hover:text-stone-700 flex items-center gap-1"
            >
              Calendar <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            {todaysEvents.length > 0 ? (
              <div className="divide-y divide-stone-100">
                {todaysEvents.map((event) => (
                  <div key={event.id} className="p-4 flex items-center gap-4">
                    <div className="text-2xl">{event.emoji || '📅'}</div>
                    <div className="flex-1">
                      <h3 className="font-medium text-stone-800">{event.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {event.time && (
                          <span className="text-sm text-stone-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {event.time}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getPersonColor(event.child)}`}>
                          {getPersonLabel(event.child)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-stone-500">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="font-medium">No events today</p>
                <p className="text-sm">Enjoy your free day!</p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <motion.section className="mb-6" variants={itemVariants}>
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">Coming Up</h2>
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-stone-100">
                {upcomingEvents.slice(0, 4).map((event) => {
                  const eventDate = new Date(event.date + 'T00:00:00')
                  const isToday = event.date === todayStr
                  return (
                    <div key={event.id} className="p-3 sm:p-4 flex items-center gap-3">
                      <div className="text-xl sm:text-2xl">{event.emoji || '📅'}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-stone-800 truncate">{event.title}</h3>
                        <p className="text-sm text-stone-500">
                          {isToday ? 'Today' : `${DAYS[eventDate.getDay()].slice(0, 3)}, ${MONTHS[eventDate.getMonth()].slice(0, 3)} ${eventDate.getDate()}`}
                          {event.time && ` at ${event.time}`}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${getPersonColor(event.child)}`}>
                        {getPersonLabel(event.child)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.section>
        )}

        {/* Quick Stats */}
        <motion.section variants={itemVariants}>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => navigate('/grocery')}
              className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm text-center hover:shadow-md transition-all"
            >
              <ShoppingCart className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <span className="text-2xl font-semibold text-stone-800">{groceryCount}</span>
              <p className="text-xs text-stone-500 mt-1">Grocery Items</p>
            </button>

            <button
              onClick={() => navigate('/calendar')}
              className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm text-center hover:shadow-md transition-all"
            >
              <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <span className="text-2xl font-semibold text-stone-800">{upcomingEvents.length}</span>
              <p className="text-xs text-stone-500 mt-1">Upcoming</p>
            </button>

            <button
              onClick={() => navigate('/notes')}
              className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm text-center hover:shadow-md transition-all"
            >
              <Users className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <span className="text-2xl font-semibold text-stone-800">4</span>
              <p className="text-xs text-stone-500 mt-1">Family</p>
            </button>
          </div>
        </motion.section>
      </motion.div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-stone-200 safe-bottom safe-left safe-right z-50">
        <div className="flex justify-around items-center py-2 px-4 max-w-lg mx-auto">
          <button
            onClick={() => navigate('/grocery')}
            className="flex flex-col items-center p-2 rounded-xl hover:bg-stone-100 transition-colors min-w-[64px]"
          >
            <ShoppingCart className="w-6 h-6 text-stone-600" strokeWidth={1.5} />
            <span className="text-xs font-medium text-stone-600 mt-1">Grocery</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex flex-col items-center p-2 rounded-xl hover:bg-stone-100 transition-colors min-w-[64px]"
          >
            <Users className="w-6 h-6 text-stone-600" strokeWidth={1.5} />
            <span className="text-xs font-medium text-stone-600 mt-1">Kids</span>
          </button>

          <button
            onClick={() => navigate('/parent')}
            className="flex flex-col items-center p-2 rounded-xl hover:bg-stone-100 transition-colors min-w-[64px]"
          >
            <Settings className="w-6 h-6 text-stone-600" strokeWidth={1.5} />
            <span className="text-xs font-medium text-stone-600 mt-1">Parent</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
