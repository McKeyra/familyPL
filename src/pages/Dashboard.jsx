import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import {
  Sun,
  Moon,
  Sparkles,
  Clock,
  Calendar,
  StickyNote,
  Gift,
  ShoppingCart,
  Heart,
  Star,
  ChevronRight,
  Backpack,
} from 'lucide-react'
import useStore from '../store/useStore'
import ChildAvatar from '../components/ui/ChildAvatar'
import AvatarCustomizer from '../components/ui/AvatarCustomizer'
import { getTorontoDate, isWeekend as checkIsWeekend } from '../lib/timezone'
import { eventCategories } from '../data/eventCategories'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'

// Routine definitions with icons (no emoji)
const routines = [
  { id: 'morning', title: 'Morning', icon: Sun, description: 'Start your day right' },
  { id: 'afterSchool', title: 'After School', icon: Backpack, description: 'Home from school' },
  { id: 'bedtime', title: 'Bedtime', icon: Moon, description: 'Wind down time' },
  { id: 'chores', title: 'Chores', icon: Sparkles, description: 'Earn extra stars' },
]

// Quick actions with icons
const quickActions = [
  { id: 'timer', path: '/timer', icon: Clock, label: 'Timer' },
  { id: 'calendar', path: '/calendar', icon: Calendar, label: 'Calendar' },
  { id: 'notes', path: '/notes', icon: StickyNote, label: 'Notes' },
  { id: 'rewards', path: '/rewards', icon: Gift, label: 'Rewards' },
  { id: 'grocery', path: '/grocery', icon: ShoppingCart, label: 'Shop' },
]

// Theme configurations
const themeConfig = {
  bria: {
    primary: '#F43F5E',
    primaryLight: '#FFF1F2',
    gradient: 'from-rose-400 to-pink-500',
    gradientLight: 'from-rose-50 to-pink-50',
    border: 'border-rose-200',
    text: 'text-rose-600',
    bg: 'bg-rose-500',
    bgLight: 'bg-rose-100',
  },
  naya: {
    primary: '#14B8A6',
    primaryLight: '#F0FDFA',
    gradient: 'from-teal-400 to-cyan-500',
    gradientLight: 'from-teal-50 to-cyan-50',
    border: 'border-teal-200',
    text: 'text-teal-600',
    bg: 'bg-teal-500',
    bgLight: 'bg-teal-100',
  },
}

// Determine which routine should be hero based on time
function getHeroRoutine() {
  const hour = getTorontoDate().getHours()
  if (hour >= 5 && hour < 10) return 'morning'
  if (hour >= 14 && hour < 17) return 'afterSchool'
  if (hour >= 19 || hour < 5) return 'bedtime'
  return 'chores'
}

