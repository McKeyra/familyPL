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
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import useStore from '../store/useStore'
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
  const {
    children,
    chores,
    events,
    starLog,
    timeLimits,
    challenges,
    groceryList,
    addChore,
    removeChore,
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

  const handleExit = () => {
    setParentMode(false)
    navigate('/')
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
            >
              <div className="mb-6">
                <Button
                  variant="parent"
                  icon={<Plus className="w-5 h-5" />}
                  onClick={() => setShowAddChallenge(true)}
                >
                  Create New Challenge
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {challenges.map((challenge) => {
                  const progress = getChallengeProgress(challenge.id)
                  return (
                    <GlassCard
                      key={challenge.id}
                      variant={challenge.active ? 'parent' : 'default'}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{challenge.emoji}</span>
                          <div>
                            <h3 className={`font-display font-bold text-lg ${challenge.active ? 'text-white' : 'text-gray-800'}`}>
                              {challenge.title}
                            </h3>
                            <p className={`text-sm ${challenge.active ? 'text-white/80' : 'text-gray-600'}`}>
                              {challenge.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="glass"
                            size="sm"
                            onClick={() => toggleChallengeActive(challenge.id)}
                          >
                            {challenge.active ? 'Pause' : 'Resume'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeChallenge(challenge.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className={`rounded-full h-4 overflow-hidden ${challenge.active ? 'bg-white/30' : 'bg-gray-200'}`}>
                          <motion.div
                            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress?.percentage || 0}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className={`text-sm ${challenge.active ? 'text-white/70' : 'text-gray-500'}`}>
                            {progress?.total || 0} / {challenge.target}
                          </span>
                          <span className={`text-sm font-bold ${challenge.active ? 'text-white' : 'text-purple-600'}`}>
                            {Math.round(progress?.percentage || 0)}%
                          </span>
                        </div>
                      </div>

                      {/* Individual Progress */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className={`rounded-xl p-3 ${challenge.active ? 'bg-white/20' : 'bg-gray-100'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span>👧</span>
                            <span className={challenge.active ? 'text-white' : 'text-gray-700'}>Bria</span>
                          </div>
                          <p className={`text-2xl font-bold ${challenge.active ? 'text-white' : 'text-gray-800'}`}>
                            {challenge.progress.bria || 0}
                          </p>
                        </div>
                        <div className={`rounded-xl p-3 ${challenge.active ? 'bg-white/20' : 'bg-gray-100'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span>👶</span>
                            <span className={challenge.active ? 'text-white' : 'text-gray-700'}>Naya</span>
                          </div>
                          <p className={`text-2xl font-bold ${challenge.active ? 'text-white' : 'text-gray-800'}`}>
                            {challenge.progress.naya || 0}
                          </p>
                        </div>
                      </div>

                      {/* Reward */}
                      <div className={`rounded-xl p-3 ${challenge.active ? 'bg-white/20' : 'bg-gray-100'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm ${challenge.active ? 'text-white/70' : 'text-gray-500'}`}>Reward</p>
                            <p className={`font-display font-bold ${challenge.active ? 'text-white' : 'text-gray-800'}`}>
                              {challenge.reward}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            <span className={`font-bold ${challenge.active ? 'text-white' : 'text-gray-800'}`}>
                              {challenge.rewardStars}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Complete Button */}
                      {progress?.isComplete && challenge.active && (
                        <Button
                          variant="success"
                          className="w-full mt-4"
                          onClick={() => completeChallenge(challenge.id)}
                        >
                          🎉 Award Challenge Reward!
                        </Button>
                      )}
                    </GlassCard>
                  )
                })}

                {challenges.length === 0 && (
                  <GlassCard variant="default" className="md:col-span-2 text-center py-12">
                    <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-display font-bold text-gray-600 text-xl mb-2">
                      No Challenges Yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Create a challenge to encourage teamwork between siblings!
                    </p>
                    <Button
                      variant="parent"
                      icon={<Plus className="w-5 h-5" />}
                      onClick={() => setShowAddChallenge(true)}
                    >
                      Create First Challenge
                    </Button>
                  </GlassCard>
                )}
              </div>
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

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-4 sm:mb-6">
                <button
                  onClick={() => setShowAddEvent(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-stone-600 text-white rounded-xl font-display text-sm hover:bg-stone-700 transition-colors"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                  Add Event
                </button>
              </div>

              <GlassCard variant="default">
                <h3 className="font-display font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" strokeWidth={1.5} />
                  Upcoming Events
                </h3>
                <div className="space-y-2">
                  {events
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((event) => {
                      const cat = eventCategories[event.category] || eventCategories.other
                      return (
                        <div
                          key={event.id}
                          className={`flex items-center justify-between p-3 rounded-xl ${cat.color} border`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{cat.icon}</span>
                            <div>
                              <p className="font-display font-semibold text-gray-800">
                                {event.title}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{format(new Date(event.date), 'EEE, MMM d')}</span>
                                <span>•</span>
                                <span>{cat.name}</span>
                                {event.notes && <span>• {event.notes}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-full">
                              {event.child === 'both' ? 'All' : children[event.child]?.name}
                            </span>
                            <button
                              onClick={() => removeEvent(event.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  {events.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" strokeWidth={1} />
                      <p className="font-display">No events scheduled</p>
                    </div>
                  )}
                </div>
              </GlassCard>
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

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-display font-medium text-gray-600 mb-2">
                      Event Title
                    </label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="e.g., Soccer Practice"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-stone-400 focus:outline-none font-display"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-display font-medium text-gray-600 mb-2">
                      Category
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {eventCategoryList.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setNewEvent({ ...newEvent, category: cat.id })}
                          className={`
                            p-2 rounded-xl flex flex-col items-center gap-1 transition-all border
                            ${newEvent.category === cat.id
                              ? `${cat.color} border-2`
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}
                          `}
                        >
                          <span className="text-lg">{cat.icon}</span>
                          <span className="text-[9px] font-display text-gray-600 truncate w-full text-center">
                            {cat.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-display font-medium text-gray-600 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-stone-400 focus:outline-none font-display"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-display font-medium text-gray-600 mb-2">
                      For
                    </label>
                    <select
                      value={newEvent.child}
                      onChange={(e) => setNewEvent({ ...newEvent, child: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-stone-400 focus:outline-none font-display"
                    >
                      <option value="both">Everyone</option>
                      <option value="bria">Bria</option>
                      <option value="naya">Naya</option>
                      <option value="mom">Mom</option>
                      <option value="dad">Dad</option>
                      <option value="parents">Parents</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-display font-medium text-gray-600 mb-2">
                      Notes (optional)
                    </label>
                    <input
                      type="text"
                      value={newEvent.notes}
                      onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                      placeholder="e.g., Bring jersey"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-stone-400 focus:outline-none font-display"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddEvent(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-display hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddEvent}
                    disabled={!newEvent.title.trim() || !newEvent.date}
                    className="flex-1 px-4 py-2.5 bg-stone-600 text-white rounded-xl font-display hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Event
                  </button>
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
    </div>
  )
}
