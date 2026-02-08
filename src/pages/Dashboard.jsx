import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  Calendar,
  Heart,
  Sparkles,
  Star,
  Settings,
  Clock,
} from 'lucide-react'
import useStore from '../store/useStore'
import GlassCard from '../components/ui/GlassCard'
import StarCounter from '../components/ui/StarCounter'
import HeartButton from '../components/ui/HeartButton'
import StickerEvent from '../components/ui/StickerEvent'
import DateTimeDisplay from '../components/ui/DateTimeDisplay'
import ChildAvatar from '../components/ui/ChildAvatar'
import AvatarCustomizer from '../components/ui/AvatarCustomizer'

// Simplified labels for young children (age 5 and under)
const youngRoutineCards = [
  { id: 'morning', title: 'Morning', emoji: '🌅' },
  { id: 'bedtime', title: 'Bedtime', emoji: '🌙' },
  { id: 'chores', title: 'Chores', emoji: '🧹' },
]

// Full labels for older children (age 6+)
const olderRoutineCards = [
  { id: 'morning', title: 'Morning Routine', emoji: '🌅', description: 'Start your day right!' },
  { id: 'bedtime', title: 'Bedtime Routine', emoji: '🌙', description: 'Wind down time' },
  { id: 'chores', title: 'Chores', emoji: '🧹', description: 'Earn extra stars!' },
]

// Simplified actions for young children
const youngQuickActions = [
  { id: 'timer', path: '/timer', emoji: '⏰', label: 'Timer', color: 'bg-cyan-400' },
  { id: 'calendar', path: '/calendar', emoji: '📅', label: 'Days', color: 'bg-pink-400' },
  { id: 'notes', path: '/notes', emoji: '📝', label: 'Notes', color: 'bg-amber-400' },
  { id: 'rewards', path: '/rewards', emoji: '🎁', label: 'Prizes', color: 'bg-purple-400' },
  { id: 'grocery', path: '/grocery', emoji: '🛒', label: 'Shop', color: 'bg-green-400' },
]

// Full labels for older children
const olderQuickActions = [
  { id: 'timer', path: '/timer', emoji: '⏰', label: 'Timer', color: 'bg-cyan-400' },
  { id: 'calendar', path: '/calendar', emoji: '📅', label: 'Calendar', color: 'bg-pink-400' },
  { id: 'notes', path: '/notes', emoji: '📝', label: 'Notes', color: 'bg-amber-400' },
  { id: 'rewards', path: '/rewards', emoji: '🎁', label: 'Rewards', color: 'bg-purple-400' },
  { id: 'grocery', path: '/grocery', emoji: '🛒', label: 'Shopping', color: 'bg-green-400' },
]