// Profile switcher component
function ProfileSwitcher({ children, currentChild, onSelect }) {
  return (
    <div className="flex gap-2">
      {['bria', 'naya'].map((childId) => {
        const child = children[childId]
        const isActive = currentChild === childId
        const theme = themeConfig[childId]

        return (
          <motion.button
            key={childId}
            onClick={() => onSelect(childId)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full transition-all
              ${isActive
                ? `bg-gradient-to-r ${theme.gradient} shadow-md`
                : 'bg-white border border-slate-200'}
            `}
            whileTap={{ scale: 0.95 }}
          >
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs
              ${isActive ? 'bg-white/30 text-white' : `${theme.bgLight} ${theme.text}`}
            `}>
              {childId[0].toUpperCase()}
            </div>
            <div className="flex items-center gap-1">
              <Star className={`w-3 h-3 ${isActive ? 'text-white fill-white' : `${theme.text} fill-current`}`} strokeWidth={1.5} />
              <span className={`text-xs font-semibold tabular-nums ${isActive ? 'text-white' : 'text-slate-700'}`}>
                {child?.stars || 0}
              </span>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { currentChild, children, chores, weekendChores, getChildEvents, sendHeart, setCurrentChild } = useStore()
  const weekend = checkIsWeekend()
  const activeChores = weekend ? weekendChores : chores
  const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false)
  const [currentTime, setCurrentTime] = useState(getTorontoDate())

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getTorontoDate())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Default to bria if no child selected
  const activeChild = currentChild || 'bria'
  const child = children[activeChild]
  const siblingId = activeChild === 'bria' ? 'naya' : 'bria'
  const sibling = children[siblingId]
  const childChores = activeChores[activeChild]
  const upcomingEvents = getChildEvents(activeChild).slice(0, 3)
  const theme = themeConfig[child?.theme] || themeConfig.bria

  // Filter routines based on weekend (no afterSchool on weekends)
  const availableRoutines = useMemo(() => {
    return weekend ? routines.filter(r => r.id !== 'afterSchool') : routines
  }, [weekend])

  // Get hero routine based on time
  const heroRoutineId = useMemo(() => getHeroRoutine(), [])

  // Set default child on first load
  if (!currentChild) {
    setCurrentChild('bria')
  }

  // Calculate progress for each routine
  const getProgress = (routineId) => {
    if (!childChores || !childChores[routineId]) return { completed: 0, total: 0, percentage: 0 }
    const tasks = childChores[routineId]
    const completed = tasks.filter((t) => t.completed).length
    return {
      completed,
      total: tasks.length,
      percentage: tasks.length > 0 ? (completed / tasks.length) * 100 : 0,
    }
  }

  const handleSendHeart = () => {
    sendHeart(activeChild, siblingId)
  }

  // Separate hero and secondary routines
  const heroRoutine = availableRoutines.find(r => r.id === heroRoutineId) || availableRoutines[0]
  const secondaryRoutines = availableRoutines.filter(r => r.id !== heroRoutine?.id)

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto">
      {/* Top Bar - Profile Switcher + Time */}
      <motion.div
        className="flex items-center justify-between mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Left: Profile Switcher Pills */}
        <ProfileSwitcher
          children={children}
          currentChild={activeChild}
          onSelect={setCurrentChild}
        />

        {/* Right: Time + Date + Weekend indicator */}
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-800 tabular-nums">
            {format(currentTime, 'h:mm a')}
          </p>
          <div className="flex items-center gap-1.5 justify-end">
            <p className="text-xs text-slate-500">
              {format(currentTime, 'EEE, MMM d')}
            </p>
            {weekend && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">
                Weekend
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Child Info Row */}
      <motion.header
        className="flex items-center gap-3 mb-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
      >
        <motion.div
          className="relative"
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAvatarCustomizer(true)}
        >
          <ChildAvatar child={child} size="md" />
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r ${theme.gradient} flex items-center justify-center shadow-sm`}>
            <span className="text-[10px] font-bold text-white">{child?.stars || 0}</span>
          </div>
        </motion.div>
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Hi {child?.name}!</h1>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Star className={`w-3 h-3 ${theme.text} fill-current`} strokeWidth={1.5} />
            <span className="tabular-nums">{child?.stars || 0} stars</span>
          </div>
        </div>
      </motion.header>

      {/* Hero Routine Card - Contextual */}
      {heroRoutine && (
        <motion.button
          className={`w-full p-5 rounded-2xl bg-gradient-to-br ${theme.gradient} shadow-lg mb-4`}
          onClick={() => navigate(`/checklist/${heroRoutine.id}`)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <heroRoutine.icon className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold text-white">{heroRoutine.title}</h2>
                <p className="text-sm text-white/80">{heroRoutine.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white tabular-nums">
                {getProgress(heroRoutine.id).completed}/{getProgress(heroRoutine.id).total}
              </div>
              <p className="text-xs text-white/70">tasks</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 bg-white/20 rounded-full h-2">
            <motion.div
              className="bg-white rounded-full h-2"
              initial={{ width: 0 }}
              animate={{ width: `${getProgress(heroRoutine.id).percentage}%` }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />
          </div>
        </motion.button>
      )}

      {/* Secondary Routine Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {secondaryRoutines.map((routine, index) => {
          const progress = getProgress(routine.id)
          const Icon = routine.icon
          const isActive = heroRoutineId !== routine.id

          return (
            <motion.button
              key={routine.id}
              className={`p-4 rounded-2xl bg-white border ${theme.border} shadow-sm text-left`}
              onClick={() => navigate(`/checklist/${routine.id}`)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.98 }}
              whileHover={{ y: -2 }}
              transition={{ delay: 0.15 + index * 0.05 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${theme.bgLight} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${theme.text}`} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{routine.title}</h3>
                  <p className="text-xs text-slate-500 tabular-nums">{progress.completed}/{progress.total}</p>
                </div>
              </div>
              {/* Mini progress bar */}
              <div className="bg-slate-100 rounded-full h-1.5">
                <motion.div
                  className={`${theme.bg} rounded-full h-1.5`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percentage}%` }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                />
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Quick Actions - Icon buttons */}
      <motion.section
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="flex justify-between">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.button
                key={action.id}
                onClick={() => navigate(action.path)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl ${theme.bgLight} min-w-[60px]`}
                whileTap={{ scale: 0.92 }}
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + index * 0.05 }}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-medium text-slate-600">{action.label}</span>
              </motion.button>
            )
          })}
        </div>
      </motion.section>

      {/* Two Column Layout - Coming Up + Kindness */}
      <div className="grid grid-cols-2 gap-3">
        {/* Coming Up - Events */}
        <motion.div
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Calendar className={`w-4 h-4 ${theme.text}`} strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-slate-700">Coming Up</h3>
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-2">
              {upcomingEvents.slice(0, 3).map((event) => {
                const cat = eventCategories[event.category] || eventCategories.other
                const eventDate = parseISO(event.date)
                const dateLabel = isToday(eventDate) ? 'Today' : isTomorrow(eventDate) ? 'Tomorrow' : format(eventDate, 'EEE, MMM d')
                return (
                  <div key={event.id} className={`flex items-center gap-2.5 p-2 rounded-xl ${cat.color}`}>
                    <span className="text-lg shrink-0">{cat.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate">{event.title}</p>
                      <p className="text-[10px] opacity-70">{dateLabel}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-3">No upcoming events</p>
          )}
          <button
            onClick={() => navigate('/calendar')}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 mt-3 w-full justify-center"
          >
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </motion.div>

        {/* Kindness Echo */}
        <motion.div
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-slate-700">Kindness</h3>
          </div>
          <p className="text-xs text-slate-500 mb-3 text-center">
            Send love to {sibling?.name}!
          </p>
          <motion.button
            onClick={handleSendHeart}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-400 to-red-400 text-white text-sm font-medium shadow-sm"
            whileTap={{ scale: 0.95 }}
          >
            <Heart className="w-4 h-4 inline mr-1.5 fill-white" strokeWidth={1.5} />
            Send Heart
          </motion.button>
        </motion.div>
      </div>

      {/* Motivational Footer */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${theme.gradient} shadow-sm`}>
          <Sparkles className="w-4 h-4 text-yellow-300" strokeWidth={1.5} />
          <span className="text-sm font-medium text-white">{child?.name} is a Super Star!</span>
          <Sparkles className="w-4 h-4 text-yellow-300" strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* Avatar Customizer Modal */}
      <AvatarCustomizer
        isOpen={showAvatarCustomizer}
        onClose={() => setShowAvatarCustomizer(false)}
        childId={activeChild}
      />
    </div>
  )
}
