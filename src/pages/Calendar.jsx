import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns'
import useStore from '../store/useStore'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import { eventCategories, eventCategoryList } from '../data/eventCategories'

export default function Calendar() {
  const { currentChild, children, events, addEvent, removeEvent, getChildEvents, isParentMode } = useStore()
  const child = currentChild ? children[currentChild] : null

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    category: 'other',
    notes: '',
    time: '',
  })

  // Theme colors
  const themeColors = {
    bria: {
      accent: 'bg-rose-500',
      light: 'bg-rose-100',
      text: 'text-rose-600',
      gradient: 'from-rose-400 to-pink-500',
      border: 'border-rose-300',
    },
    naya: {
      accent: 'bg-sky-500',
      light: 'bg-sky-100',
      text: 'text-sky-600',
      gradient: 'from-sky-400 to-cyan-500',
      border: 'border-sky-300',
    },
    parent: {
      accent: 'bg-stone-600',
      light: 'bg-stone-100',
      text: 'text-stone-600',
      gradient: 'from-stone-500 to-amber-600',
      border: 'border-stone-300',
    },
  }

  const theme = isParentMode ? 'parent' : (child?.theme || 'bria')
  const colors = themeColors[theme]

  const childEvents = getChildEvents(currentChild)

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  const startDay = startOfMonth(currentMonth).getDay()
  const paddingDays = [...Array(startDay)].map((_, i) => null)

  const getEventsForDate = (date) => {
    return childEvents.filter((event) =>
      isSameDay(new Date(event.date), date)
    )
  }

  const handleAddEvent = () => {
    if (!newEvent.title || !selectedDate) return

    const category = eventCategories[newEvent.category]
    addEvent({
      title: newEvent.title,
      category: newEvent.category,
      emoji: category?.icon || '📅',
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: newEvent.time,
      notes: newEvent.notes,
      child: currentChild,
    })

    setNewEvent({ title: '', category: 'other', notes: '', time: '' })
    setShowAddEvent(false)
  }

  if (!child && !isParentMode) return null

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-4 sm:mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <CalendarIcon className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2 ${colors.text}`} strokeWidth={1.5} />
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-800">
          Calendar
        </h1>
      </motion.div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4 bg-white/60 rounded-xl p-3 backdrop-blur">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
        </button>

        <motion.h2
          key={format(currentMonth, 'MMMM yyyy')}
          className="text-lg sm:text-xl font-display font-bold text-gray-800"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {format(currentMonth, 'MMMM yyyy')}
        </motion.h2>

        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className={`bg-gradient-to-br ${colors.gradient} rounded-2xl p-3 sm:p-4 mb-4 shadow-lg`}>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div
              key={i}
              className="text-center text-white/70 font-display font-medium py-1 text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}</span>
              <span className="sm:hidden">{day}</span>
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {paddingDays.map((_, i) => (
            <div key={`pad-${i}`} className="aspect-square" />
          ))}
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day)
            const isToday = isSameDay(day, new Date())
            const isSelected = selectedDate && isSameDay(day, selectedDate)

            return (
              <motion.button
                key={day.toISOString()}
                className={`
                  aspect-square rounded-lg sm:rounded-xl p-0.5 sm:p-1 flex flex-col items-center justify-start
                  transition-all relative overflow-hidden
                  ${isToday ? 'bg-white/40 ring-2 ring-white' : 'bg-white/20'}
                  ${isSelected ? 'ring-2 ring-yellow-400 bg-white/40' : ''}
                  hover:bg-white/30
                `}
                onClick={() => setSelectedDate(day)}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.008 }}
              >
                <span className={`
                  text-xs sm:text-sm font-display font-semibold
                  ${isToday ? 'text-white' : 'text-white/80'}
                `}>
                  {format(day, 'd')}
                </span>

                {/* Event indicators */}
                {dayEvents.length > 0 && (
                  <div className="flex flex-wrap gap-0 justify-center mt-0.5">
                    {dayEvents.slice(0, 2).map((event) => {
                      const cat = eventCategories[event.category]
                      return (
                        <span
                          key={event.id}
                          className="text-xs sm:text-base"
                        >
                          {cat?.icon || event.emoji}
                        </span>
                      )
                    })}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] sm:text-xs text-white/70">+{dayEvents.length - 2}</span>
                    )}
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Selected Date Events */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <GlassCard variant="default">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-gray-800">
                  {format(selectedDate, 'EEEE, MMM d')}
                </h3>
                <Button
                  variant="glass"
                  size="sm"
                  icon={<Plus className="w-4 h-4" strokeWidth={1.5} />}
                  onClick={() => setShowAddEvent(true)}
                >
                  Add
                </Button>
              </div>

              {getEventsForDate(selectedDate).length > 0 ? (
                <div className="space-y-2">
                  {getEventsForDate(selectedDate).map((event) => {
                    const cat = eventCategories[event.category] || eventCategories.other
                    return (
                      <motion.div
                        key={event.id}
                        className={`flex items-center gap-3 p-3 rounded-xl ${cat.color} border`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <span className="text-2xl">{cat.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-semibold text-gray-800 truncate">
                            {event.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{cat.name}</span>
                            {event.time && <span>• {event.time}</span>}
                            {event.notes && <span>• {event.notes}</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => removeEvent(event.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <CalendarIcon className="w-10 h-10 mx-auto mb-2 opacity-30" strokeWidth={1} />
                  <p className="font-display text-sm">No events</p>
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddEvent && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddEvent(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-display font-bold text-gray-800 mb-4 text-center">
                Add Event
              </h2>

              {/* Event Title */}
              <div className="mb-4">
                <label className="block text-sm font-display font-medium text-gray-600 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="e.g., Soccer Practice"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-gray-400 focus:outline-none font-display"
                  autoFocus
                />
              </div>

              {/* Category Selection */}
              <div className="mb-4">
                <label className="block text-sm font-display font-medium text-gray-600 mb-2">
                  Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {eventCategoryList.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setNewEvent({ ...newEvent, category: cat.id })}
                      className={`
                        p-2 rounded-xl flex flex-col items-center gap-1 transition-all border
                        ${newEvent.category === cat.id
                          ? `${cat.color} border-2`
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}
                      `}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-[10px] font-display text-gray-600 truncate w-full text-center">
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time (Optional) */}
              <div className="mb-4">
                <label className="block text-sm font-display font-medium text-gray-600 mb-2">
                  Time (optional)
                </label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-gray-400 focus:outline-none font-display"
                />
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-display font-medium text-gray-600 mb-2">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={newEvent.notes}
                  onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                  placeholder="e.g., Bring jersey"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-gray-400 focus:outline-none font-display"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowAddEvent(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className={`flex-1 bg-gradient-to-r ${colors.gradient} text-white`}
                  onClick={handleAddEvent}
                  disabled={!newEvent.title}
                >
                  Add Event
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
