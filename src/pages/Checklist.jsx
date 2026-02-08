import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, RotateCcw, Trophy, Sun, Moon, Sparkles, GripVertical, Backpack, BedDouble } from 'lucide-react'
import { useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import useStore from '../store/useStore'
import SortableChore from '../components/ui/SortableChore'
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
  const {
    currentChild,
    children,
    chores,
    completeChore,
    resetRoutine,
    reorderChores,
    getSleepMask,
    setSleepMask,
    getBackpackStatus,
    setBackpackOnTime,
    addStars,
  } = useStore()
  const [showCelebration, setShowCelebration] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showBackpackBonus, setShowBackpackBonus] = useState(false)

  const child = currentChild ? children[currentChild] : null
  const info = routineInfo[routine]
  const tasks = currentChild && chores[currentChild] ? chores[currentChild][routine] : []
  const sleepMaskActive = currentChild ? getSleepMask(currentChild) : false
  const backpackStatus = currentChild ? getBackpackStatus(currentChild) : { onTime: false, time: null }

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id)
      const newIndex = tasks.findIndex((t) => t.id === over.id)
      const newOrder = arrayMove(tasks, oldIndex, newIndex)
      reorderChores(currentChild, routine, newOrder)
    }
  }

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
        ? ['#f43f5e', '#fb7185', '#fda4af', '#ffe4e6']
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
    const chore = tasks.find(c => c.id === choreId)

    // Check for backpack on-time bonus
    if (routine === 'morning' && chore?.text?.toLowerCase().includes('backpack')) {
      const isOnTime = setBackpackOnTime(currentChild)
      if (isOnTime && !backpackStatus.time) {
        // Award bonus stars for being on time
        setShowBackpackBonus(true)
        setTimeout(() => setShowBackpackBonus(false), 3000)
        // Bonus stars are added on top of normal stars
        addStars(currentChild, chore.stars, 'On-time backpack bonus!')
      }
    }

    completeChore(currentChild, routine, choreId)
  }

  const handleToggleSleepMask = () => {
    setSleepMask(currentChild, !sleepMaskActive)
  }

  const handleReset = () => {
    resetRoutine(currentChild, routine)
    setShowCelebration(false)
  }

  const totalStars = tasks.reduce((sum, t) => sum + t.stars, 0)
  const earnedStars = tasks.filter((t) => t.completed).reduce((sum, t) => sum + t.stars, 0)

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        className={`
          bg-gradient-to-r ${info.gradient}
          rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-6 text-center text-white
          shadow-lg
        `}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className="text-5xl sm:text-6xl block mb-2 sm:mb-3">
          {info.emoji}
        </span>
        <h1 className="text-2xl sm:text-3xl font-display font-bold mb-1.5 sm:mb-2">{info.title}</h1>
        <p className="text-white/90 font-display text-sm sm:text-base">
          {completedCount} of {totalCount} complete • {earnedStars}/{totalStars} ⭐
        </p>

        {/* Progress bar */}
        <div className="mt-3 sm:mt-4 bg-white/30 rounded-full h-3 sm:h-4 overflow-hidden">
          <motion.div
            className="bg-white h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / totalCount) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Sleep Mask & Edit Mode Buttons */}
        <div className="mt-3 sm:mt-4 flex justify-center gap-2 sm:gap-3">
          {routine === 'morning' && (
            <motion.button
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-display font-semibold
                ${sleepMaskActive
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/30 text-white hover:bg-white/40'
                }
              `}
              onClick={handleToggleSleepMask}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BedDouble className="w-4 h-4" />
              {sleepMaskActive ? 'Rough Night' : 'Had Good Sleep'}
            </motion.button>
          )}
          <motion.button
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-display font-semibold
              ${isEditMode
                ? 'bg-green-500 text-white'
                : 'bg-white/30 text-white hover:bg-white/40'
              }
            `}
            onClick={() => setIsEditMode(!isEditMode)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <GripVertical className="w-4 h-4" />
            {isEditMode ? 'Done Sorting' : 'Reorder'}
          </motion.button>
        </div>
      </motion.div>

      {/* Backpack On-Time Bonus Alert */}
      <AnimatePresence>
        {showBackpackBonus && (
          <motion.div
            className="mb-4 p-4 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl text-center shadow-lg"
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
          >
            <div className="flex items-center justify-center gap-2 text-white font-display font-bold text-lg">
              <Backpack className="w-6 h-6" />
              <span>On Time Bonus! +2x Stars!</span>
              <span className="text-2xl">🎉</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sleep Mask Active Notice */}
      {sleepMaskActive && routine === 'morning' && (
        <motion.div
          className="mb-4 p-3 bg-purple-100 border border-purple-300 rounded-xl text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-purple-700 font-display text-sm">
            <BedDouble className="w-4 h-4 inline mr-1" />
            Rough night mode - Take it easy today! 💜
          </p>
        </motion.div>
      )}

      {/* Tasks List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <motion.div
            className="space-y-3 sm:space-y-4 mb-4 sm:mb-6"
            initial={false}
          >
            <AnimatePresence initial={false} mode="sync">
              {tasks.map((task, index) => (
                <SortableChore
                  key={task.id}
                  chore={task}
                  onComplete={handleComplete}
                  theme={child.theme}
                  index={index}
                  isDraggingEnabled={isEditMode}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </SortableContext>
      </DndContext>

      {/* Reset Button */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          variant="glass"
          icon={<RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />}
          onClick={handleReset}
        >
          Start Over
        </Button>
      </motion.div>

      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && allComplete && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCelebration(false)}
          >
            <motion.div
              className={`
                bg-gradient-to-br ${info.gradient}
                rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-sm w-full text-center text-white
                shadow-2xl
              `}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="text-6xl sm:text-8xl mb-3 sm:mb-4"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 10, 0],
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🏆
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold mb-1.5 sm:mb-2">
                All Done!
              </h2>
              <p className="text-lg sm:text-xl mb-3 sm:mb-4 font-display">{info.celebration}</p>
              <div className="flex justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                {[...Array(totalStars)].map((_, i) => (
                  <motion.span
                    key={i}
                    className="text-2xl sm:text-3xl"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    ⭐
                  </motion.span>
                ))}
              </div>
              <p className="text-base sm:text-lg font-bold mb-4 sm:mb-6">
                You earned {totalStars} stars!
              </p>
              <Button
                variant="glass"
                size="lg"
                onClick={() => {
                  setShowCelebration(false)
                  navigate('/')
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
