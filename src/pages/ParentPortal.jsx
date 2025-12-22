import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  Settings,
  Users,
  CheckSquare,
  Calendar,
  Star,
  Plus,
  Trash2,
  Edit3,
  ArrowLeft,
  BarChart3,
  Bell,
  Shield,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import useStore from '../store/useStore'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'children', label: 'Children', icon: Users },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'events', label: 'Events', icon: Calendar },
]

export default function ParentPortal() {
  const navigate = useNavigate()
  const {
    children,
    chores,
    events,
    starLog,
    addChore,
    removeChore,
    addEvent,
    removeEvent,
    resetRoutine,
    setParentMode,
  } = useStore()

  const [activeTab, setActiveTab] = useState('overview')
  const [selectedChild, setSelectedChild] = useState('bria')
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [newTask, setNewTask] = useState({ text: '', emoji: '✨', stars: 1, routine: 'chores' })
  const [newEvent, setNewEvent] = useState({ title: '', sticker: 'birthday', date: '', notes: '', child: 'both' })

  const handleAddTask = () => {
    if (!newTask.text.trim()) return
    addChore(selectedChild, newTask.routine, {
      id: Date.now().toString(),
      text: newTask.text,
      emoji: newTask.emoji,
      stars: newTask.stars,
      completed: false,
    })
    setNewTask({ text: '', emoji: '✨', stars: 1, routine: 'chores' })
    setShowAddTask(false)
  }

  const handleAddEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date) return
    addEvent({
      title: newEvent.title,
      sticker: newEvent.sticker,
      emoji: '📅',
      date: newEvent.date,
      notes: newEvent.notes,
      child: newEvent.child,
    })
    setNewEvent({ title: '', sticker: 'birthday', date: '', notes: '', child: 'both' })
    setShowAddEvent(false)
  }

  const handleExit = () => {
    setParentMode(false)
    navigate('/')
  }

  // Calculate stats
  const getTotalStarsEarned = (childId) => {
    return starLog
      .filter((log) => log.childId === childId && log.amount > 0)
      .reduce((sum, log) => sum + log.amount, 0)
  }

  const getCompletedTasksToday = (childId) => {
    const today = new Date().toDateString()
    return starLog.filter(
      (log) =>
        log.childId === childId &&
        log.amount > 0 &&
        new Date(log.timestamp).toDateString() === today
    ).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-indigo-50 to-violet-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <Button variant="glass" size="icon" onClick={handleExit}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800 flex items-center gap-2">
                <Shield className="w-8 h-8 text-purple-500" />
                Parent Portal
              </h1>
              <p className="text-gray-600 font-display">Manage your family's activities</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="flex gap-2 mb-6 overflow-x-auto pb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'parent' : 'glass'}
                onClick={() => setActiveTab(tab.id)}
                icon={<Icon className="w-5 h-5" />}
              >
                {tab.label}
              </Button>
            )
          })}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {Object.values(children).map((child) => (
                <GlassCard key={child.id} variant={child.theme} glow={child.theme}>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-5xl">{child.avatar}</span>
                    <div>
                      <h3 className="text-2xl font-display font-bold text-white">
                        {child.name}
                      </h3>
                      <p className="text-white/80">Age {child.age}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center bg-white/20 rounded-xl p-3">
                      <Star className="w-6 h-6 text-yellow-300 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-white">{child.stars}</p>
                      <p className="text-xs text-white/70">Current Stars</p>
                    </div>
                    <div className="text-center bg-white/20 rounded-xl p-3">
                      <BarChart3 className="w-6 h-6 text-green-300 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-white">{getTotalStarsEarned(child.id)}</p>
                      <p className="text-xs text-white/70">Total Earned</p>
                    </div>
                    <div className="text-center bg-white/20 rounded-xl p-3">
                      <CheckSquare className="w-6 h-6 text-blue-300 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-white">{getCompletedTasksToday(child.id)}</p>
                      <p className="text-xs text-white/70">Tasks Today</p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => resetRoutine(child.id, 'morning')}
                    >
                      Reset Morning
                    </Button>
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => resetRoutine(child.id, 'bedtime')}
                    >
                      Reset Bedtime
                    </Button>
                  </div>
                </GlassCard>
              ))}

              {/* Quick Stats */}
              <GlassCard variant="default" className="md:col-span-2">
                <h3 className="font-display font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-500" />
                  Recent Activity
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {starLog.slice(0, 10).map((log) => {
                    const child = children[log.childId]
                    return (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-3 bg-white/30 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{child?.avatar}</span>
                          <div>
                            <p className="font-display font-semibold text-gray-800">
                              {child?.name}: {log.reason}
                            </p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(log.timestamp), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-bold ${log.amount > 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {log.amount > 0 ? '+' : ''}
                          {log.amount} ⭐
                        </span>
                      </div>
                    )
                  })}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Child Selector */}
              <div className="flex gap-4 mb-6">
                {Object.values(children).map((child) => (
                  <Button
                    key={child.id}
                    variant={selectedChild === child.id ? child.theme : 'glass'}
                    onClick={() => setSelectedChild(child.id)}
                    icon={<span className="text-2xl">{child.avatar}</span>}
                  >
                    {child.name}
                  </Button>
                ))}
              </div>

              {/* Add Task Button */}
              <div className="mb-6">
                <Button
                  variant="parent"
                  icon={<Plus className="w-5 h-5" />}
                  onClick={() => setShowAddTask(true)}
                >
                  Add New Task
                </Button>
              </div>

              {/* Tasks by Routine */}
              <div className="grid md:grid-cols-3 gap-6">
                {['morning', 'bedtime', 'chores'].map((routine) => (
                  <GlassCard key={routine} variant="default">
                    <h3 className="font-display font-bold text-gray-800 text-lg mb-4 capitalize">
                      {routine} {routine === 'chores' ? '' : 'Routine'}
                    </h3>
                    <div className="space-y-2">
                      {chores[selectedChild]?.[routine]?.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-2 bg-white/30 rounded-xl"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{task.emoji}</span>
                            <span className="font-display text-gray-700">{task.text}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{task.stars}⭐</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeChore(selectedChild, routine, task.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                ))}
              </div>
            </motion.div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-6">
                <Button
                  variant="parent"
                  icon={<Plus className="w-5 h-5" />}
                  onClick={() => setShowAddEvent(true)}
                >
                  Add New Event
                </Button>
              </div>

              <GlassCard variant="default">
                <h3 className="font-display font-bold text-gray-800 text-lg mb-4">
                  Upcoming Events
                </h3>
                <div className="space-y-3">
                  {events
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 bg-white/30 rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">{event.emoji}</span>
                          <div>
                            <p className="font-display font-bold text-gray-800">
                              {event.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(event.date), 'EEEE, MMMM d')}
                              {event.notes && ` • ${event.notes}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            {event.child === 'both'
                              ? 'Everyone'
                              : children[event.child]?.name}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEvent(event.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  {events.length === 0 && (
                    <p className="text-center text-gray-500 py-8 font-display">
                      No events scheduled
                    </p>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Children Tab */}
          {activeTab === 'children' && (
            <motion.div
              key="children"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {Object.values(children).map((child) => (
                <GlassCard key={child.id} variant={child.theme} glow={child.theme} size="lg">
                  <div className="flex items-center gap-6 mb-6">
                    <motion.span
                      className="text-7xl"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {child.avatar}
                    </motion.span>
                    <div>
                      <h3 className="text-3xl font-display font-bold text-white">
                        {child.name}
                      </h3>
                      <p className="text-white/80 text-lg">Age {child.age}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                        <span className="text-2xl font-bold text-white">{child.stars}</span>
                        <span className="text-white/70">stars</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/20 rounded-xl p-4">
                      <h4 className="font-display font-semibold text-white mb-2">
                        Morning Tasks
                      </h4>
                      <p className="text-3xl font-bold text-white">
                        {chores[child.id]?.morning?.length || 0}
                      </p>
                    </div>
                    <div className="bg-white/20 rounded-xl p-4">
                      <h4 className="font-display font-semibold text-white mb-2">
                        Bedtime Tasks
                      </h4>
                      <p className="text-3xl font-bold text-white">
                        {chores[child.id]?.bedtime?.length || 0}
                      </p>
                    </div>
                    <div className="bg-white/20 rounded-xl p-4">
                      <h4 className="font-display font-semibold text-white mb-2">
                        Chores
                      </h4>
                      <p className="text-3xl font-bold text-white">
                        {chores[child.id]?.chores?.length || 0}
                      </p>
                    </div>
                    <div className="bg-white/20 rounded-xl p-4">
                      <h4 className="font-display font-semibold text-white mb-2">
                        Total Earned
                      </h4>
                      <p className="text-3xl font-bold text-white">
                        {getTotalStarsEarned(child.id)} ⭐
                      </p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Task Modal */}
        <AnimatePresence>
          {showAddTask && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddTask(false)}
            >
              <motion.div
                className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
                  Add New Task
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                      Task Name
                    </label>
                    <input
                      type="text"
                      value={newTask.text}
                      onChange={(e) => setNewTask({ ...newTask, text: e.target.value })}
                      placeholder="e.g., Make bed"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none font-display"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                      Routine
                    </label>
                    <select
                      value={newTask.routine}
                      onChange={(e) => setNewTask({ ...newTask, routine: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none font-display"
                    >
                      <option value="morning">Morning</option>
                      <option value="bedtime">Bedtime</option>
                      <option value="chores">Chores</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                      Stars Reward
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <Button
                          key={num}
                          variant={newTask.stars === num ? 'parent' : 'glass'}
                          size="sm"
                          onClick={() => setNewTask({ ...newTask, stars: num })}
                        >
                          {num} ⭐
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                      Emoji
                    </label>
                    <input
                      type="text"
                      value={newTask.emoji}
                      onChange={(e) => setNewTask({ ...newTask, emoji: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none font-display text-center text-2xl"
                      maxLength={2}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setShowAddTask(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="parent"
                    className="flex-1"
                    onClick={handleAddTask}
                    disabled={!newTask.text.trim()}
                  >
                    Add Task
                  </Button>
                </div>
              </motion.div>
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
                <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
                  Add New Event
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                      Event Title
                    </label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="e.g., Soccer Practice"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none font-display"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none font-display"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                      For
                    </label>
                    <select
                      value={newEvent.child}
                      onChange={(e) => setNewEvent({ ...newEvent, child: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none font-display"
                    >
                      <option value="both">Everyone</option>
                      <option value="bria">Bria</option>
                      <option value="naya">Naya</option>
                    </select>
                  </div>

                  <div>
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
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setShowAddEvent(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="parent"
                    className="flex-1"
                    onClick={handleAddEvent}
                    disabled={!newEvent.title.trim() || !newEvent.date}
                  >
                    Add Event
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
