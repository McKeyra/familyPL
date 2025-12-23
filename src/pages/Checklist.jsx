import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, RotateCcw, Trophy, Sun, Moon, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
import useStore from '../store/useStore'
import BubbleChore from '../components/ui/BubbleChore'
import Button from '../components/ui/Button'
import GlassCard from '../components/ui/GlassCard'

const routineInfo = {
  morning: {
    title: 'Morning Routine',
    emoji: '🌅',
    icon: Sun,
    gradient: 'from-amber-400 to-orange-500',
    celebration: 'Great morning, superstar! 🌟',
  },
  bedtime: {
    title: 'Bedtime Routine',
    emoji: '🌙',
    icon: Moon,
    gradient: 'from-indigo-400 to-purple-500',
    celebration: 'Sweet dreams await! 💫',
  },
  chores: {
    title: 'Chores',
    emoji: '🧹',
    icon: Sparkles,
    gradient: 'from-green-400 to-emerald-500',
    celebration: 'Amazing helper! 🏆',
  },
}

export default function Checklist() {
  const { routine } = useParams()
  const navigate = useNavigate()
  const { currentChild, children, chores, completeChore, resetRoutine } = useStore()
  const [showCelebration, setShowCelebration] = useState(false)

  const child = currentChild ? children[currentChild] : null
  const info = routineInfo[routine]
  const tasks = currentChild && chores[currentChild] ? chores[currentChild][routine] : []

  useEffect(() => {
    if (!child) {
      navigate('/')
    }
  }, [child, navigate])

  if (!child || !info) return null

  const completedCount = tasks.filter((t) => t.completed).length
  const totalCount = tasks.length
  const allComplete = completedCount === totalCount && totalCount > 0

  useEffect(() => {
    if (allComplete && !showCelebration) {
      setShowCelebration(true)
      // Big celebration confetti
      const duration = 3000
      const end = Date.now() + duration

      const colors = child.theme === 'bria'
        ? ['#f97316', '#fb923c', '#fcd34d', '#fef3c7']
        : ['#06b6d4', '#22d3ee', '#67e8f9', '#cffafe']

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        })
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }
      frame()
    }
  }, [allComplete, showCelebration, child.theme])

  const handleComplete = (choreId) => {
    completeChore(currentChild, routine, choreId)
  }

  const handleReset = () => {
    resetRoutine(currentChild, routine)
    setShowCelebration(false)
  }

  const totalStars = tasks.reduce((sum, t) => sum + t.stars, 0)
  const earnedStars = tasks.filter((t) => t.completed).reduce((sum, t) => sum + t.stars, 0)

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        className={`
          bg-gradient-to-r ${info.gradient}
          rounded-3xl p-6 mb-6 text-center text-white
          shadow-lg
        `}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className="text-6xl block mb-3">
          {info.emoji}
        </span>
        <h1 className="text-3xl font-display font-bold mb-2">{info.title}</h1>
        <p className="text-white/90 font-display">
          {completedCount} of {totalCount} complete • {earnedStars}/{totalStars} ⭐
        </p>

        {/* Progress bar */}
        <div className="mt-4 bg-white/30 rounded-full h-4 overflow-hidden">
          <motion.div
            className="bg-white h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / totalCount) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Tasks List */}
      <div className="space-y-4 mb-6">
        <AnimatePresence mode="popLayout">
          {tasks.map((task, index) => (
            <BubbleChore
              key={task.id}
              chore={task}
              onComplete={handleComplete}
              theme={child.theme}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Reset Button */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          variant="glass"
          icon={<RotateCcw className="w-5 h-5" />}
          onClick={handleReset}
        >
          Start Over
        </Button>
      </motion.div>

      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && allComplete && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCelebration(false)}
          >
            <motion.div
              className={`
                bg-gradient-to-br ${info.gradient}
                rounded-3xl p-8 max-w-sm w-full text-center text-white
                shadow-2xl
              `}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="text-8xl mb-4"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 10, 0],
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🏆
              </motion.div>
              <h2 className="text-3xl font-display font-bold mb-2">
                All Done!
              </h2>
              <p className="text-xl mb-4 font-display">{info.celebration}</p>
              <div className="flex justify-center gap-2 mb-6">
                {[...Array(totalStars)].map((_, i) => (
                  <motion.span
                    key={i}
                    className="text-3xl"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    ⭐
                  </motion.span>
                ))}
              </div>
              <p className="text-lg font-bold mb-6">
                You earned {totalStars} stars!
              </p>
              <Button
                variant="glass"
                size="lg"
                onClick={() => {
                  setShowCelebration(false)
                  navigate('/dashboard')
                }}
              >
                Back to Dashboard
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
