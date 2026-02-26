import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Gift, Trophy, Sparkles, Users, ChevronDown, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import useStore from '../store/useStore'
import confetti from 'canvas-confetti'

// Theme configurations
const themeConfig = {
  bria: {
    primary: '#F43F5E',
    gradient: 'from-rose-400 to-pink-500',
    gradientLight: 'from-rose-50 to-pink-50',
    bgLight: 'bg-rose-100',
    text: 'text-rose-600',
    border: 'border-rose-200',
  },
  naya: {
    primary: '#14B8A6',
    gradient: 'from-teal-400 to-cyan-500',
    gradientLight: 'from-teal-50 to-cyan-50',
    bgLight: 'bg-teal-100',
    text: 'text-teal-600',
    border: 'border-teal-200',
  },
}

// Family activity rewards using PL stars
const familyRewards = [
  { id: 'r1', name: 'Dance Party', icon: '💃', cost: 1, description: 'Living room dance party with the family!' },
  { id: 'r2', name: 'Pancake Sunday', icon: '🥞', cost: 2, description: 'Special pancake breakfast made together' },
  { id: 'r3', name: 'Bowling', icon: '🎳', cost: 3, description: 'Family bowling trip!' },
  { id: 'r4', name: 'Movie Night', icon: '🎬', cost: 4, description: 'Pick the family movie + popcorn' },
  { id: 'r5', name: 'Park Adventure', icon: '🎢', cost: 2, description: 'Trip to your favorite park' },
  { id: 'r6', name: 'Game Night', icon: '🎲', cost: 1, description: 'Family game night - you pick the game!' },
  { id: 'r7', name: 'Ice Cream Trip', icon: '🍦', cost: 2, description: 'Ice cream outing for the family' },
  { id: 'r8', name: 'Bike Ride', icon: '🚴', cost: 1, description: 'Family bike ride adventure' },
]

