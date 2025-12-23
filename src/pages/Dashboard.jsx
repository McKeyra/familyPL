import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Sun,
  Moon,
  CheckSquare,
  Clock,
  Calendar,
  Heart,
  Gift,
  ShoppingCart,
  Star,
  Sparkles,
} from 'lucide-react'
import useStore from '../store/useStore'
import GlassCard from '../components/ui/GlassCard'
import StarCounter from '../components/ui/StarCounter'
import HeartButton from '../components/ui/HeartButton'
import StickerEvent from '../components/ui/StickerEvent'

const routineCards = [
  {
    id: 'morning',
    title: 'Morning Routine',
    emoji: '🌅',
    icon: Sun,
    gradient: 'from-amber-400 to-orange-500',
    description: 'Start your day right!',
  },
  {
    id: 'bedtime',
    title: 'Bedtime Routine',
    emoji: '🌙',
    icon: Moon,
    gradient: 'from-indigo-400 to-purple-500',
    description: 'Wind down time',
  },
  {
    id: 'chores',
    title: 'Chores',
    emoji: '🧹',
    icon: CheckSquare,
    gradient: 'from-green-400 to-emerald-500',
    description: 'Earn extra stars!',
  },
]

const quickActions = [
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

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Welcome Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
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
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
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
                      transition={{ duration: 0.5, delay: 0.3 }}
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
        transition={{ delay: 0.4 }}
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
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
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
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
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
        transition={{ delay: 0.8 }}
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