// Tab bar for switching between children
function ChildTabs({ children, currentChild, onSelect, onParentAccess, onTimerAccess }) {
  return (
    <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Child Tabs */}
        <div className="flex gap-2">
          {/* Bria Tab */}
          <motion.button
            onClick={() => onSelect('bria')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full transition-all
              ${currentChild === 'bria'
                ? 'bg-gradient-to-r from-rose-400 to-pink-500 shadow-lg shadow-rose-200/50'
                : 'bg-gray-100 hover:bg-gray-200'}
            `}
            whileTap={{ scale: 0.95 }}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
              ${currentChild === 'bria' ? 'bg-white/30 text-white' : 'bg-rose-100 text-rose-600'}
            `}>
              B
            </div>
            <div className="flex items-center gap-1">
              <Star className={`w-3.5 h-3.5 ${currentChild === 'bria' ? 'text-white fill-white' : 'text-rose-500 fill-rose-500'}`} />
              <span className={`text-sm font-semibold ${currentChild === 'bria' ? 'text-white' : 'text-gray-700'}`}>
                {children.bria?.stars || 0}
              </span>
            </div>
          </motion.button>

          {/* Naya Tab */}
          <motion.button
            onClick={() => onSelect('naya')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full transition-all
              ${currentChild === 'naya'
                ? 'bg-gradient-to-r from-cyan-400 to-teal-500 shadow-lg shadow-cyan-200/50'
                : 'bg-gray-100 hover:bg-gray-200'}
            `}
            whileTap={{ scale: 0.95 }}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
              ${currentChild === 'naya' ? 'bg-white/30 text-white' : 'bg-cyan-100 text-cyan-600'}
            `}>
              N
            </div>
            <div className="flex items-center gap-1">
              <Star className={`w-3.5 h-3.5 ${currentChild === 'naya' ? 'text-white fill-white' : 'text-cyan-500 fill-cyan-500'}`} />
              <span className={`text-sm font-semibold ${currentChild === 'naya' ? 'text-white' : 'text-gray-700'}`}>
                {children.naya?.stars || 0}
              </span>
            </div>
          </motion.button>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-2">
          {/* Timer Button */}
          <motion.button
            onClick={onTimerAccess}
            className="p-2 rounded-full bg-cyan-100 hover:bg-cyan-200 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            <Clock className="w-5 h-5 text-cyan-600" />
          </motion.button>

          {/* Parent Settings */}
          <motion.button
            onClick={onParentAccess}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="w-5 h-5 text-gray-500" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { currentChild, children, chores, getChildEvents, sendHeart, setCurrentChild } = useStore()
  const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false)

  // Default to bria if no child selected
  const activeChild = currentChild || 'bria'
  const child = children[activeChild]
  const siblingId = activeChild === 'bria' ? 'naya' : 'bria'
  const sibling = children[siblingId]
  const childChores = chores[activeChild]
  const upcomingEvents = getChildEvents(activeChild).slice(0, 3)

  // Set default child on first load
  if (!currentChild) {
    setCurrentChild('bria')
  }

  // Age-based content selection
  const isYoungChild = child.age <= 5
  const routineCards = isYoungChild ? youngRoutineCards : olderRoutineCards
  const quickActions = isYoungChild ? youngQuickActions : olderQuickActions

  // Calculate progress for each routine
  const getProgress = (routine) => {
    if (!childChores || !childChores[routine]) return { completed: 0, total: 0, percentage: 0 }
    const tasks = childChores[routine]
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

  // YOUNG CHILD INTERFACE (age 5 and under)
  if (isYoungChild) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
        {/* Tab Bar */}
        <ChildTabs
          children={children}
          currentChild={activeChild}
          onSelect={(childId) => setCurrentChild(childId)}
          onTimerAccess={() => navigate('/timer')}
          onParentAccess={() => navigate('/parent')}
        />

        <div className="p-3 sm:p-4 md:p-6 max-w-2xl mx-auto">
          {/* Simple Header - Avatar circle (clickable to customize) */}
          <motion.div
            className="flex items-center justify-center mb-4 sm:mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ChildAvatar
              child={child}
              size="xl"
              onClick={() => setShowAvatarCustomizer(true)}
            />
          </motion.div>

        {/* Date and Time Display */}
        <DateTimeDisplay isYoungChild={true} theme={child.theme} />

        {/* Big Routine Buttons - Single word labels */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {routineCards.map((routine) => {
            const progress = getProgress(routine.id)
            return (
              <motion.button
                key={routine.id}
                className={`
                  w-full p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl
                  ${child.theme === 'bria' ? 'bg-gradient-to-r from-rose-400 to-pink-500' : 'bg-gradient-to-r from-cyan-400 to-cyan-500'}
                  shadow-xl active:scale-98 transition-transform
                `}
                onClick={() => navigate(`/checklist/${routine.id}`)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Big emoji - responsive sizing */}
                    <span className="text-5xl sm:text-6xl md:text-7xl">{routine.emoji}</span>
                    {/* Single word - big and bold */}
                    <span className="text-2xl sm:text-3xl font-display font-bold text-white">
                      {routine.title}
                    </span>
                  </div>
                  {/* Simple progress */}
                  <div className="text-right">
                    <span className="text-3xl sm:text-4xl font-bold text-white">
                      {progress.completed}/{progress.total}
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-3 sm:mt-4 bg-white/30 rounded-full h-2.5 sm:h-3">
                  <motion.div
                    className="bg-white rounded-full h-2.5 sm:h-3"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Big Quick Action Buttons */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {quickActions.slice(0, 3).map((action) => (
            <motion.button
              key={action.id}
              className={`
                ${action.color} p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl
                flex flex-col items-center justify-center
                shadow-lg active:scale-95 transition-transform
              `}
              onClick={() => navigate(action.path)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Big emoji - responsive */}
              <span className="text-4xl sm:text-5xl mb-1 sm:mb-2">{action.emoji}</span>
              {/* Single word */}
              <span className="text-base sm:text-lg font-display font-bold text-white">
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {quickActions.slice(3).map((action) => (
            <motion.button
              key={action.id}
              className={`
                ${action.color} p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl
                flex flex-col items-center justify-center
                shadow-lg active:scale-95 transition-transform
              `}
              onClick={() => navigate(action.path)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-4xl sm:text-5xl mb-1 sm:mb-2">{action.emoji}</span>
              <span className="text-base sm:text-lg font-display font-bold text-white">
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Simple Heart Button */}
        <motion.div
          className="mt-4 sm:mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <button
            onClick={handleSendHeart}
            className="w-full p-3 sm:p-4 bg-gradient-to-r from-pink-400 to-red-400 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3 shadow-lg active:scale-95 transition-transform"
          >
            <span className="text-3xl sm:text-4xl">💕</span>
            <span className="text-lg sm:text-xl font-display font-bold text-white">
              Send ❤️ to {sibling.name}
            </span>
          </button>
        </motion.div>
        </div>

        {/* Avatar Customizer Modal */}
        <AvatarCustomizer
          isOpen={showAvatarCustomizer}
          onClose={() => setShowAvatarCustomizer(false)}
          childId={activeChild}
        />
      </div>
    )
  }

  // OLDER CHILD INTERFACE (age 6+)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
      {/* Tab Bar */}
      <ChildTabs
        children={children}
        currentChild={activeChild}
        onSelect={(childId) => setCurrentChild(childId)}
        onTimerAccess={() => navigate('/timer')}
        onParentAccess={() => navigate('/parent')}
      />

      <div className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          className="text-center mb-4 sm:mb-6 md:mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex justify-center mb-2 sm:mb-4">
            <ChildAvatar
              child={child}
              size="lg"
              onClick={() => setShowAvatarCustomizer(true)}
            />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gray-800 mb-1 sm:mb-2">
            Hi {child.name}! 👋
          </h1>
          <p className="text-base sm:text-lg text-gray-600 font-display">
            Ready for an amazing day?
          </p>
        </motion.div>

      {/* Date and Time Display */}
      <DateTimeDisplay isYoungChild={false} theme={child.theme} />

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
        {/* Routine Cards */}
        {routineCards.map((routine, index) => {
          const progress = getProgress(routine.id)
          return (
            <motion.div
              key={routine.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 * index }}
            >
              <GlassCard
                variant={child.theme}
                glow={child.theme}
                onClick={() => navigate(`/checklist/${routine.id}`)}
                className="h-full"
              >
                <div className="flex flex-col items-center text-center">
                  <span className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3">
                    {routine.emoji}
                  </span>
                  <h3 className="font-display font-bold text-white text-base sm:text-lg mb-1">
                    {routine.title}
                  </h3>

                  {/* Progress bar */}
                  <div className="w-full bg-white/30 rounded-full h-1.5 sm:h-2 mb-1.5 sm:mb-2">
                    <motion.div
                      className="bg-white rounded-full h-1.5 sm:h-2"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.percentage}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="text-xs sm:text-sm text-white/80">
                    {progress.completed}/{progress.total} done
                  </span>
                </div>
              </GlassCard>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions Grid */}
      <motion.div
        className="grid grid-cols-5 gap-1.5 sm:gap-2 md:gap-4 mb-4 sm:mb-6 md:mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {quickActions.map((action) => (
          <button
            key={action.id}
            className={`
              ${action.color} p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl
              flex flex-col items-center justify-center
              shadow-lg hover:shadow-xl transition-all active:scale-95
            `}
            onClick={() => navigate(action.path)}
          >
            <span className="text-xl sm:text-2xl md:text-3xl mb-0.5 sm:mb-1">{action.emoji}</span>
            <span className="text-[10px] sm:text-xs md:text-sm font-display font-semibold text-white">
              {action.label}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard variant="default" className="h-full">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
              <h3 className="font-display font-bold text-gray-800 text-sm sm:text-base">Coming Up</h3>
            </div>
            {upcomingEvents.length > 0 ? (
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {upcomingEvents.map((event) => (
                  <StickerEvent key={event.id} event={event} size="md" />
                ))}
              </div>
            ) : (
              <div className="text-center py-3 sm:py-4 text-gray-500">
                <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                <p className="font-display text-sm sm:text-base">No events coming up!</p>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Kindness Echo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard variant="default" className="h-full">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 fill-red-500" />
              <h3 className="font-display font-bold text-gray-800 text-sm sm:text-base">Kindness Echo</h3>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-gray-600 mb-3 sm:mb-4 text-center font-display text-sm sm:text-base">
                Send a heart to {sibling.name}! 💕
              </p>
              <HeartButton
                onSend={handleSendHeart}
                recipient={sibling.name}
                theme={child.theme}
              />
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Motivational Footer */}
      <motion.div
        className="mt-4 sm:mt-6 md:mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <GlassCard variant={child.theme} size="sm">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            <p className="font-display font-semibold text-white text-sm sm:text-base">
              {child.name} is a Super Star! ⭐
            </p>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
          </div>
        </GlassCard>
      </motion.div>
      </div>

      {/* Avatar Customizer Modal */}
      <AvatarCustomizer
        isOpen={showAvatarCustomizer}
        onClose={() => setShowAvatarCustomizer(false)}
        childId={activeChild}
      />
    </div>
  )
}
