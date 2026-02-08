import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Gift, Trophy, Sparkles, Clock, ShoppingBag, Check, ChevronDown } from 'lucide-react'
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

const rewards = [
  { id: 'r1', name: 'Extra Screen Time', icon: '📺', cost: 10, description: '15 extra minutes of screen time' },
  { id: 'r2', name: 'Choose Dinner', icon: '🍕', cost: 20, description: 'Pick what the family eats tonight' },
  { id: 'r3', name: 'Stay Up Late', icon: '🌙', cost: 25, description: '30 extra minutes before bedtime' },
  { id: 'r4', name: 'Special Treat', icon: '🍦', cost: 15, description: 'Ice cream or your favorite candy' },
  { id: 'r5', name: 'Game Night', icon: '🎲', cost: 50, description: 'Family game night - you pick!' },
  { id: 'r6', name: 'Movie Night', icon: '🎬', cost: 30, description: 'Pick the family movie' },
  { id: 'r7', name: 'Park Trip', icon: '🎢', cost: 35, description: 'Trip to your favorite park' },
  { id: 'r8', name: 'Dance Party', icon: '💃', cost: 75, description: 'Living room dance party!' },
]

// Animated star counter component
function AnimatedStarCounter({ count, theme }) {
  const [displayCount, setDisplayCount] = useState(0)

  useEffect(() => {
    const duration = 1000
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
      className={`relative bg-gradient-to-br ${theme.gradient} rounded-2xl p-5 shadow-lg overflow-hidden`}
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
        <p className="text-white/80 text-sm mb-1">Your Balance</p>
        <div className="flex items-center justify-center gap-2">
          <motion.div
            className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center shadow-md"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Star className="w-7 h-7 text-yellow-700 fill-yellow-700" strokeWidth={1.5} />
          </motion.div>
          <span className="text-5xl font-bold text-white tabular-nums">{displayCount}</span>
        </div>
        <p className="text-white/70 text-xs mt-2">stars to spend</p>
      </div>
    </motion.div>
  )
}

export default function Rewards() {
  const navigate = useNavigate()
  const { currentChild, children, starLog, spendStars } = useStore()
  const child = currentChild ? children[currentChild] : null
  const theme = themeConfig[child?.theme] || themeConfig.bria

  const [selectedReward, setSelectedReward] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  // Get logs for current child
  const childStarLog = starLog.filter((log) => log.childId === currentChild)
  const redeemedRewards = childStarLog.filter((log) => log.amount < 0).slice(0, 10)
  const earnedStars = childStarLog.filter((log) => log.amount > 0).slice(0, 10)

  const handleRedeemReward = () => {
    if (!selectedReward) return

    const success = spendStars(currentChild, selectedReward.cost, selectedReward.name)

    if (success) {
      setShowConfirmation(false)
      setShowSuccess(true)

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fcd34d', '#f59e0b', '#eab308'],
      })

      setTimeout(() => {
        setShowSuccess(false)
        setSelectedReward(null)
      }, 3000)
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
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-md`}>
          <ShoppingBag className="w-6 h-6 text-white" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Rewards Shop</h1>
          <p className="text-sm text-slate-500">Spend your stars on awesome rewards!</p>
        </div>
      </motion.header>

      {/* Animated Star Balance */}
      <div className="mb-6">
        <AnimatedStarCounter count={child.stars} theme={theme} />
      </div>

      {/* Rewards Grid - Store Style */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Available Rewards</h2>
        <div className="grid grid-cols-2 gap-3">
          {rewards.map((reward, index) => {
            const canAfford = child.stars >= reward.cost

            return (
              <motion.div
                key={reward.id}
                className={`
                  relative bg-white rounded-2xl border overflow-hidden shadow-sm
                  ${canAfford ? `${theme.border} hover:shadow-md` : 'border-slate-200 opacity-60'}
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

                  {/* Cost Badge */}
                  <div className={`
                    inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold
                    ${canAfford ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}
                  `}>
                    <Star className={`w-3 h-3 ${canAfford ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} strokeWidth={1.5} />
                    {reward.cost}
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
                      ? `bg-gradient-to-r ${theme.gradient} text-white hover:opacity-90`
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                  `}
                >
                  {canAfford ? 'Redeem' : 'Need more stars'}
                </button>

                {/* Affordable indicator */}
                {canAfford && (
                  <div className={`absolute top-2 right-2 w-2 h-2 rounded-full bg-gradient-to-r ${theme.gradient}`} />
                )}
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Redeemed History */}
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
              <h3 className="font-semibold text-slate-800">Reward History</h3>
              <p className="text-xs text-slate-500">{redeemedRewards.length} rewards redeemed</p>
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
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                          <Gift className="w-4 h-4 text-amber-600" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{log.reason}</p>
                          <p className="text-xs text-slate-400">
                            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-red-500 tabular-nums">
                        {log.amount}
                        <Star className="w-3 h-3 inline ml-0.5 fill-current" />
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400">
                  <Gift className="w-8 h-8 mx-auto mb-2 opacity-30" strokeWidth={1.5} />
                  <p className="text-sm">No rewards redeemed yet</p>
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
                  className="text-6xl mb-4"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {selectedReward.icon}
                </motion.div>

                <h2 className="text-xl font-bold text-slate-800 mb-2">
                  Redeem {selectedReward.name}?
                </h2>
                <p className="text-sm text-slate-500 mb-4">{selectedReward.description}</p>

                <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-amber-50 rounded-xl">
                  <span className="text-sm text-amber-700">This will cost</span>
                  <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded-full">
                    <Star className="w-4 h-4 text-amber-600 fill-amber-600" strokeWidth={1.5} />
                    <span className="font-bold text-amber-800">{selectedReward.cost}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600"
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={handleRedeemReward}
                    className={`flex-1 py-3 rounded-xl bg-gradient-to-r ${theme.gradient} text-white text-sm font-medium shadow-sm`}
                    whileTap={{ scale: 0.98 }}
                  >
                    Redeem Now
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
              className="bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="text-7xl mb-4"
                animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🎉
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Congratulations!
              </h2>
              <p className="text-lg text-white/90 mb-2">
                You got {selectedReward.name}!
              </p>
              <div className="text-5xl my-4">{selectedReward.icon}</div>
              <p className="text-sm text-white/80 mb-6">
                Ask mom or dad to give you your reward!
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
