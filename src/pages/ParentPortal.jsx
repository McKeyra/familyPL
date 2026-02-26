import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  CheckSquare,
  Calendar,
  Star,
  Plus,
  Trash2,
  LayoutDashboard,
  Clock,
  Trophy,
  BarChart3,
  Bell,
  Monitor,
  BookOpen,
  Gamepad2,
  PenLine,
  MoreHorizontal,
  RotateCcw,
  ShoppingCart,
  Users,
  CalendarDays,
  Edit3,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import useStore from '../store/useStore'
import { isWeekend as checkIsWeekend } from '../lib/timezone'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import { eventCategories, eventCategoryList } from '../data/eventCategories'

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'challenges', label: 'Challenges', icon: Trophy },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'grocery', label: 'Grocery', icon: ShoppingCart },
]

const activityTypes = [
  { id: 'screen', label: 'Screen Time', icon: Monitor },
  { id: 'reading', label: 'Reading', icon: BookOpen },
  { id: 'play', label: 'Play Time', icon: Gamepad2 },
  { id: 'homework', label: 'Homework', icon: PenLine },
]

export default function ParentPortal() {
  const navigate = useNavigate()
  const weekend = checkIsWeekend()
  const {
    children,
    chores,
    weekendChores,
    events,
    starLog,
    timeLimits,
    challenges,
    groceryList,
    addChore,
    removeChore,
    updateChore,
    addEvent,
    removeEvent,
    resetRoutine,
    setParentMode,
    setTimeLimit,
    addChallenge,
    removeChallenge,
    toggleChallengeActive,
    getChallengeProgress,
    completeChallenge,
    toggleGroceryItem,
    removeGroceryItem,
  } = useStore()

  const [activeTab, setActiveTab] = useState('overview')
  const [selectedChild, setSelectedChild] = useState('bria')
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [showAddChallenge, setShowAddChallenge] = useState(false)
  const [newTask, setNewTask] = useState({ text: '', emoji: '✨', stars: 1, routine: 'chores' })
  const [newEvent, setNewEvent] = useState({ title: '', category: 'other', date: '', notes: '', child: 'both' })
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    emoji: '🏆',
    target: 10,
    reward: '',
    rewardStars: 20,
  })
  const [editingWeekend, setEditingWeekend] = useState(weekend) // Toggle between weekday/weekend task editing
  const [editingTask, setEditingTask] = useState(null) // { routine, task }
  const [editTaskForm, setEditTaskForm] = useState({ text: '', emoji: '', stars: 1 })
  const editingChores = editingWeekend ? weekendChores : chores

  const handleAddTask = () => {
    if (!newTask.text.trim()) return
    addChore(selectedChild, newTask.routine, {
      id: Date.now().toString(),
      text: newTask.text,
      emoji: newTask.emoji,
      stars: newTask.stars,
      completed: false,
    }, editingWeekend)
    setNewTask({ text: '', emoji: '✨', stars: 1, routine: 'chores' })
    setShowAddTask(false)
  }

  const handleAddEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date) return
    const category = eventCategories[newEvent.category] || eventCategories.other
    addEvent({
      title: newEvent.title,
      category: newEvent.category,
      emoji: category.icon,
      date: newEvent.date,
      notes: newEvent.notes,
      child: newEvent.child,
    })
    setNewEvent({ title: '', category: 'other', date: '', notes: '', child: 'both' })
    setShowAddEvent(false)
  }

  const handleAddChallenge = () => {
    if (!newChallenge.title.trim() || !newChallenge.reward.trim()) return
    addChallenge({
      ...newChallenge,
      progress: { bria: 0, naya: 0 },
      active: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    })
    setNewChallenge({
      title: '',
      description: '',
      emoji: '🏆',
      target: 10,
      reward: '',
      rewardStars: 20,
    })
    setShowAddChallenge(false)
  }

  const handleEditTask = (routine, task) => {
    setEditingTask({ routine, task })
    setEditTaskForm({ text: task.text, emoji: task.emoji, stars: task.stars })
  }

  const handleSaveTask = () => {
    if (!editingTask || !editTaskForm.text.trim()) return
    updateChore(selectedChild, editingTask.routine, editingTask.task.id, {
      text: editTaskForm.text,
      emoji: editTaskForm.emoji,
      stars: editTaskForm.stars,
    }, editingWeekend)
    setEditingTask(null)
    setEditTaskForm({ text: '', emoji: '', stars: 1 })
  }

  const handleExit = () => {
    setParentMode(false)
    navigate('/home')
  }

  const handleTimeLimitChange = (childId, activity, field, value) => {
    const current = timeLimits[childId][activity]
    if (field === 'limit') {
      setTimeLimit(childId, activity, parseInt(value) || 0, current.enabled)
    } else if (field === 'enabled') {
      setTimeLimit(childId, activity, current.limit, value)
    }
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
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Weekend Indicator Banner */}
      {weekend && (
        <motion.div
          className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-2xl">🌟</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">It's the Weekend!</p>
            <p className="text-xs text-amber-600">Weekend tasks are active. No school routines today.</p>
          </div>
        </motion.div>
      )}

      {/* Segmented Control - Pill Style */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex p-1 bg-slate-100 rounded-2xl">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'}
                `}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
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
              className="space-y-4"
            >
              {/* Family Summary - Compact */}
              <div className="grid grid-cols-2 gap-3">
                {Object.values(children).map((child) => {
                  const themeColors = child.theme === 'bria'
                    ? { gradient: 'from-rose-400 to-pink-500', border: 'border-rose-200' }
                    : { gradient: 'from-teal-400 to-cyan-500', border: 'border-teal-200' }

                  return (
                    <div
                      key={child.id}
                      className={`p-4 bg-white rounded-2xl border ${themeColors.border} shadow-sm`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${themeColors.gradient} flex items-center justify-center`}>
                          <span className="text-white font-bold">{child.name[0]}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{child.name}</h3>
                          <p className="text-xs text-slate-500">Age {child.age}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-slate-50 rounded-lg p-2">
                          <p className="text-lg font-bold text-slate-800 tabular-nums">{child.stars}</p>
                          <p className="text-[10px] text-slate-500">Stars</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2">
                          <p className="text-lg font-bold text-slate-800 tabular-nums">{getTotalStarsEarned(child.id)}</p>
                          <p className="text-[10px] text-slate-500">Earned</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2">
                          <p className="text-lg font-bold text-slate-800 tabular-nums">{getCompletedTasksToday(child.id)}</p>
                          <p className="text-[10px] text-slate-500">Today</p>
                        </div>
                      </div>

                      {/* Reset Actions - Collapsed */}
                      <details className="mt-3">
                        <summary className="text-xs text-slate-400 cursor-pointer flex items-center gap-1">
                          <MoreHorizontal className="w-3 h-3" /> Admin actions
                        </summary>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => resetRoutine(child.id, 'morning')}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                          >
                            <RotateCcw className="w-3 h-3" /> Morning
                          </button>
                          <button
                            onClick={() => resetRoutine(child.id, 'bedtime')}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                          >
                            <RotateCcw className="w-3 h-3" /> Bedtime
                          </button>
                        </div>
                      </details>
                    </div>
                  )
                })}
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingCart className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
                    <span className="text-xs text-slate-500">Grocery</span>
                  </div>
                  <p className="text-xl font-bold text-slate-800 tabular-nums">
                    {groceryList?.filter(item => !item.checked).length || 0}
                  </p>
                  <p className="text-[10px] text-slate-400">items needed</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarDays className="w-4 h-4 text-blue-500" strokeWidth={1.5} />
                    <span className="text-xs text-slate-500">Events</span>
                  </div>
                  <p className="text-xl font-bold text-slate-800 tabular-nums">
                    {events?.length || 0}
                  </p>
                  <p className="text-[10px] text-slate-400">upcoming</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-purple-500" strokeWidth={1.5} />
                    <span className="text-xs text-slate-500">Family</span>
                  </div>
                  <p className="text-xl font-bold text-slate-800 tabular-nums">
                    {Object.keys(children).length}
                  </p>
                  <p className="text-[10px] text-slate-400">members</p>
                </div>
              </div>

              {/* Recent Activity - PRIMARY SECTION */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 p-4 border-b border-slate-100">
                  <Bell className="w-4 h-4 text-purple-500" strokeWidth={1.5} />
                  <h3 className="font-semibold text-slate-800">Recent Activity</h3>
                </div>
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {starLog.slice(0, 15).map((log) => {
                    const child = children[log.childId]
                    const themeColor = child?.theme === 'bria' ? 'bg-rose-100 text-rose-600' : 'bg-teal-100 text-teal-600'

                    return (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${themeColor} flex items-center justify-center text-sm font-bold`}>
                            {child?.name?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{log.reason}</p>
                            <p className="text-xs text-slate-400">
                              {format(new Date(log.timestamp), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold tabular-nums ${log.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {log.amount > 0 ? '+' : ''}{log.amount}
                          <Star className="w-3 h-3 inline ml-0.5 fill-current" />
                        </span>
                      </div>
                    )
                  })}
                  {starLog.length === 0 && (
                    <div className="p-8 text-center text-slate-400">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" strokeWidth={1.5} />
                      <p className="text-sm">No activity yet</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}


          {/* Challenges Tab */}
          {activeTab === 'challenges' && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="pb-20"
            >
              <div className="grid md:grid-cols-2 gap-4">
                {challenges.map((challenge) => {
                  const progress = getChallengeProgress(challenge.id)
                  const percentage = progress?.percentage || 0
                  const circumference = 2 * Math.PI * 40
                  const strokeDashoffset = circumference - (percentage / 100) * circumference

                  return (
                    <motion.div
                      key={challenge.id}
                      className={`relative overflow-hidden rounded-2xl border shadow-sm ${
                        challenge.active
                          ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 border-purple-400'
                          : 'bg-white border-slate-200'
                      }`}
                      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                    >
                      {/* Quest Card Header */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                              challenge.active ? 'bg-white/20' : 'bg-purple-100'
                            }`}>
                              {challenge.emoji}
                            </div>
                            <div>
                              <h3 className={`font-semibold text-lg ${challenge.active ? 'text-white' : 'text-slate-800'}`}>
                                {challenge.title}
                              </h3>
                              <p className={`text-sm ${challenge.active ? 'text-white/70' : 'text-slate-500'}`}>
                                {challenge.description || 'Family challenge'}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeChallenge(challenge.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              challenge.active ? 'hover:bg-white/20 text-white/60' : 'hover:bg-slate-100 text-slate-400'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>

                        {/* Circular Progress Ring + Child Contributions */}
                        <div className="flex items-center gap-6">
                          {/* Progress Ring */}
                          <div className="relative w-24 h-24 shrink-0">
                            <svg className="w-24 h-24 transform -rotate-90">
                              <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke={challenge.active ? 'rgba(255,255,255,0.2)' : '#E2E8F0'}
                                strokeWidth="8"
                                fill="none"
                              />
                              <motion.circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke={challenge.active ? '#FCD34D' : '#8B5CF6'}
                                strokeWidth="8"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className={`text-xl font-bold ${challenge.active ? 'text-white' : 'text-slate-800'}`}>
                                {Math.round(percentage)}%
                              </span>
                              <span className={`text-[10px] ${challenge.active ? 'text-white/60' : 'text-slate-400'}`}>
                                {progress?.total || 0}/{challenge.target}
                              </span>
                            </div>
                          </div>

                          {/* Child Contributions */}
                          <div className="flex-1 space-y-2">
                            {/* Bria */}
                            <div className={`flex items-center gap-3 p-2 rounded-xl ${
                              challenge.active ? 'bg-white/10' : 'bg-rose-50'
                            }`}>
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
                                <span className="text-white font-bold text-xs">B</span>
                              </div>
                              <div className="flex-1">
                                <p className={`text-xs ${challenge.active ? 'text-white/70' : 'text-slate-500'}`}>Bria</p>
                                <p className={`text-lg font-bold tabular-nums ${challenge.active ? 'text-white' : 'text-rose-600'}`}>
                                  {challenge.progress.bria || 0}
                                </p>
                              </div>
                            </div>
                            {/* Naya */}
                            <div className={`flex items-center gap-3 p-2 rounded-xl ${
                              challenge.active ? 'bg-white/10' : 'bg-teal-50'
                            }`}>
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                                <span className="text-white font-bold text-xs">N</span>
                              </div>
                              <div className="flex-1">
                                <p className={`text-xs ${challenge.active ? 'text-white/70' : 'text-slate-500'}`}>Naya</p>
                                <p className={`text-lg font-bold tabular-nums ${challenge.active ? 'text-white' : 'text-teal-600'}`}>
                                  {challenge.progress.naya || 0}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Empty Progress Encouragement */}
                        {percentage === 0 && challenge.active && (
                          <div className="mt-3 p-3 bg-white/10 rounded-xl text-center">
                            <p className="text-sm text-white/80">
                              Ready to start? Complete your first task to begin!
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Reward Section - Golden Strip */}
                      <div className={`p-3 ${
                        challenge.active
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                          : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-t border-amber-100'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Trophy className={`w-4 h-4 ${challenge.active ? 'text-amber-900' : 'text-amber-600'}`} strokeWidth={1.5} />
                            <span className={`text-sm font-medium ${challenge.active ? 'text-amber-900' : 'text-amber-700'}`}>
                              {challenge.reward}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" strokeWidth={1.5} />
                            <span className={`font-bold tabular-nums ${challenge.active ? 'text-amber-900' : 'text-amber-700'}`}>
                              +{challenge.rewardStars}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className={`flex gap-2 p-3 ${challenge.active ? 'bg-purple-700/50' : 'bg-slate-50'}`}>
                        <button
                          onClick={() => toggleChallengeActive(challenge.id)}
                          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                            challenge.active
                              ? 'bg-white/20 text-white hover:bg-white/30'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {challenge.active ? 'Pause' : 'Resume'}
                        </button>
                        {progress?.isComplete && challenge.active && (
                          <button
                            onClick={() => completeChallenge(challenge.id)}
                            className="flex-1 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-sm"
                          >
                            Award Reward!
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )
                })}

                {/* Empty State */}
                {challenges.length === 0 && (
                  <div className="md:col-span-2 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg">
                      <Trophy className="w-10 h-10 text-white" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-semibold text-xl text-slate-800 mb-2">
                      Start a Family Quest!
                    </h3>
                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                      Create challenges to encourage teamwork and celebrate achievements together.
                    </p>
                    <button
                      onClick={() => setShowAddChallenge(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-shadow"
                    >
                      <Plus className="w-5 h-5" strokeWidth={1.5} />
                      Create First Challenge
                    </button>
                  </div>
                )}
              </div>

              {/* FAB - Create Challenge Button */}
              {challenges.length > 0 && (
                <motion.button
                  onClick={() => setShowAddChallenge(true)}
                  className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg flex items-center justify-center z-40"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <Plus className="w-6 h-6" strokeWidth={2} />
                </motion.button>
              )}
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
              <div className="flex gap-4 mb-4">
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

              {/* Weekday / Weekend Toggle */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex p-1 bg-slate-100 rounded-xl">
                  <button
                    onClick={() => setEditingWeekend(false)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      !editingWeekend
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" strokeWidth={1.5} />
                    Weekday
                  </button>
                  <button
                    onClick={() => setEditingWeekend(true)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      editingWeekend
                        ? 'bg-amber-100 text-amber-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Gamepad2 className="w-4 h-4" strokeWidth={1.5} />
                    Weekend
                  </button>
                </div>
                {editingWeekend && (
                  <span className="text-xs text-amber-600 font-medium px-2 py-1 bg-amber-50 rounded-full">
                    Editing weekend tasks
                  </span>
                )}
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
              <div className="grid md:grid-cols-2 gap-4">
                {(editingWeekend ? ['morning', 'bedtime', 'chores'] : ['morning', 'afterSchool', 'bedtime', 'chores']).map((routine) => {
                  const routineLabels = {
                    morning: 'Morning Routine',
                    afterSchool: 'After School',
                    bedtime: 'Bedtime Routine',
                    chores: 'Chores',
                  }
                  return (
                    <div key={routine} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className={`p-3 border-b border-slate-100 ${editingWeekend ? 'bg-amber-50' : 'bg-slate-50'}`}>
                        <h3 className="font-semibold text-slate-800">
                          {routineLabels[routine]}
                        </h3>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {editingChores[selectedChild]?.[routine]?.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{task.emoji}</span>
                              <span className="text-sm text-slate-700">{task.text}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-slate-400 mr-2">{task.stars}⭐</span>
                              <button
                                onClick={() => handleEditTask(routine, task)}
                                className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                              </button>
                              <button
                                onClick={() => removeChore(selectedChild, routine, task.id, editingWeekend)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                              </button>
                            </div>
                          </div>
                        ))}
                        {(!editingChores[selectedChild]?.[routine] || editingChores[selectedChild]?.[routine]?.length === 0) && (
                          <div className="p-4 text-center text-slate-400 text-sm">
                            No tasks yet
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
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
                  Add Event
                </Button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-semibold text-slate-800">Upcoming Events</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {events
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((event) => {
                      const cat = eventCategories[event.category] || eventCategories.other
                      return (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center border`}>
                              <span className="text-lg">{cat.icon}</span>
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{event.title}</p>
                              <p className="text-xs text-slate-500">
                                {format(new Date(event.date), 'EEE, MMM d')} • {event.child === 'both' ? 'Everyone' : children[event.child]?.name}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeEvent(event.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>
                      )
                    })}
                  {events.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                      <span className="text-4xl mb-2 block">📅</span>
                      <p className="text-sm">No events scheduled</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Grocery Tab */}
          {activeTab === 'grocery' && (
            <motion.div
              key="grocery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">Shopping List</h2>
                <button
                  onClick={() => navigate('/grocery')}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" strokeWidth={1.5} />
                  Open Full List
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {groceryList?.filter(item => !item.checked).slice(0, 10).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleGroceryItem(item.id)}
                          className="w-5 h-5 rounded border-2 border-slate-300 flex items-center justify-center hover:border-slate-400 transition-colors"
                        />
                        <span className="text-sm text-slate-700">{item.name}</span>
                        {item.quantity > 1 && (
                          <span className="text-xs text-slate-400">x{item.quantity}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 capitalize">{item.category}</span>
                        <button
                          onClick={() => removeGroceryItem(item.id)}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!groceryList || groceryList.filter(item => !item.checked).length === 0) && (
                    <div className="p-8 text-center text-slate-400">
                      <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" strokeWidth={1.5} />
                      <p className="text-sm">Shopping list is empty</p>
                    </div>
                  )}
                </div>
                {groceryList?.filter(item => !item.checked).length > 10 && (
                  <div className="p-3 bg-slate-50 text-center">
                    <button
                      onClick={() => navigate('/grocery')}
                      className="text-sm text-slate-600 hover:text-slate-800 font-medium"
                    >
                      View all {groceryList.filter(item => !item.checked).length} items
                    </button>
                  </div>
                )}
              </div>

              {/* Checked Items Summary */}
              {groceryList?.filter(item => item.checked).length > 0 && (
                <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckSquare className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-sm font-medium">
                      {groceryList.filter(item => item.checked).length} items completed
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>

        {/* Add Task Modal - Premium Design */}
        <AnimatePresence>
          {showAddTask && (
            <motion.div
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 sm:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddTask(false)}
            >
              <motion.div
                className="bg-gradient-to-b from-white to-slate-50 rounded-t-[28px] sm:rounded-[28px] w-full max-w-lg shadow-[0_-8px_40px_rgba(0,0,0,0.12)] max-h-[92vh] overflow-hidden"
                initial={{ y: '100%', opacity: 0.5 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0.5 }}
                transition={{ type: 'spring', damping: 32, stiffness: 400 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                  <div className="w-10 h-1 rounded-full bg-slate-300" />
                </div>

                {/* Header */}
                <div className="px-6 pt-4 pb-5 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
                        New Task
                      </h2>
                      <p className="text-sm text-slate-500 mt-0.5">
                        For {children[selectedChild]?.name} • {editingWeekend ? 'Weekend' : 'Weekday'}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddTask(false)}
                      className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-500" strokeWidth={2} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[calc(92vh-200px)]">
                  {/* Task Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Task Name
                    </label>
                    <input
                      type="text"
                      value={newTask.text}
                      onChange={(e) => setNewTask({ ...newTask, text: e.target.value })}
                      placeholder="Make bed, Brush teeth..."
                      className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm focus:border-violet-400 focus:ring-4 focus:ring-violet-100 focus:outline-none text-slate-800 font-medium placeholder:text-slate-400 transition-all"
                    />
                  </div>

                  {/* Routine Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      Routine
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { id: 'morning', label: 'Morning', icon: '🌅' },
                        ...(!editingWeekend ? [{ id: 'afterSchool', label: 'After School', icon: '🎒' }] : []),
                        { id: 'bedtime', label: 'Bedtime', icon: '🌙' },
                        { id: 'chores', label: 'Chores', icon: '✨' },
                      ].map((routine) => (
                        <motion.button
                          key={routine.id}
                          onClick={() => setNewTask({ ...newTask, routine: routine.id })}
                          className={`
                            p-3.5 rounded-2xl flex items-center gap-3 transition-all
                            ${newTask.routine === routine.id
                              ? 'bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-200'
                              : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md'}
                          `}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="text-xl">{routine.icon}</span>
                          <span className={`font-semibold text-sm ${newTask.routine === routine.id ? 'text-white' : 'text-slate-700'}`}>
                            {routine.label}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Stars Reward */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      Stars Reward
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <motion.button
                          key={num}
                          onClick={() => setNewTask({ ...newTask, stars: num })}
                          className={`
                            flex-1 py-3 rounded-xl font-semibold text-sm transition-all
                            ${newTask.stars === num
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 shadow-lg shadow-amber-200'
                              : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-300'}
                          `}
                          whileTap={{ scale: 0.95 }}
                        >
                          {num} ⭐
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Emoji */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Emoji
                    </label>
                    <input
                      type="text"
                      value={newTask.emoji}
                      onChange={(e) => setNewTask({ ...newTask, emoji: e.target.value })}
                      className="w-24 px-4 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm focus:border-violet-400 focus:ring-4 focus:ring-violet-100 focus:outline-none text-center text-3xl transition-all"
                      maxLength={2}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-slate-100 bg-white/80 backdrop-blur-sm">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAddTask(false)}
                      className="flex-1 px-5 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-semibold hover:bg-slate-200 active:scale-[0.98] transition-all"
                    >
                      Cancel
                    </button>
                    <motion.button
                      onClick={handleAddTask}
                      disabled={!newTask.text.trim()}
                      className="flex-1 px-5 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg shadow-violet-200 hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                      whileTap={{ scale: 0.98 }}
                    >
                      Add Task
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Event Modal - Premium Design */}
        <AnimatePresence>
          {showAddEvent && (
            <motion.div
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 sm:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddEvent(false)}
            >
              <motion.div
                className="bg-gradient-to-b from-white to-slate-50 rounded-t-[28px] sm:rounded-[28px] w-full max-w-lg shadow-[0_-8px_40px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.1)] max-h-[92vh] overflow-hidden"
                initial={{ y: '100%', opacity: 0.5 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0.5 }}
                transition={{ type: 'spring', damping: 32, stiffness: 400 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drag handle for mobile */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                  <div className="w-10 h-1 rounded-full bg-slate-300" />
                </div>

                {/* Header */}
                <div className="px-6 pt-4 pb-5 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
                        New Event
                      </h2>
                      <p className="text-sm text-slate-500 mt-0.5">Add to family calendar</p>
                    </div>
                    <button
                      onClick={() => setShowAddEvent(false)}
                      className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-500" strokeWidth={2} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-5 space-y-6 overflow-y-auto max-h-[calc(92vh-200px)]">
                  {/* Event Title */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Event Title
                    </label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="Soccer practice, Birthday party..."
                      className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm focus:border-violet-400 focus:ring-4 focus:ring-violet-100 focus:outline-none text-slate-800 font-medium placeholder:text-slate-400 transition-all"
                    />
                  </div>

                  {/* Category - Premium Grid */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      Category
                    </label>
                    <div className="grid grid-cols-4 gap-2.5">
                      {eventCategoryList.map((cat) => {
                        const isSelected = newEvent.category === cat.id
                        return (
                          <motion.button
                            key={cat.id}
                            type="button"
                            onClick={() => setNewEvent({ ...newEvent, category: cat.id })}
                            className={`
                              relative p-3.5 rounded-2xl flex flex-col items-center gap-2 transition-all
                              ${isSelected
                                ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-200 scale-[1.02]'
                                : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md'}
                            `}
                            whileTap={{ scale: 0.95 }}
                          >
                            <span className={`text-2xl ${isSelected ? 'drop-shadow-sm' : ''}`}>{cat.icon}</span>
                            <span className={`text-[11px] font-semibold tracking-tight ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                              {cat.name}
                            </span>
                            {isSelected && (
                              <motion.div
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500 }}
                              >
                                <div className="w-2.5 h-2.5 bg-violet-500 rounded-full" />
                              </motion.div>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Date - Premium Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm focus:border-violet-400 focus:ring-4 focus:ring-violet-100 focus:outline-none text-slate-800 font-medium transition-all"
                      />
                    </div>
                  </div>

                  {/* For Who - Premium Select */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      For
                    </label>
                    <div className="relative">
                      <select
                        value={newEvent.child}
                        onChange={(e) => setNewEvent({ ...newEvent, child: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm focus:border-violet-400 focus:ring-4 focus:ring-violet-100 focus:outline-none text-slate-800 font-medium appearance-none cursor-pointer transition-all"
                      >
                        <option value="both">Everyone</option>
                        <option value="bria">Bria</option>
                        <option value="naya">Naya</option>
                        <option value="mom">Mom</option>
                        <option value="dad">Dad</option>
                        <option value="parents">Parents</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Notes <span className="text-slate-300 font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={newEvent.notes}
                      onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                      placeholder="Bring jersey, pick up at 5pm..."
                      className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm focus:border-violet-400 focus:ring-4 focus:ring-violet-100 focus:outline-none text-slate-800 font-medium placeholder:text-slate-400 transition-all"
                    />
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-5 border-t border-slate-100 bg-white/80 backdrop-blur-sm">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAddEvent(false)}
                      className="flex-1 px-5 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-semibold hover:bg-slate-200 active:scale-[0.98] transition-all"
                    >
                      Cancel
                    </button>
                    <motion.button
                      onClick={handleAddEvent}
                      disabled={!newEvent.title.trim() || !newEvent.date}
                      className="flex-1 px-5 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                      whileTap={{ scale: 0.98 }}
                    >
                      Add Event
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Challenge Modal */}
        <AnimatePresence>
          {showAddChallenge && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddChallenge(false)}
            >
              <motion.div
                className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
                  Create Team Challenge 🤝
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                      Challenge Name
                    </label>
                    <input
                      type="text"
                      value={newChallenge.title}
                      onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                      placeholder="e.g., Kindness Week"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none font-display"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newChallenge.description}
                      onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                      placeholder="e.g., Send hearts to each other"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none font-display"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                      Emoji
                    </label>
                    <input
                      type="text"
                      value={newChallenge.emoji}
                      onChange={(e) => setNewChallenge({ ...newChallenge, emoji: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none font-display text-center text-3xl"
                      maxLength={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                      Target (combined total)
                    </label>
                    <input
                      type="number"
                      value={newChallenge.target}
                      onChange={(e) => setNewChallenge({ ...newChallenge, target: parseInt(e.target.value) || 0 })}
                      min="1"
                      max="100"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none font-display"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                      Reward
                    </label>
                    <input
                      type="text"
                      value={newChallenge.reward}
                      onChange={(e) => setNewChallenge({ ...newChallenge, reward: e.target.value })}
                      placeholder="e.g., Family Movie Night"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none font-display"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                      Bonus Stars (split between kids)
                    </label>
                    <div className="flex gap-2">
                      {[10, 20, 30, 40, 50].map((num) => (
                        <Button
                          key={num}
                          variant={newChallenge.rewardStars === num ? 'parent' : 'glass'}
                          size="sm"
                          onClick={() => setNewChallenge({ ...newChallenge, rewardStars: num })}
                        >
                          {num} ⭐
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setShowAddChallenge(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="parent"
                    className="flex-1"
                    onClick={handleAddChallenge}
                    disabled={!newChallenge.title.trim() || !newChallenge.reward.trim()}
                  >
                    Create Challenge
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
      </AnimatePresence>

      {/* Edit Task Modal */}
      <AnimatePresence>
        {editingTask && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingTask(null)}
          >
            <motion.div
              className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl"
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">
                  Edit Task
                </h2>
                <button
                  onClick={() => setEditingTask(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    Task Name
                  </label>
                  <input
                    type="text"
                    value={editTaskForm.text}
                    onChange={(e) => setEditTaskForm({ ...editTaskForm, text: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-400 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={editTaskForm.emoji}
                    onChange={(e) => setEditTaskForm({ ...editTaskForm, emoji: e.target.value })}
                    className="w-24 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-400 focus:outline-none text-center text-2xl"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    Stars Reward
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setEditTaskForm({ ...editTaskForm, stars: num })}
                        className={`
                          flex-1 py-2 rounded-lg text-sm font-medium transition-colors
                          ${editTaskForm.stars === num
                            ? 'bg-slate-800 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                        `}
                      >
                        {num}⭐
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingTask(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTask}
                  disabled={!editTaskForm.text.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
