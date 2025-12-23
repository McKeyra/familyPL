import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Gift, Trophy, Sparkles, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import useStore from '../store/useStore'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import StarCounter from '../components/ui/StarCounter'
import confetti from 'canvas-confetti'

const rewards = [
  { id: 'r1', name: 'Extra Screen Time', emoji: '📺', cost: 10, description: '15 extra minutes!' },
  { id: 'r2', name: 'Choose Dinner', emoji: '🍕', cost: 20, description: 'Pick what we eat!' },
  { id: 'r3', name: 'Stay Up Late', emoji: '🌙', cost: 25, description: '30 extra minutes!' },
  { id: 'r4', name: 'Special Treat', emoji: '🍦', cost: 15, description: 'Ice cream or candy!' },
  { id: 'r5', name: 'New Toy', emoji: '🎁', cost: 50, description: 'Small toy of choice!' },
  { id: 'r6', name: 'Movie Night', emoji: '🎬', cost: 30, description: 'Pick the movie!' },
  { id: 'r7', name: 'Park Trip', emoji: '🎢', cost: 35, description: 'Trip to the park!' },
  { id: 'r8', name: 'Sleepover', emoji: '🏠', cost: 75, description: 'Have a friend over!' },
]

export default function Rewards() {
  const navigate = useNavigate()
  const { currentChild, children, starLog, spendStars } = useStore()
  const child = currentChild ? children[currentChild] : null

  const [selectedReward, setSelectedReward] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Get logs for current child
  const childStarLog = starLog.filter((log) => log.childId === currentChild).slice(0, 20)

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
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className="text-6xl block mb-2">
          🎁
        </span>
        <h1 className="text-3xl font-display font-bold text-gray-800">
          Rewards Shop
        </h1>
        <p className="text-gray-600 font-display">
          Spend your stars on awesome rewards!
        </p>
      </motion.div>

      {/* Star Balance */}
      <motion.div
        className="flex justify-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <StarCounter count={child.stars} size="lg" />
      </motion.div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {rewards.map((reward, index) => {
          const canAfford = child.stars >= reward.cost

          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <GlassCard
                variant={canAfford ? child.theme : 'default'}
                glow={canAfford ? child.theme : 'none'}
                onClick={() => {
                  if (canAfford) {
                    setSelectedReward(reward)
                    setShowConfirmation(true)
                  }
                }}
                className={`
                  h-full text-center
                  ${!canAfford ? 'opacity-60' : ''}
                `}
              >
                <motion.span
                  className="text-4xl block mb-2"
                  animate={canAfford ? { y: [0, -5, 0] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {reward.emoji}
                </motion.span>
                <h3 className={`
                  font-display font-bold text-lg mb-1
                  ${canAfford ? 'text-white' : 'text-gray-700'}
                `}>
                  {reward.name}
                </h3>
                <p className={`
                  text-sm mb-2
                  ${canAfford ? 'text-white/80' : 'text-gray-500'}
                `}>
                  {reward.description}
                </p>
                <div className={`
                  inline-flex items-center gap-1 px-3 py-1 rounded-full
                  ${canAfford ? 'bg-white/30' : 'bg-gray-200'}
                `}>
                  <Star className={`w-4 h-4 ${canAfford ? 'text-yellow-300 fill-yellow-300' : 'text-gray-400'}`} />
                  <span className={`font-bold ${canAfford ? 'text-white' : 'text-gray-600'}`}>
                    {reward.cost}
                  </span>
                </div>
              </GlassCard>
            </motion.div>
          )
        })}
      </div>

      {/* Star History */}
      <GlassCard variant="default">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-purple-500" />
          <h3 className="font-display font-bold text-gray-800 text-lg">
            Star History
          </h3>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {childStarLog.length > 0 ? (
            childStarLog.map((log) => (
              <motion.div
                key={log.id}
                className="flex items-center justify-between p-3 bg-white/30 rounded-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center gap-3">
                  <span className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${log.amount > 0 ? 'bg-green-400' : 'bg-red-400'}
                  `}>
                    {log.amount > 0 ? '⭐' : '🛒'}
                  </span>
                  <div>
                    <p className="font-display font-semibold text-gray-800">
                      {log.reason}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <span className={`
                  font-bold font-display
                  ${log.amount > 0 ? 'text-green-600' : 'text-red-600'}
                `}>
                  {log.amount > 0 ? '+' : ''}{log.amount} ⭐
                </span>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8 font-display">
              No star history yet! Complete tasks to earn stars.
            </p>
          )}
        </div>
      </GlassCard>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && selectedReward && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirmation(false)}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.span
                className="text-6xl block mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {selectedReward.emoji}
              </motion.span>
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">
                Get {selectedReward.name}?
              </h2>
              <p className="text-gray-600 mb-4">{selectedReward.description}</p>

              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-gray-600">This will cost</span>
                <span className="bg-yellow-400 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-700 text-yellow-700" />
                  {selectedReward.cost}
                </span>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant={child.theme}
                  className="flex-1"
                  onClick={handleRedeemReward}
                >
                  Redeem!
                </Button>
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
              className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center text-white"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-8xl mb-4">
                🎉
              </div>
              <h2 className="text-3xl font-display font-bold mb-2">
                Congratulations!
              </h2>
              <p className="text-xl font-display">
                You got {selectedReward.name}!
              </p>
              <p className="mt-4 mb-6 text-white/80">
                Ask mom or dad to give you your reward!
              </p>
              <Button
                variant="glass"
                size="lg"
                onClick={() => {
                  setShowSuccess(false)
                  setSelectedReward(null)
                  navigate('/dashboard')
                }}
              >
                Back to Home
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
