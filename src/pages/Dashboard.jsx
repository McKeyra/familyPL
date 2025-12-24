import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  Heart,
  Sparkles,
} from 'lucide-react'
import useStore from '../store/useStore'
import GlassCard from '../components/ui/GlassCard'
import StarCounter from '../components/ui/StarCounter'
import HeartButton from '../components/ui/HeartButton'
import StickerEvent from '../components/ui/StickerEvent'

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

export default function Dashboard() {
  const navigate = useNavigate()
  const { currentChild, children, chores, getChildEvents, sendHeart } = useStore()

  const child = currentChild ? children[currentChild] : null
  const siblingId = currentChild === 'bria' ? 'naya' : 'bria'
  const sibling = children[siblingId]
  const childChores = currentChild ? chores[currentChild] : null
  const upcomingEvents = getChildEvents(currentChild).slice(0, 3)

  if (!child) {
    navigate('/')
    return null
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
    sendHeart(currentChild, siblingId)
  }

  // YOUNG CHILD INTERFACE (age 5 and under)
  if (isYoungChild) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        {/* Simple Header - Just name and stars */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-5xl">{child.avatar}</span>
            <span className="text-3xl font-display font-bold text-gray-800">{child.name}</span>
          </div>
          <StarCounter count={child.stars} size="lg" />
        </motion.div>

        {/* Big Routine Buttons - Single word labels */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {routineCards.map((routine) => {
            const progress = getProgress(routine.id)
            return (
              <motion.button
                key={routine.id}
                className={`
                  w-full p-6 rounded-3xl
                  ${child.theme === 'bria' ? 'bg-gradient-to-r from-orange-400 to-orange-500' : 'bg-gradient-to-r from-cyan-400 to-cyan-500'}
                  shadow-xl active:scale-98 transition-transform
                `}
                onClick={() => navigate(`/checklist/${routine.id}`)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Big emoji - 72pt */}
                    <span className="text-7xl">{routine.emoji}</span>
                    {/* Single word - big and bold */}
                    <span className="text-3xl font-display font-bold text-white">
                      {routine.title}
                    </span>
                  </div>
                  {/* Simple progress */}
                  <div className="text-right">
                    <span className="text-4xl font-bold text-white">
                      {progress.completed}/{progress.total}
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-4 bg-white/30 rounded-full h-3">
                  <motion.div
                    className="bg-white rounded-full h-3"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Big Quick Action Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {quickActions.slice(0, 3).map((action) => (
            <motion.button
              key={action.id}
              className={`
                ${action.color} p-5 rounded-2xl
                flex flex-col items-center justify-center
                shadow-lg active:scale-95 transition-transform
              `}
              onClick={() => navigate(action.path)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Big emoji - 48pt */}
              <span className="text-5xl mb-2">{action.emoji}</span>
              {/* Single word */}
              <span className="text-lg font-display font-bold text-white">
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {quickActions.slice(3).map((action) => (
            <motion.button
              key={action.id}
              className={`
                ${action.color} p-5 rounded-2xl
                flex flex-col items-center justify-center
                shadow-lg active:scale-95 transition-transform
              `}
              onClick={() => navigate(action.path)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-5xl mb-2">{action.emoji}</span>
              <span className="text-lg font-display font-bold text-white">
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Simple Heart Button */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <button
            onClick={handleSendHeart}
            className="w-full p-4 bg-gradient-to-r from-pink-400 to-red-400 rounded-2xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform"
          >
            <span className="text-4xl">💕</span>
            <span className="text-xl font-display font-bold text-white">
              Send ❤️ to {sibling.name}
            </span>
          </button>
        </motion.div>
      </div>
    )
  }

  // OLDER CHILD INTERFACE (age 6+)
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Welcome Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-6xl mb-4">
          {child.avatar}
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-800 mb-2">
          Hi {child.name}! 👋
        </h1>
        <p className="text-lg text-gray-600 font-display">
          Ready for an amazing day?
        </p>
      </motion.div>

      {/* Star Counter - Big Display */}
      <motion.div
        className="flex justify-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <StarCounter count={child.stars} size="lg" />
      </motion.div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
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
                  <span className="text-4xl md:text-5xl mb-3">
                    {routine.emoji}
                  </span>
                  <h3 className="font-display font-bold text-white text-lg mb-1">
                    {routine.title}
                  </h3>

                  {/* Progress bar */}
                  <div className="w-full bg-white/30 rounded-full h-2 mb-2">
                    <motion.div
                      className="bg-white rounded-full h-2"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.percentage}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="text-sm text-white/80">
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
        className="grid grid-cols-5 gap-2 md:gap-4 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {quickActions.map((action) => (
          <button
            key={action.id}
            className={`
              ${action.color} p-3 md:p-4 rounded-2xl
              flex flex-col items-center justify-center
              shadow-lg hover:shadow-xl transition-all active:scale-95
            `}
            onClick={() => navigate(action.path)}
          >
            <span className="text-2xl md:text-3xl mb-1">{action.emoji}</span>
            <span className="text-xs md:text-sm font-display font-semibold text-white">
              {action.label}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard variant="default" className="h-full">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-pink-500" />
              <h3 className="font-display font-bold text-gray-800">Coming Up</h3>
            </div>
            {upcomingEvents.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {upcomingEvents.map((event) => (
                  <StickerEvent key={event.id} event={event} size="md" />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="font-display">No events coming up!</p>
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
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              <h3 className="font-display font-bold text-gray-800">Kindness Echo</h3>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-gray-600 mb-4 text-center font-display">
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
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <GlassCard variant={child.theme} size="sm">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <p className="font-display font-semibold text-white">
              {child.name} is a Super Star! ⭐
            </p>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
