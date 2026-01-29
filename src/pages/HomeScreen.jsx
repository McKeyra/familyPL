import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Star, Clock, CheckSquare, Calendar, Gift, ShoppingCart, StickyNote, TrendingUp } from 'lucide-react'
import useStore from '../store/useStore'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Animation variants for smooth transitions
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
}

const quickAccessItems = [
  { id: 'timer', icon: Clock, label: 'Timer', emoji: '⏰', color: 'from-blue-400 to-blue-500', path: '/timer' },
  { id: 'morning', icon: CheckSquare, label: 'Morning', emoji: '🌅', color: 'from-amber-400 to-orange-500', path: '/checklist/morning' },
  { id: 'bedtime', icon: CheckSquare, label: 'Bedtime', emoji: '🌙', color: 'from-indigo-400 to-purple-500', path: '/checklist/bedtime' },
  { id: 'chores', icon: CheckSquare, label: 'Chores', emoji: '🧹', color: 'from-green-400 to-emerald-500', path: '/checklist/chores' },
  { id: 'calendar', icon: Calendar, label: 'Calendar', emoji: '📅', color: 'from-pink-400 to-rose-500', path: '/calendar' },
  { id: 'rewards', icon: Gift, label: 'Rewards', emoji: '🎁', color: 'from-purple-400 to-violet-500', path: '/rewards' },
  { id: 'notes', icon: StickyNote, label: 'Notes', emoji: '📝', color: 'from-yellow-400 to-amber-500', path: '/notes' },
  { id: 'progress', icon: TrendingUp, label: 'Progress', emoji: '📊', color: 'from-teal-400 to-cyan-500', path: '/progress' },
]