// Animated PL star counter component
function AnimatedPLCounter({ count, theme }) {
  const [displayCount, setDisplayCount] = useState(0)

  useEffect(() => {
    const duration = 800
    const startTime = Date.now()
    const startCount = displayCount

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startCount + (count - startCount) * easeOut)
      setDisplayCount(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [count])

  return (
    <motion.div
      className={`relative bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-5 shadow-lg overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Sparkle decorations */}
      <div className="absolute top-3 right-3 opacity-30">
        <Sparkles className="w-6 h-6 text-white" />
      </div>
      <div className="absolute bottom-3 left-3 opacity-20">
        <Star className="w-8 h-8 text-white fill-white" />
      </div>

      <div className="relative z-10 text-center">
        <p className="text-white/80 text-sm mb-1">Your PL Stars</p>
        <div className="flex items-center justify-center gap-2">
          <motion.div
            className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 flex items-center justify-center shadow-lg"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <span className="text-2xl">⭐</span>
          </motion.div>
          <span className="text-5xl font-bold text-white tabular-nums">{displayCount}</span>
        </div>
        <p className="text-white/70 text-xs mt-2">for family fun!</p>
      </div>
    </motion.div>
  )
}

// Weekly progress component
function WeeklyProgress({ weeklyStars, theme }) {
  // Simple progress visualization
  const progressPercent = Math.min(100, (weeklyStars / 20) * 100) // 20 stars = nice visual

  return (
    <motion.div
      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
            <TrendingUp className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">This Week</p>
            <p className="text-xs text-slate-500">Keep earning stars!</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 rounded-full">
          <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
          <span className="font-bold text-amber-800">{weeklyStars}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${theme.gradient} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <p className="text-xs text-slate-400 mt-2 text-center">
        Complete routines daily to earn 1 PL star each week!
      </p>
    </motion.div>
  )
}

export default function Rewards() {
  const navigate = useNavigate()
  const { currentChild, children, plStarLog, spendPLStars, getWeeklyProgress } = useStore()
  const child = currentChild ? children[currentChild] : null
  const theme = themeConfig[child?.theme] || themeConfig.bria

  const [selectedReward, setSelectedReward] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  // Get PL star data
  const plStars = child?.plStars || 0
  const weeklyProgress = getWeeklyProgress(currentChild)

  // Get logs for current child
  const childPLLog = plStarLog.filter((log) => log.childId === currentChild)
  const redeemedRewards = childPLLog.filter((log) => log.amount < 0).slice(0, 10)

  const handleRedeemReward = () => {
    if (!selectedReward) return

    const success = spendPLStars(currentChild, selectedReward.cost, selectedReward.name)

    if (success) {
      setShowConfirmation(false)
      setShowSuccess(true)

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#8b5cf6', '#a855f7', '#d946ef', '#fcd34d', '#f59e0b'],
      })

      setTimeout(() => {
        setShowSuccess(false)
        setSelectedReward(null)
      }, 4000)
    }
  }

  if (!child) return null

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto pb-24">
      {/* Header */}
      <motion.header
        className="flex items-center gap-3 mb-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md`}>
          <Users className="w-6 h-6 text-white" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Family Rewards</h1>
          <p className="text-sm text-slate-500">Earn PL stars for family fun!</p>
        </div>
      </motion.header>

      {/* PL Star Balance */}
      <div className="mb-4">
        <AnimatedPLCounter count={plStars} theme={theme} />
      </div>

      {/* Weekly Progress */}
      <div className="mb-6">
        <WeeklyProgress weeklyStars={weeklyProgress.stars} theme={theme} />
      </div>

      {/* Family Rewards Grid */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Family Activities</h2>
        <div className="grid grid-cols-2 gap-3">
          {familyRewards.map((reward, index) => {
            const canAfford = plStars >= reward.cost

            return (
              <motion.div
                key={reward.id}
                className={`
                  relative bg-white rounded-2xl border overflow-hidden shadow-sm
                  ${canAfford ? `border-purple-200 hover:shadow-md hover:border-purple-300` : 'border-slate-200 opacity-60'}
                `}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * index }}
                whileHover={canAfford ? { y: -2 } : {}}
              >
                {/* Card Content */}
                <div className="p-4">
                  {/* Icon */}
                  <motion.div
                    className="text-4xl mb-2"
                    animate={canAfford ? { y: [0, -3, 0] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {reward.icon}
                  </motion.div>

                  {/* Name */}
                  <h3 className="font-semibold text-slate-800 text-sm mb-1">{reward.name}</h3>

                  {/* Description */}
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{reward.description}</p>

                  {/* PL Cost Badge */}
                  <div className={`
                    inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold
                    ${canAfford ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}
                  `}>
                    <span className="text-sm">⭐</span>
                    {reward.cost} PL
                  </div>
                </div>

                {/* Redeem Button */}
                <button
                  onClick={() => {
                    if (canAfford) {
                      setSelectedReward(reward)
                      setShowConfirmation(true)
                    }
                  }}
                  disabled={!canAfford}
                  className={`
                    w-full py-2.5 text-sm font-medium transition-colors
                    ${canAfford
                      ? `bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90`
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                  `}
                >
                  {canAfford ? 'Choose This!' : `Need ${reward.cost - plStars} more`}
                </button>

                {/* Affordable indicator */}
                {canAfford && (
                  <motion.div
                    className={`absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600`}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Reward History */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm mb-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-purple-500" strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-800">Family Fun History</h3>
              <p className="text-xs text-slate-500">{redeemedRewards.length} activities enjoyed</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {redeemedRewards.length > 0 ? (
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {redeemedRewards.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Gift className="w-4 h-4 text-purple-600" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{log.reason}</p>
                          <p className="text-xs text-slate-400">
                            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-purple-600 tabular-nums">
                        {Math.abs(log.amount)} ⭐
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400">
                  <Gift className="w-8 h-8 mx-auto mb-2 opacity-30" strokeWidth={1.5} />
                  <p className="text-sm">No family activities yet</p>
                  <p className="text-xs mt-1">Earn PL stars to unlock fun!</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && selectedReward && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirmation(false)}
          >
            <motion.div
              className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full max-w-md shadow-2xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

              <div className="text-center">
                <motion.div
                  className="text-7xl mb-4"
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {selectedReward.icon}
                </motion.div>

                <h2 className="text-xl font-bold text-slate-800 mb-2">
                  Choose {selectedReward.name}?
                </h2>
                <p className="text-sm text-slate-500 mb-4">{selectedReward.description}</p>

                <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-purple-50 rounded-xl">
                  <span className="text-sm text-purple-700">This will use</span>
                  <div className="flex items-center gap-1 px-3 py-1 bg-purple-100 rounded-full">
                    <span className="text-lg">⭐</span>
                    <span className="font-bold text-purple-800">{selectedReward.cost} PL</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600"
                  >
                    Maybe Later
                  </button>
                  <motion.button
                    onClick={handleRedeemReward}
                    className={`flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-medium shadow-sm`}
                    whileTap={{ scale: 0.98 }}
                  >
                    Yes, Let's Do It!
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && selectedReward && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowSuccess(false)
              setSelectedReward(null)
            }}
          >
            <motion.div
              className="bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="text-7xl mb-4"
                animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                🎉
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Family Fun Time!
              </h2>
              <p className="text-lg text-white/90 mb-2">
                You chose {selectedReward.name}!
              </p>
              <motion.div
                className="text-6xl my-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                {selectedReward.icon}
              </motion.div>
              <p className="text-sm text-white/80 mb-6">
                Time to enjoy some family fun together!
              </p>
              <button
                onClick={() => {
                  setShowSuccess(false)
                  setSelectedReward(null)
                }}
                className="w-full py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/30 transition-colors"
              >
                Awesome!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
