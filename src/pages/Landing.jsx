import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  ShoppingCart,
  Users,
  ChevronRight,
  Clock,
  Star,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Stethoscope,
  Music,
  Dumbbell,
  Cake,
  Plane,
  Heart,
} from 'lucide-react'
import useStore from '../store/useStore'
import { getTorontoDate } from '../lib/timezone'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Event category icons (replacing emoji)
const eventIcons = {
  work: Briefcase,
  school: GraduationCap,
  doctor: Stethoscope,
  music: Music,
  sports: Dumbbell,
  birthday: Cake,
  travel: Plane,
  family: Heart,
  default: Calendar,
}

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
    transition: { type: 'spring', stiffness: 400, damping: 28 }
  }
}

export default function Landing() {
  const navigate = useNavigate()
  const { children, events, chores, groceryList, setCurrentChild } = useStore()
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

  // Navigate to child dashboard
  const navigateToChild = (childId) => {
    setCurrentChild(childId)
    navigate('/dashboard')
  }

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
      naya: 'bg-teal-100 text-teal-600',
      mom: 'bg-purple-100 text-purple-600',
      dad: 'bg-blue-100 text-blue-600',
      parents: 'bg-amber-100 text-amber-600',
      both: 'bg-gray-100 text-gray-600'
    }
    return colors[child] || 'bg-gray-100 text-gray-600'
  }

  // Get event icon component
  const getEventIcon = (event) => {
    const category = event.category?.toLowerCase() || 'default'
    const IconComponent = eventIcons[category] || eventIcons.default
    return <IconComponent className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
  }

  return (
    <motion.div
      className="p-4 sm:p-6 max-w-lg mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Compact Header with Time */}
      <motion.header className="mb-6" variants={itemVariants}>
        <div className="flex items-center justify-between">
          {/* Time Display - Left aligned */}
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-light text-slate-800 tracking-tight tabular-nums">
                {displayHours}:{minutes}
              </span>
              <span className="text-lg text-slate-400">{amPm}</span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {DAYS[today.getDay()]}, {MONTHS[today.getMonth()]} {today.getDate()}
            </p>
          </div>

          {/* Quick stats - Right aligned */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => navigate('/grocery')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm"
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart className="w-4 h-4 text-green-600" strokeWidth={1.5} />
              <span className="text-sm font-medium text-slate-700">{groceryCount}</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Family Cards - F-pattern layout */}
      <motion.section className="mb-6" variants={itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Family</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Bria Card */}
          <motion.button
            onClick={() => navigateToChild('bria')}
            className="p-4 bg-white rounded-2xl border border-rose-100 shadow-sm text-left"
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(244, 63, 94, 0.12)' }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold">B</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Bria</h3>
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <Star className="w-3.5 h-3.5 text-rose-500 fill-rose-500" strokeWidth={1.5} />
                  <span className="tabular-nums">{children.bria?.stars || 0}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-green-500" strokeWidth={1.5} />
              <span className="tabular-nums">{briaProgress.completed}/{briaProgress.total} tasks</span>
            </div>
          </motion.button>

          {/* Naya Card */}
          <motion.button
            onClick={() => navigateToChild('naya')}
            className="p-4 bg-white rounded-2xl border border-teal-100 shadow-sm text-left"
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(20, 184, 166, 0.12)' }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold">N</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Naya</h3>
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <Star className="w-3.5 h-3.5 text-teal-500 fill-teal-500" strokeWidth={1.5} />
                  <span className="tabular-nums">{children.naya?.stars || 0}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-green-500" strokeWidth={1.5} />
              <span className="tabular-nums">{nayaProgress.completed}/{nayaProgress.total} tasks</span>
            </div>
          </motion.button>
        </div>
      </motion.section>

      {/* Today's Schedule */}
      <motion.section className="mb-6" variants={itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today</h2>
          <button
            onClick={() => navigate('/calendar')}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-0.5"
          >
            Calendar <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {todaysEvents.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {todaysEvents.map((event) => (
                <div key={event.id} className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    {getEventIcon(event)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-800 truncate">{event.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {event.time && (
                        <span className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
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
            <div className="p-8 text-center text-slate-400">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" strokeWidth={1.5} />
              <p className="font-medium text-slate-500">No events today</p>
              <p className="text-sm">Enjoy your free day!</p>
            </div>
          )}
        </div>
      </motion.section>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <motion.section className="mb-6" variants={itemVariants}>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Coming Up</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {upcomingEvents.slice(0, 4).map((event) => {
                const eventDate = new Date(event.date + 'T00:00:00')
                const isToday = event.date === todayStr
                return (
                  <div key={event.id} className="p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      {getEventIcon(event)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-800 text-sm truncate">{event.title}</h3>
                      <p className="text-xs text-slate-500">
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
          <motion.button
            onClick={() => navigate('/grocery')}
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-center"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <ShoppingCart className="w-5 h-5 mx-auto mb-2 text-green-600" strokeWidth={1.5} />
            <span className="text-xl font-semibold text-slate-800 tabular-nums">{groceryCount}</span>
            <p className="text-xs text-slate-500 mt-0.5">Items</p>
          </motion.button>

          <motion.button
            onClick={() => navigate('/calendar')}
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-center"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Calendar className="w-5 h-5 mx-auto mb-2 text-blue-600" strokeWidth={1.5} />
            <span className="text-xl font-semibold text-slate-800 tabular-nums">{upcomingEvents.length}</span>
            <p className="text-xs text-slate-500 mt-0.5">Events</p>
          </motion.button>

          <motion.button
            onClick={() => navigate('/notes')}
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-center"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Users className="w-5 h-5 mx-auto mb-2 text-purple-600" strokeWidth={1.5} />
            <span className="text-xl font-semibold text-slate-800 tabular-nums">4</span>
            <p className="text-xs text-slate-500 mt-0.5">Family</p>
          </motion.button>
        </div>
      </motion.section>
    </motion.div>
  )
}
