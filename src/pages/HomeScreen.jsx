import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Star, Clock, CheckCircle2, Calendar, Gift, FileText, TrendingUp, Settings, Sun, Moon, Sparkles, LayoutList } from 'lucide-react'
import useStore from '../store/useStore'
import { getTorontoDate, isWeekend as checkIsWeekend } from '../lib/timezone'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const quickAccessItems = [
  { id: 'timer', icon: Clock, label: 'Timer', path: '/timer', needsChild: true },
  { id: 'morning', icon: Sun, label: 'Morning', path: '/checklist/morning', needsChild: true },
  { id: 'bedtime', icon: Moon, label: 'Bedtime', path: '/checklist/bedtime', needsChild: true },
  { id: 'chores', icon: CheckCircle2, label: 'Tasks', path: '/checklist/chores', needsChild: true },
  { id: 'calendar', icon: Calendar, label: 'Calendar', path: '/calendar', needsChild: false },
  { id: 'rewards', icon: Gift, label: 'Rewards', path: '/rewards', needsChild: true },
  { id: 'notes', icon: FileText, label: 'Notes', path: '/notes', needsChild: false },
  { id: 'progress', icon: TrendingUp, label: 'Progress', path: '/progress', needsChild: false },
]

export default function HomeScreen() {
  const navigate = useNavigate()
  const { children, chores, weekendChores, events, setCurrentChild } = useStore()
  const weekend = checkIsWeekend()
  const activeChores = weekend ? weekendChores : chores
  const [currentDate, setCurrentDate] = useState(getTorontoDate)
  const [currentTime, setCurrentTime] = useState(getTorontoDate)
  const [childSelectPopup, setChildSelectPopup] = useState(null) // { path: string } or null

  // Update time every 60 seconds (not every second - reduces re-renders)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(getTorontoDate()), 60000)
    return () => clearInterval(timer)
  }, [])

  const today = useMemo(() => getTorontoDate(), [])
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Memoize calendar days calculation
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
    const days = []
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null)
    for (let day = 1; day <= daysInMonth; day++) days.push(day)
    return days
  }, [currentYear, currentMonth])

  const getEventsForDay = useCallback((day) => {
    if (!day) return []
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date === dateStr)
  }, [currentYear, currentMonth, events])

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))

  // Memoize task progress calculations
  const getTaskProgress = useCallback((childId) => {
    const childChores = activeChores[childId]
    if (!childChores) return { completed: 0, total: 0, percentage: 0 }
    let completed = 0, total = 0
    Object.values(childChores).forEach(routine => {
      routine.forEach(task => { total++; if (task.completed) completed++ })
    })
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 }
  }, [activeChores])

  const briaProgress = useMemo(() => getTaskProgress('bria'), [getTaskProgress])
  const nayaProgress = useMemo(() => getTaskProgress('naya'), [getTaskProgress])

  const hours = currentTime.getHours()
  const minutes = currentTime.getMinutes().toString().padStart(2, '0')
  const amPm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12

  const isToday = (day) => day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

  // Navigate immediately - no artificial delay
  const handleChildClick = (childId) => {
    setCurrentChild(childId)
    navigate('/dashboard')
  }

  const handleQuickAccess = (item) => {
    if (item.needsChild) {
      setChildSelectPopup({ path: item.path, label: item.label })
    } else {
      navigate(item.path)
    }
  }

  const handleChildSelect = (childId) => {
    setCurrentChild(childId)
    navigate(childSelectPopup.path)
    setChildSelectPopup(null)
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 overflow-x-hidden">
      <div className="p-5 sm:p-8 pb-10 max-w-6xl mx-auto">

        {/* Elegant Header */}
        <header className="mb-8 sm:mb-12">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm sm:text-base text-gray-400 font-medium tracking-wide uppercase">
                {DAYS[today.getDay()]}
                {weekend && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 uppercase tracking-wider">
                    Weekend
                  </span>
                )}
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-900 tracking-tight">
                {MONTHS[today.getMonth()]} {today.getDate()}
              </h1>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-right">
                <p className="text-3xl sm:text-4xl md:text-5xl font-extralight text-gray-800 tabular-nums">
                  {displayHours}:{minutes}
                </p>
                <p className="text-sm text-gray-400 font-medium">{amPm}</p>
              </div>
              {/* Layout Toggle */}
              <button
                onClick={() => navigate('/home')}
                className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm mt-1 active:scale-95 transition-transform"
                title="Switch to list layout"
              >
                <LayoutList className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
              </button>
            </div>
          </div>
          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

          {/* Left Column - Kids & Quick Access */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">

            {/* Kids Cards */}
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Family</h2>
              <div className="grid grid-cols-2 gap-4 sm:gap-6">

                {/* Bria */}
                <button
                  onClick={() => handleChildClick('bria')}
                  className="relative overflow-hidden p-5 sm:p-6 bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100/50 rounded-2xl sm:rounded-3xl text-left transition-all active:scale-[0.98] hover:shadow-lg hover:shadow-rose-100/50"
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
                      <div
                        className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${briaProgress.percentage}%` }}
                      />
                    </div>
                  </div>
                </button>

                {/* Naya */}
                <button
                  onClick={() => handleChildClick('naya')}
                  className="relative overflow-hidden p-5 sm:p-6 bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-100/50 rounded-2xl sm:rounded-3xl text-left transition-all active:scale-[0.98] hover:shadow-lg hover:shadow-cyan-100/50"
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
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${nayaProgress.percentage}%` }}
                      />
                    </div>
                  </div>
                </button>
              </div>
            </section>

            {/* Quick Access */}
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick Access</h2>
              <div className="overflow-x-auto scrollbar-hide -mx-5 px-5 sm:-mx-8 sm:px-8">
                <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
                  {quickAccessItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleQuickAccess(item)}
                      className="flex flex-col items-center p-4 sm:p-5 bg-white border border-gray-100 rounded-2xl min-w-[80px] sm:min-w-[90px] hover:border-gray-200 hover:shadow-md active:scale-95 transition-all"
                    >
                      <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 mb-2" strokeWidth={1.5} />
                      <span className="text-xs sm:text-sm font-medium text-gray-600">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Today's Overview */}
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Today's Tasks</h2>
              <div className="grid grid-cols-2 gap-4">

                {/* Bria Tasks */}
                <button
                  className="p-4 sm:p-5 bg-white border border-gray-100 rounded-2xl text-left hover:border-rose-200 hover:shadow-sm active:scale-[0.98] transition-all"
                  onClick={() => handleChildClick('bria')}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center">
                      <span className="text-xs font-semibold text-rose-600">B</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Bria</span>
                  </div>
                  <div className="space-y-2">
                    {activeChores.bria && Object.entries(activeChores.bria).flatMap(([, tasks]) =>
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
                </button>

                {/* Naya Tasks */}
                <button
                  className="p-4 sm:p-5 bg-white border border-gray-100 rounded-2xl text-left hover:border-cyan-200 hover:shadow-sm active:scale-[0.98] transition-all"
                  onClick={() => handleChildClick('naya')}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center">
                      <span className="text-xs font-semibold text-cyan-600">N</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Naya</span>
                  </div>
                  <div className="space-y-2">
                    {activeChores.naya && Object.entries(activeChores.naya).flatMap(([, tasks]) =>
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
                </button>
              </div>
            </section>
          </div>

          {/* Right Column - Calendar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Calendar</h2>
              <div className="p-5 sm:p-6 bg-white border border-gray-100 rounded-2xl sm:rounded-3xl">

                {/* Month Nav */}
                <div className="flex items-center justify-between mb-5">
                  <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-full transition-colors active:scale-95">
                    <ChevronLeft className="w-4 h-4 text-gray-400" />
                  </button>
                  <h3 className="text-base font-semibold text-gray-800">
                    {MONTHS[currentMonth]} {currentYear}
                  </h3>
                  <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-full transition-colors active:scale-95">
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
              <button
                onClick={() => navigate('/')}
                className="w-full mt-4 p-4 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl transition-colors active:scale-[0.99]"
              >
                <Settings className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Parent Settings</span>
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Child Selection Popup */}
      {childSelectPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setChildSelectPopup(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
              {childSelectPopup.label}
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">Who is this for?</p>

            <div className="grid grid-cols-2 gap-4">
              {/* Bria Option */}
              <button
                onClick={() => handleChildSelect('bria')}
                className="p-5 bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 rounded-2xl hover:border-rose-400 hover:shadow-lg active:scale-95 transition-all"
              >
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-200/50">
                  <span className="text-2xl font-semibold text-white">B</span>
                </div>
                <p className="text-base font-semibold text-gray-800">Bria</p>
              </button>

              {/* Naya Option */}
              <button
                onClick={() => handleChildSelect('naya')}
                className="p-5 bg-gradient-to-br from-cyan-50 to-teal-50 border-2 border-cyan-200 rounded-2xl hover:border-cyan-400 hover:shadow-lg active:scale-95 transition-all"
              >
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-200/50">
                  <span className="text-2xl font-semibold text-white">N</span>
                </div>
                <p className="text-base font-semibold text-gray-800">Naya</p>
              </button>
            </div>

            <button
              onClick={() => setChildSelectPopup(null)}
              className="w-full mt-4 py-3 text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
