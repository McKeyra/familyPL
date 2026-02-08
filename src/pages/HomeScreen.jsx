import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Star, Clock, CheckCircle2, Calendar, Gift, FileText, TrendingUp, Settings, Sun, Moon, Sparkles } from 'lucide-react'
import useStore from '../store/useStore'
import { getTorontoDate, getTorontoTime, TIMEZONE } from '../lib/timezone'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Elegant animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 28 }
  }
}

const quickAccessItems = [
  { id: 'timer', icon: Clock, label: 'Timer', path: '/timer' },
  { id: 'morning', icon: Sun, label: 'Morning', path: '/checklist/morning' },
  { id: 'bedtime', icon: Moon, label: 'Bedtime', path: '/checklist/bedtime' },
  { id: 'chores', icon: CheckCircle2, label: 'Tasks', path: '/checklist/chores' },
  { id: 'calendar', icon: Calendar, label: 'Calendar', path: '/calendar' },
  { id: 'rewards', icon: Gift, label: 'Rewards', path: '/rewards' },
  { id: 'notes', icon: FileText, label: 'Notes', path: '/notes' },
  { id: 'progress', icon: TrendingUp, label: 'Progress', path: '/progress' },
]

export default function HomeScreen() {
  const navigate = useNavigate()
  const { children, chores, events, setCurrentChild } = useStore()
  const [currentDate, setCurrentDate] = useState(getTorontoDate())
  const [currentTime, setCurrentTime] = useState(getTorontoDate())
  const [selectedChild, setSelectedChild] = useState(null)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(getTorontoDate()), 1000)
    return () => clearInterval(timer)
  }, [])

  const today = getTorontoDate()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  const calendarDays = []
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null)
  for (let day = 1; day <= daysInMonth; day++) calendarDays.push(day)

  const getEventsForDay = useCallback((day) => {
    if (!day) return []
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date === dateStr)
  }, [currentYear, currentMonth, events])

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))

  const getTaskProgress = useCallback((childId) => {
    const childChores = chores[childId]
    if (!childChores) return { completed: 0, total: 0, percentage: 0 }
    let completed = 0, total = 0
    Object.values(childChores).forEach(routine => {
      routine.forEach(task => { total++; if (task.completed) completed++ })
    })
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 }
  }, [chores])

  const briaProgress = getTaskProgress('bria')
  const nayaProgress = getTaskProgress('naya')

  const hours = currentTime.getHours()
  const minutes = currentTime.getMinutes().toString().padStart(2, '0')
  const amPm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12

  const isToday = (day) => day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

  const handleChildClick = (childId) => {
    setSelectedChild(childId)
    setCurrentChild(childId)
    setTimeout(() => navigate('/dashboard'), 120)
  }

  const handleQuickAccess = (item) => navigate(item.path)

  return (
    <motion.div
      className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 overflow-x-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="p-5 sm:p-8 pb-10 max-w-6xl mx-auto">

        {/* Elegant Header */}
        <motion.header className="mb-8 sm:mb-12" variants={itemVariants}>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm sm:text-base text-gray-400 font-medium tracking-wide uppercase">
                {DAYS[today.getDay()]}
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-900 tracking-tight">
                {MONTHS[today.getMonth()]} {today.getDate()}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-3xl sm:text-4xl md:text-5xl font-extralight text-gray-800 tabular-nums">
                {displayHours}:{minutes}
              </p>
              <p className="text-sm text-gray-400 font-medium">{amPm}</p>
            </div>
          </div>
          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </motion.header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

          {/* Left Column - Kids & Quick Access */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">

            {/* Kids Cards */}
            <motion.section variants={itemVariants}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Family</h2>
              <div className="grid grid-cols-2 gap-4 sm:gap-6">

                {/* Bria */}
                <motion.button
                  onClick={() => handleChildClick('bria')}
                  className={`
                    relative overflow-hidden p-5 sm:p-6
                    bg-gradient-to-br from-rose-50 to-pink-50
                    border border-rose-100/50
                    rounded-2xl sm:rounded-3xl
                    text-left transition-all duration-300
                    hover:shadow-lg hover:shadow-rose-100/50
                    ${selectedChild === 'bria' ? 'ring-2 ring-rose-300 scale-[0.98]' : ''}
                  `}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-200/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-200/50">
                        <span className="text-xl sm:text-2xl font-semibold text-white">B</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 rounded-full">
                        <Star className="w-4 h-4 text-rose-500 fill-rose-500" />
                        <span className="text-sm font-semibold text-gray-700">{children.bria?.stars || 0}</span>
                      </div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">Bria</h3>
                    <p className="text-sm text-gray-500 mb-3">{briaProgress.completed} of {briaProgress.total} tasks</p>
                    <div className="h-1.5 bg-rose-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${briaProgress.percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      />
                    </div>
                  </div>
                </motion.button>

                {/* Naya */}
                <motion.button
                  onClick={() => handleChildClick('naya')}
                  className={`
                    relative overflow-hidden p-5 sm:p-6
                    bg-gradient-to-br from-cyan-50 to-teal-50
                    border border-cyan-100/50
                    rounded-2xl sm:rounded-3xl
                    text-left transition-all duration-300
                    hover:shadow-lg hover:shadow-cyan-100/50
                    ${selectedChild === 'naya' ? 'ring-2 ring-cyan-300 scale-[0.98]' : ''}
                  `}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-200/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-200/50">
                        <span className="text-xl sm:text-2xl font-semibold text-white">N</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 rounded-full">
                        <Star className="w-4 h-4 text-cyan-500 fill-cyan-500" />
                        <span className="text-sm font-semibold text-gray-700">{children.naya?.stars || 0}</span>
                      </div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">Naya</h3>
                    <p className="text-sm text-gray-500 mb-3">{nayaProgress.completed} of {nayaProgress.total} tasks</p>
                    <div className="h-1.5 bg-cyan-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-400 to-teal-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${nayaProgress.percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.section>

            {/* Quick Access */}
            <motion.section variants={itemVariants}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick Access</h2>
              <div className="overflow-x-auto scrollbar-hide -mx-5 px-5 sm:-mx-8 sm:px-8">
                <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
                  {quickAccessItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      onClick={() => handleQuickAccess(item)}
                      className="flex flex-col items-center p-4 sm:p-5 bg-white border border-gray-100 rounded-2xl min-w-[80px] sm:min-w-[90px] hover:border-gray-200 hover:shadow-md transition-all duration-200"
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.96 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.04 }}
                    >
                      <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 mb-2" strokeWidth={1.5} />
                      <span className="text-xs sm:text-sm font-medium text-gray-600">{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Today's Overview */}
            <motion.section variants={itemVariants}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Today's Tasks</h2>
              <div className="grid grid-cols-2 gap-4">

                {/* Bria Tasks */}
                <div
                  className="p-4 sm:p-5 bg-white border border-gray-100 rounded-2xl cursor-pointer hover:border-rose-200 hover:shadow-sm transition-all"
                  onClick={() => handleChildClick('bria')}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center">
                      <span className="text-xs font-semibold text-rose-600">B</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Bria</span>
                  </div>
                  <div className="space-y-2">
                    {chores.bria && Object.entries(chores.bria).flatMap(([, tasks]) =>
                      tasks.slice(0, 2).map(task => (
                        <div key={task.id} className={`flex items-center gap-2 ${task.completed ? 'opacity-40' : ''}`}>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${task.completed ? 'border-green-400 bg-green-400' : 'border-gray-200'}`}>
                            {task.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>{task.text}</span>
                        </div>
                      ))
                    ).slice(0, 4)}
                  </div>
                </div>

                {/* Naya Tasks */}
                <div
                  className="p-4 sm:p-5 bg-white border border-gray-100 rounded-2xl cursor-pointer hover:border-cyan-200 hover:shadow-sm transition-all"
                  onClick={() => handleChildClick('naya')}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center">
                      <span className="text-xs font-semibold text-cyan-600">N</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Naya</span>
                  </div>
                  <div className="space-y-2">
                    {chores.naya && Object.entries(chores.naya).flatMap(([, tasks]) =>
                      tasks.slice(0, 2).map(task => (
                        <div key={task.id} className={`flex items-center gap-2 ${task.completed ? 'opacity-40' : ''}`}>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${task.completed ? 'border-green-400 bg-green-400' : 'border-gray-200'}`}>
                            {task.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>{task.text}</span>
                        </div>
                      ))
                    ).slice(0, 4)}
                  </div>
                </div>
              </div>
            </motion.section>
          </div>

          {/* Right Column - Calendar */}
          <motion.aside variants={itemVariants} className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Calendar</h2>
              <div className="p-5 sm:p-6 bg-white border border-gray-100 rounded-2xl sm:rounded-3xl">

                {/* Month Nav */}
                <div className="flex items-center justify-between mb-5">
                  <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                    <ChevronLeft className="w-4 h-4 text-gray-400" />
                  </button>
                  <h3 className="text-base font-semibold text-gray-800">
                    {MONTHS[currentMonth]} {currentYear}
                  </h3>
                  <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DAYS_SHORT.map((day, i) => (
                    <div key={i} className="text-center text-[10px] font-medium text-gray-400 py-1">{day}</div>
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
                          aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative
                          ${!day ? '' : 'hover:bg-gray-50 cursor-pointer'}
                          ${isToday(day) ? 'bg-gray-900 text-white font-medium' : 'text-gray-600'}
                        `}
                      >
                        {day && (
                          <>
                            <span>{day}</span>
                            {(hasBriaEvent || hasNayaEvent) && (
                              <div className="flex gap-0.5 absolute bottom-1">
                                {hasBriaEvent && <div className="w-1 h-1 rounded-full bg-rose-400" />}
                                {hasNayaEvent && <div className="w-1 h-1 rounded-full bg-cyan-400" />}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-5 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-400" />
                    <span className="text-xs text-gray-500">Bria</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="text-xs text-gray-500">Naya</span>
                  </div>
                </div>
              </div>

              {/* Parent Access */}
              <motion.button
                onClick={() => navigate('/parent')}
                className="w-full mt-4 p-4 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl transition-colors"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Settings className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Parent Settings</span>
              </motion.button>
            </div>
          </motion.aside>
        </div>
      </div>
    </motion.div>
  )
}