export default function HomeScreen() {
  const navigate = useNavigate()
  const { children, chores, events, setCurrentChild } = useStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedChild, setSelectedChild] = useState(null)

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
  const getEventsForDay = useCallback((day) => {
    if (!day) return []
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date === dateStr)
  }, [currentYear, currentMonth, events])

  // Navigate months
  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))

  // Get task progress for each child
  const getTaskProgress = useCallback((childId) => {
    const childChores = chores[childId]
    if (!childChores) return { completed: 0, total: 0, percentage: 0 }

    let completed = 0
    let total = 0

    Object.values(childChores).forEach(routine => {
      routine.forEach(task => {
        total++
        if (task.completed) completed++
      })
    })

    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 }
  }, [chores])

  const briaProgress = getTaskProgress('bria')
  const nayaProgress = getTaskProgress('naya')

  // Format time
  const hours = currentTime.getHours()
  const minutes = currentTime.getMinutes().toString().padStart(2, '0')
  const seconds = currentTime.getSeconds().toString().padStart(2, '0')
  const amPm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12

  const isToday = (day) => {
    return day === today.getDate() &&
           currentMonth === today.getMonth() &&
           currentYear === today.getFullYear()
  }

  const handleChildClick = (childId) => {
    setSelectedChild(childId)
    setCurrentChild(childId)
    // Small delay for visual feedback
    setTimeout(() => navigate('/dashboard'), 150)
  }

  const handleQuickAccess = (item, childId = null) => {
    if (childId) {
      setCurrentChild(childId)
    }
    navigate(item.path)
  }

  return (
    <motion.div
      className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 overflow-x-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Safe area padding */}
      <div className="p-4 sm:p-6 pb-8 safe-top safe-left safe-right">

        {/* Header with Time - Landscape optimized */}
        <motion.div
          className="text-center mb-4 sm:mb-6 landscape:mb-3"
          variants={itemVariants}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-gray-800 landscape:text-3xl">
            {displayHours}:{minutes}
            <span className="text-xl sm:text-2xl md:text-3xl text-gray-500 ml-1">:{seconds}</span>
            <span className="text-xl sm:text-2xl md:text-3xl ml-2">{amPm}</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 font-display mt-1 landscape:text-sm">
            {DAYS[today.getDay()]}, {MONTHS[today.getMonth()]} {today.getDate()}, {today.getFullYear()}
          </p>
        </motion.div>

        {/* Main Content - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 landscape:grid-cols-2 landscape:gap-3">

          {/* Left Column */}
          <div className="space-y-4 sm:space-y-6 landscape:space-y-3">

            {/* Kids Cards */}
            <motion.div
              className="flex justify-center gap-3 sm:gap-4 md:gap-6"
              variants={itemVariants}
            >
              {/* Bria */}
              <motion.button
                onClick={() => handleChildClick('bria')}
                className={`
                  flex flex-col items-center p-3 sm:p-4 md:p-5
                  bg-gradient-to-br from-orange-400 to-orange-500
                  rounded-2xl sm:rounded-3xl shadow-lg
                  transition-all duration-200
                  ${selectedChild === 'bria' ? 'ring-4 ring-orange-300 scale-95' : 'hover:shadow-xl active:scale-95'}
                  flex-1 max-w-[160px] sm:max-w-[180px]
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/30 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white">B</span>
                </div>
                <span className="text-white font-display font-semibold text-sm sm:text-base">Bria</span>
                <div className="flex items-center gap-1 mt-1 bg-white/20 px-2 py-0.5 rounded-full">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300 fill-yellow-300" />
                  <span className="text-xs sm:text-sm text-white font-bold">{children.bria?.stars || 0}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full mt-2 bg-white/20 rounded-full h-1.5 sm:h-2">
                  <motion.div
                    className="bg-white rounded-full h-1.5 sm:h-2"
                    initial={{ width: 0 }}
                    animate={{ width: `${briaProgress.percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  />
                </div>
                <span className="text-[10px] sm:text-xs text-white/80 mt-1">
                  {briaProgress.completed}/{briaProgress.total} tasks
                </span>
              </motion.button>

              {/* Naya */}
              <motion.button
                onClick={() => handleChildClick('naya')}
                className={`
                  flex flex-col items-center p-3 sm:p-4 md:p-5
                  bg-gradient-to-br from-cyan-400 to-cyan-500
                  rounded-2xl sm:rounded-3xl shadow-lg
                  transition-all duration-200
                  ${selectedChild === 'naya' ? 'ring-4 ring-cyan-300 scale-95' : 'hover:shadow-xl active:scale-95'}
                  flex-1 max-w-[160px] sm:max-w-[180px]
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/30 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white">N</span>
                </div>
                <span className="text-white font-display font-semibold text-sm sm:text-base">Naya</span>
                <div className="flex items-center gap-1 mt-1 bg-white/20 px-2 py-0.5 rounded-full">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300 fill-yellow-300" />
                  <span className="text-xs sm:text-sm text-white font-bold">{children.naya?.stars || 0}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full mt-2 bg-white/20 rounded-full h-1.5 sm:h-2">
                  <motion.div
                    className="bg-white rounded-full h-1.5 sm:h-2"
                    initial={{ width: 0 }}
                    animate={{ width: `${nayaProgress.percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  />
                </div>
                <span className="text-[10px] sm:text-xs text-white/80 mt-1">
                  {nayaProgress.completed}/{nayaProgress.total} tasks
                </span>
              </motion.button>
            </motion.div>

            {/* Quick Access - Horizontal Scroll */}
            <motion.div variants={itemVariants}>
              <h3 className="text-sm sm:text-base font-display font-semibold text-gray-700 mb-2 px-1">
                Quick Access
              </h3>
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6">
                <div className="flex gap-2 sm:gap-3 pb-2" style={{ width: 'max-content' }}>
                  {quickAccessItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      onClick={() => handleQuickAccess(item)}
                      className={`
                        flex flex-col items-center p-2.5 sm:p-3
                        bg-gradient-to-br ${item.color}
                        rounded-xl sm:rounded-2xl shadow-md
                        min-w-[70px] sm:min-w-[80px]
                        transition-transform duration-150
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <span className="text-2xl sm:text-3xl mb-1">{item.emoji}</span>
                      <span className="text-[10px] sm:text-xs text-white font-display font-semibold">{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Today's Tasks */}
            <motion.div
              className="bg-white/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg"
              variants={itemVariants}
            >
              <h2 className="text-base sm:text-lg font-display font-bold text-gray-800 mb-3">
                Today's Tasks
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {/* Bria's Tasks */}
                <div
                  className="cursor-pointer hover:bg-white/50 rounded-xl p-2 transition-colors"
                  onClick={() => handleChildClick('bria')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">B</span>
                    </div>
                    <span className="font-display font-semibold text-gray-700 text-sm">Bria</span>
                  </div>
                  <div className="space-y-1">
                    {chores.bria && Object.entries(chores.bria).flatMap(([, tasks]) =>
                      tasks.slice(0, 2).map(task => (
                        <div
                          key={task.id}
                          className={`flex items-center gap-1.5 text-xs ${task.completed ? 'text-gray-400 line-through' : 'text-gray-600'}`}
                        >
                          <span className="text-sm">{task.emoji}</span>
                          <span className="truncate">{task.text}</span>
                        </div>
                      ))
                    ).slice(0, 4)}
                  </div>
                </div>

                {/* Naya's Tasks */}
                <div
                  className="cursor-pointer hover:bg-white/50 rounded-xl p-2 transition-colors"
                  onClick={() => handleChildClick('naya')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">N</span>
                    </div>
                    <span className="font-display font-semibold text-gray-700 text-sm">Naya</span>
                  </div>
                  <div className="space-y-1">
                    {chores.naya && Object.entries(chores.naya).flatMap(([, tasks]) =>
                      tasks.slice(0, 2).map(task => (
                        <div
                          key={task.id}
                          className={`flex items-center gap-1.5 text-xs ${task.completed ? 'text-gray-400 line-through' : 'text-gray-600'}`}
                        >
                          <span className="text-sm">{task.emoji}</span>
                          <span className="truncate">{task.text}</span>
                        </div>
                      ))
                    ).slice(0, 4)}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Calendar */}
          <motion.div
            className="bg-white/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg"
            variants={itemVariants}
          >
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-3">
              <motion.button
                onClick={prevMonth}
                className="p-1.5 sm:p-2 hover:bg-white/50 rounded-full transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              </motion.button>
              <h2 className="text-base sm:text-lg md:text-xl font-display font-bold text-gray-800">
                {MONTHS[currentMonth]} {currentYear}
              </h2>
              <motion.button
                onClick={nextMonth}
                className="p-1.5 sm:p-2 hover:bg-white/50 rounded-full transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              </motion.button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1">
              {DAYS_SHORT.map((day, i) => (
                <div key={i} className="text-center text-[10px] sm:text-xs font-display font-semibold text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
              <AnimatePresence mode="wait">
                {calendarDays.map((day, index) => {
                  const dayEvents = getEventsForDay(day)
                  const hasBriaEvent = dayEvents.some(e => e.child === 'bria' || e.child === 'both')
                  const hasNayaEvent = dayEvents.some(e => e.child === 'naya' || e.child === 'both')

                  return (
                    <motion.div
                      key={`${currentMonth}-${index}`}
                      className={`
                        aspect-square flex flex-col items-center justify-center rounded-lg
                        text-xs sm:text-sm font-display transition-colors relative
                        ${!day ? '' : 'hover:bg-white/50 cursor-pointer'}
                        ${isToday(day) ? 'bg-purple-500 text-white font-bold shadow-md' : 'text-gray-700'}
                      `}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.01 }}
                    >
                      {day && (
                        <>
                          <span>{day}</span>
                          {(hasBriaEvent || hasNayaEvent) && (
                            <div className="flex gap-0.5 mt-0.5 absolute bottom-0.5">
                              {hasBriaEvent && (
                                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-orange-400" />
                              )}
                              {hasNayaEvent && (
                                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-cyan-400" />
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-3 text-[10px] sm:text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-orange-400" />
                <span>B</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>N</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Today</span>
              </div>
            </div>

            {/* Today's Events */}
            {events.filter(e => e.date === today.toISOString().split('T')[0]).length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200/50">
                <h3 className="text-xs sm:text-sm font-display font-semibold text-gray-700 mb-2">
                  Today's Events
                </h3>
                <div className="space-y-1.5">
                  {events
                    .filter(e => e.date === today.toISOString().split('T')[0])
                    .slice(0, 3)
                    .map(event => (
                      <motion.div
                        key={event.id}
                        className="flex items-center gap-2 p-2 bg-white/50 rounded-lg"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <span className="text-lg">{event.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-medium text-gray-800 text-xs sm:text-sm truncate">{event.title}</p>
                        </div>
                        <div className="flex gap-0.5">
                          {(event.child === 'bria' || event.child === 'both') && (
                            <span className="w-4 h-4 bg-orange-400 rounded-full flex items-center justify-center text-white text-[8px] font-bold">B</span>
                          )}
                          {(event.child === 'naya' || event.child === 'both') && (
                            <span className="w-4 h-4 bg-cyan-400 rounded-full flex items-center justify-center text-white text-[8px] font-bold">N</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Parent Access */}
        <motion.div
          className="mt-4 sm:mt-6 flex justify-center"
          variants={itemVariants}
        >
          <motion.button
            onClick={() => navigate('/parent')}
            className="px-4 py-2 bg-white/40 backdrop-blur-sm rounded-full text-gray-600 font-display text-sm hover:bg-white/60 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Parent Settings
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}
