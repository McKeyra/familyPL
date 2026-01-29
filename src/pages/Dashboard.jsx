import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  Heart,
  Sparkles,
  Star,
  Settings,
} from 'lucide-react'
import useStore from '../store/useStore'
import GlassCard from '../components/ui/GlassCard'
import StarCounter from '../components/ui/StarCounter'
import HeartButton from '../components/ui/HeartButton'
import StickerEvent from '../components/ui/StickerEvent'
import DateTimeDisplay from '../components/ui/DateTimeDisplay'

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

// Child selection screen component
function ChildSelection({ children, onSelect, onParentAccess }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 flex flex-col items-center justify-center p-6">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl sm:text-4xl font-light text-gray-800 mb-2">Happy Day Helper</h1>
        <p className="text-gray-500">Who's ready for a great day?</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-lg w-full mb-8">
        {/* Bria */}
        <motion.button
          onClick={() => onSelect('bria')}
          className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100/50 rounded-3xl text-center transition-all duration-300 hover:shadow-lg hover:shadow-amber-100/50"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-200/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200/50 mb-4">
              <span className="text-2xl sm:text-3xl font-bold text-white">B</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1">Bria</h2>
            <div className="flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-sm text-gray-600">{children.bria?.stars || 0} stars</span>
            </div>
          </div>
        </motion.button>

        {/* Naya */}
        <motion.button
          onClick={() => onSelect('naya')}
          className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-100/50 rounded-3xl text-center transition-all duration-300 hover:shadow-lg hover:shadow-cyan-100/50"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-200/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-200/50 mb-4">
              <span className="text-2xl sm:text-3xl font-bold text-white">N</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1">Naya</h2>
            <div className="flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-cyan-500 fill-cyan-500" />
              <span className="text-sm text-gray-600">{children.naya?.stars || 0} stars</span>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Parent Access */}
      <motion.button
        onClick={onParentAccess}
        className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Settings className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-600">Parent Settings</span>
      </motion.button>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { currentChild, children, chores, getChildEvents, sendHeart, setCurrentChild } = useStore()

  const child = currentChild ? children[currentChild] : null
  const siblingId = currentChild === 'bria' ? 'naya' : 'bria'
  const sibling = children[siblingId]
  const childChores = currentChild ? chores[currentChild] : null
  const upcomingEvents = currentChild ? getChildEvents(currentChild).slice(0, 3) : []

  // Show child selection if no child is selected
  if (!child) {
    return (
      <ChildSelection
        children={children}
        onSelect={(childId) => setCurrentChild(childId)}
        onParentAccess={() => navigate('/parent')}
      />
    )
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
      <div className="p-3 sm:p-4 md:p-6 max-w-2xl mx-auto">
        {/* Simple Header - Just name and stars */}
        <motion.div
          className="flex items-center justify-between mb-4 sm:mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-4xl sm:text-5xl md:text-6xl">{child.avatar}</span>
            <span className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gray-800">{child.name}</span>
          </div>
          <StarCounter count={child.stars} size="lg" />
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
                  ${child.theme === 'bria' ? 'bg-gradient-to-r from-orange-400 to-orange-500' : 'bg-gradient-to-r from-cyan-400 to-cyan-500'}
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
    )
  }

  // OLDER CHILD INTERFACE (age 6+)
  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto">
      {/* Welcome Header */}
      <motion.div
        className="text-center mb-4 sm:mb-6 md:mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-5xl sm:text-6xl mb-2 sm:mb-4">
          {child.avatar}
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gray-800 mb-1 sm:mb-2">
          Hi {child.name}! 👋
        </h1>
        <p className="text-base sm:text-lg text-gray-600 font-display">
          Ready for an amazing day?
        </p>
      </motion.div>

      {/* Star Counter - Big Display */}
      <motion.div
        className="flex justify-center mb-4 sm:mb-6 md:mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <StarCounter count={child.stars} size="lg" />
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
  )
}
