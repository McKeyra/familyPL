import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import useStore from '../store/useStore'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import StickerEvent, { stickers } from '../components/ui/StickerEvent'

export default function Calendar() {
  const { currentChild, children, events, addEvent, removeEvent, getChildEvents } = useStore()
  const child = currentChild ? children[currentChild] : null

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    sticker: 'birthday',
    notes: '',
  })

  const childEvents = getChildEvents(currentChild)

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  // Add padding days for calendar grid
  const startDay = startOfMonth(currentMonth).getDay()
  const paddingDays = [...Array(startDay)].map((_, i) => null)

  const getEventsForDate = (date) => {
    return childEvents.filter((event) =>
      isSameDay(new Date(event.date), date)
    )
  }

  const handleAddEvent = () => {
    if (!newEvent.title || !selectedDate) return

    addEvent({
      ...newEvent,
      emoji: stickers[newEvent.sticker]?.emoji || '📅',
      date: format(selectedDate, 'yyyy-MM-dd'),
      child: currentChild,
    })

    setNewEvent({ title: '', sticker: 'birthday', notes: '' })
    setShowAddEvent(false)
  }

  const handleDeleteEvent = (eventId) => {
    removeEvent(eventId)
  }

  if (!child) return null

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="text-5xl block mb-2">📅</span>
        <h1 className="text-3xl font-display font-bold text-gray-800">
          {child.name}'s Calendar
        </h1>
      </motion.div>

      {/* Month Navigation */}
      <GlassCard variant="default" className="mb-6">
        <div className="flex items-center justify-between">
          <Button
            variant="glass"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <motion.h2
            key={format(currentMonth, 'MMMM yyyy')}
            className="text-2xl font-display font-bold text-gray-800"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {format(currentMonth, 'MMMM yyyy')}
          </motion.h2>

          <Button
            variant="glass"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </GlassCard>

      {/* Calendar Grid */}
      <GlassCard variant={child.theme} className="mb-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-white/80 font-display font-semibold py-2"
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
                  aspect-square rounded-xl p-1 flex flex-col items-center justify-start
                  transition-all relative overflow-hidden
                  ${isToday ? 'bg-white/40 ring-2 ring-white' : 'bg-white/20'}
                  ${isSelected ? 'ring-2 ring-yellow-400' : ''}
                  hover:bg-white/30
                `}
                onClick={() => setSelectedDate(day)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
              >
                <span className={`
                  text-sm font-display font-semibold
                  ${isToday ? 'text-white' : 'text-white/80'}
                `}>
                  {format(day, 'd')}
                </span>

                {/* Event stickers */}
                {dayEvents.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 justify-center mt-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <span key={event.id} className="text-lg">
                        {event.emoji}
                      </span>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-xs text-white">+{dayEvents.length - 2}</span>
                    )}
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </GlassCard>

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
                <h3 className="font-display font-bold text-gray-800 text-lg">
                  {format(selectedDate, 'EEEE, MMMM d')}
                </h3>
                <Button
                  variant={child.theme}
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowAddEvent(true)}
                >
                  Add
                </Button>
              </div>

              {getEventsForDate(selectedDate).length > 0 ? (
                <div className="space-y-3">
                  {getEventsForDate(selectedDate).map((event) => (
                    <motion.div
                      key={event.id}
                      className="flex items-center gap-4 p-3 bg-white/30 rounded-xl"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <StickerEvent event={event} size="sm" />
                      <div className="flex-1">
                        <p className="font-display font-bold text-gray-800">
                          {event.title}
                        </p>
                        {event.notes && (
                          <p className="text-sm text-gray-600">{event.notes}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4 font-display">
                  No events scheduled 📝
                </p>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddEvent && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddEvent(false)}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-4 text-center">
                Add Event 📅
              </h2>

              {/* Event Title */}
              <div className="mb-4">
                <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                  What's happening?
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="e.g., Soccer Practice"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none font-display"
                />
              </div>

              {/* Sticker Selection */}
              <div className="mb-4">
                <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                  Pick a sticker
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {Object.entries(stickers).map(([key, sticker]) => (
                    <motion.button
                      key={key}
                      className={`
                        p-2 rounded-xl ${sticker.bg}
                        ${newEvent.sticker === key ? 'ring-2 ring-purple-500 scale-110' : ''}
                      `}
                      onClick={() => setNewEvent({ ...newEvent, sticker: key })}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <span className="text-2xl">{sticker.emoji}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={newEvent.notes}
                  onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                  placeholder="e.g., Bring jersey"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none font-display"
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
                  variant={child.theme}
                  className="flex-1"
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
