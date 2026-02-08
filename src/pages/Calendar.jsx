import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  Calendar as CalendarIcon,
  Clock,
  Users,
  FileText,
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns'
import useStore from '../store/useStore'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import { eventCategories, eventCategoryList } from '../data/eventCategories'

// Top 6 most common categories for quick access
const quickCategories = eventCategoryList.slice(0, 6)

export default function Calendar() {
  const { currentChild, children, events, addEvent, removeEvent, getChildEvents, isParentMode } = useStore()
  const child = currentChild ? children[currentChild] : null

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [selectedFor, setSelectedFor] = useState('both')
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
      dot: 'bg-rose-500',
    },
    naya: {
      accent: 'bg-teal-500',
      light: 'bg-teal-100',
      text: 'text-teal-600',
      gradient: 'from-teal-400 to-cyan-500',
      border: 'border-teal-300',
      dot: 'bg-teal-500',
    },
    parent: {
      accent: 'bg-slate-600',
      light: 'bg-slate-100',
      text: 'text-slate-600',
      gradient: 'from-slate-500 to-slate-600',
      border: 'border-slate-300',
      dot: 'bg-slate-500',
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
      child: selectedFor,
    })

    setNewEvent({ title: '', category: 'other', notes: '', time: '' })
    setSelectedFor('both')
    setShowMoreOptions(false)
    setShowAllCategories(false)
    setShowAddEvent(false)
  }

  if (!child && !isParentMode) return null

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto">
      {/* Month Navigation - Compact */}
      <div className="flex items-center justify-between mb-4 bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
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

      {/* Calendar Grid - Neutral with theme accents */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 mb-4 border border-slate-200 shadow-sm">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div
              key={i}
              className="text-center text-slate-400 font-medium py-1 text-xs"
            >
              {day}
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
                  aspect-square rounded-lg flex flex-col items-center justify-start p-1
                  transition-all relative
                  ${isToday ? `${colors.accent} text-white` : 'hover:bg-slate-100'}
                  ${isSelected && !isToday ? 'bg-slate-100 ring-2 ring-slate-300' : ''}
                `}
                onClick={() => setSelectedDate(day)}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.005 }}
              >
                <span className={`
                  text-sm font-medium tabular-nums
                  ${isToday ? 'text-white' : 'text-slate-700'}
                `}>
                  {format(day, 'd')}
                </span>

                {/* Event dot indicators */}
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map((event, i) => (
                      <div
                        key={event.id}
                        className={`w-1 h-1 rounded-full ${isToday ? 'bg-white' : colors.dot}`}
                      />
                    ))}
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

      {/* Add Event Modal - Bottom Sheet */}
      <AnimatePresence>
        {showAddEvent && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddEvent(false)}
          >
            <motion.div
              className="bg-white rounded-t-3xl p-5 w-full max-w-lg shadow-2xl max-h-[85vh] overflow-y-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Handle */}
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-slate-800">New Event</h2>
                <button
                  onClick={() => setShowAddEvent(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              {/* Primary Fields */}
              {/* Event Title */}
              <div className="mb-4">
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Event title"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:outline-none text-base"
                  autoFocus
                />
              </div>

              {/* Date Display */}
              <div className="mb-4 p-3 bg-slate-50 rounded-xl flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-slate-400" strokeWidth={1.5} />
                <span className="text-sm text-slate-700">
                  {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
                </span>
              </div>

              {/* For Selector - Avatar Pills */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                  For
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'both', label: 'Everyone', icon: Users },
                    { id: 'bria', label: 'Bria', color: 'from-rose-400 to-pink-500' },
                    { id: 'naya', label: 'Naya', color: 'from-teal-400 to-cyan-500' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedFor(option.id)}
                      className={`
                        flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all
                        ${selectedFor === option.id
                          ? option.color
                            ? `bg-gradient-to-r ${option.color} text-white shadow-sm`
                            : 'bg-slate-800 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                      `}
                    >
                      {option.icon ? (
                        <option.icon className="w-4 h-4" strokeWidth={1.5} />
                      ) : (
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${option.color} flex items-center justify-center`}>
                          <span className="text-[10px] text-white font-bold">{option.label[0]}</span>
                        </div>
                      )}
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Category Pills */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {quickCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setNewEvent({ ...newEvent, category: cat.id })}
                      className={`
                        flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all
                        ${newEvent.category === cat.id
                          ? `${cat.color} ring-2 ring-offset-1`
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                      `}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm bg-slate-100 text-slate-500 hover:bg-slate-200"
                  >
                    More
                    <ChevronDown className={`w-3 h-3 transition-transform ${showAllCategories ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Expanded Categories */}
                <AnimatePresence>
                  {showAllCategories && (
                    <motion.div
                      className="mt-2 flex flex-wrap gap-2"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      {eventCategoryList.slice(6).map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setNewEvent({ ...newEvent, category: cat.id })}
                          className={`
                            flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all
                            ${newEvent.category === cat.id
                              ? `${cat.color} ring-2 ring-offset-1`
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                          `}
                        >
                          <span className="text-base">{cat.icon}</span>
                          <span>{cat.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* More Options - Progressive Disclosure */}
              <div className="mb-5">
                <button
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${showMoreOptions ? 'rotate-180' : ''}`} />
                  More options
                </button>

                <AnimatePresence>
                  {showMoreOptions && (
                    <motion.div
                      className="mt-3 space-y-3"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      {/* Time */}
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <Clock className="w-5 h-5 text-slate-400" strokeWidth={1.5} />
                        <input
                          type="time"
                          value={newEvent.time}
                          onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                          className="flex-1 bg-transparent focus:outline-none text-sm text-slate-700"
                          placeholder="Add time"
                        />
                      </div>

                      {/* Notes */}
                      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                        <FileText className="w-5 h-5 text-slate-400 mt-0.5" strokeWidth={1.5} />
                        <input
                          type="text"
                          value={newEvent.notes}
                          onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                          placeholder="Add notes"
                          className="flex-1 bg-transparent focus:outline-none text-sm text-slate-700"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddEvent(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleAddEvent}
                  disabled={!newEvent.title}
                  className={`flex-1 py-3 rounded-xl bg-gradient-to-r ${colors.gradient} text-white text-sm font-medium shadow-sm disabled:opacity-50`}
                  whileTap={{ scale: 0.98 }}
                >
                  Add Event
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
