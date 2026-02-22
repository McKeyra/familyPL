import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { RotateCcw, Sun, Moon, Sparkles, GripVertical, Backpack, BedDouble, Star } from 'lucide-react'
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
import { isWeekend as checkIsWeekend } from '../lib/timezone'
import SortableChore from '../components/ui/SortableChore'

const routineInfo = {
  morning: {
    title: 'Morning',
    subtitle: 'Start your day right',
    emoji: '🌅',
    icon: Sun,
    gradient: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-600',
    celebration: 'Great morning, superstar!',
  },
  bedtime: {
    title: 'Bedtime',
    subtitle: 'Wind down for sleep',
    emoji: '🌙',
    icon: Moon,
    gradient: 'from-indigo-500 to-purple-500',
    bgLight: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-600',
    celebration: 'Sweet dreams await!',
  },
  chores: {
    title: 'Chores',
    subtitle: 'Help around the house',
    emoji: '✨',
    icon: Sparkles,
    gradient: 'from-emerald-500 to-green-500',
    bgLight: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-600',
    celebration: 'Amazing helper!',
  },
}

export default function Checklist() {
  const { routine } = useParams()
  const navigate = useNavigate()
  const {
    currentChild,
    children,
    chores,
    weekendChores,
    completeChore,
    resetRoutine,
    reorderChores,
    getSleepMask,
    setSleepMask,
    getBackpackStatus,
    setBackpackOnTime,
    addStars,
  } = useStore()
  const weekend = checkIsWeekend()
  const activeChores = weekend ? weekendChores : chores
  const [showCelebration, setShowCelebration] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showBackpackBonus, setShowBackpackBonus] = useState(false)

  const child = currentChild ? children[currentChild] : null
  const info = routineInfo[routine]
  const tasks = currentChild && activeChores[currentChild] ? (activeChores[currentChild][routine] || []) : []
  const sleepMaskActive = currentChild ? getSleepMask(currentChild) : false
  const backpackStatus = currentChild ? getBackpackStatus(currentChild) : { onTime: false, time: null }

  // Theme colors
  const themeColors = {
    bria: { accent: 'bg-rose-500', text: 'text-rose-600' },
    naya: { accent: 'bg-teal-500', text: 'text-teal-600' },
  }
  const theme = themeColors[child?.theme] || themeColors.bria

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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
    if (!child) navigate('/home')
  }, [child, navigate])

  if (!child || !info) return null

  const completedCount = tasks.filter((t) => t.completed).length
  const totalCount = tasks.length
  const allComplete = completedCount === totalCount && totalCount > 0
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  useEffect(() => {
    if (allComplete && !showCelebration) {
      setShowCelebration(true)
      const duration = 3000
      const end = Date.now() + duration
      const colors = child.theme === 'bria'
        ? ['#f43f5e', '#fb7185', '#fda4af', '#ffe4e6']
        : ['#06b6d4', '#22d3ee', '#67e8f9', '#cffafe']

      const frame = () => {
        confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors })
        confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()
    }
  }, [allComplete, showCelebration, child.theme])

  const handleComplete = (choreId) => {
    const chore = tasks.find(c => c.id === choreId)
    if (routine === 'morning' && chore?.text?.toLowerCase().includes('backpack')) {
      const isOnTime = setBackpackOnTime(currentChild)
      if (isOnTime && !backpackStatus.time) {
        setShowBackpackBonus(true)
        setTimeout(() => setShowBackpackBonus(false), 3000)
        addStars(currentChild, chore.stars, 'On-time backpack bonus!')
      }
    }
    completeChore(currentChild, routine, choreId)
  }

  const handleReset = () => {
    resetRoutine(currentChild, routine)
    setShowCelebration(false)
  }

  const totalStars = tasks.reduce((sum, t) => sum + t.stars, 0)
  const earnedStars = tasks.filter((t) => t.completed).reduce((sum, t) => sum + t.stars, 0)
  const Icon = info.icon

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto pt-16">
      {/* Compact Header */}
      <motion.header
        className="mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 mb-4">
          {/* Icon badge */}
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${info.gradient} flex items-center justify-center shadow-md`}>
            <span className="text-3xl">{info.emoji}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800">{info.title}</h1>
            <p className="text-sm text-slate-500">{info.subtitle}</p>
          </div>
          {/* Stars earned */}
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" strokeWidth={1.5} />
              <span className="text-xl font-bold text-slate-800 tabular-nums">{earnedStars}</span>
              <span className="text-slate-400">/{totalStars}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${info.gradient}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1.5 text-center">
          {completedCount} of {totalCount} complete
        </p>
      </motion.header>

      {/* Action buttons row */}
      <motion.div
        className="flex gap-2 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {routine === 'morning' && (
          <button
            onClick={() => setSleepMask(currentChild, !sleepMaskActive)}
            className={`
              flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
              ${sleepMaskActive
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}
            `}
          >
            <BedDouble className="w-4 h-4" strokeWidth={1.5} />
            {sleepMaskActive ? 'Rough Night' : 'Had Good Sleep'}
          </button>
        )}
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`
            flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
            ${isEditMode
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}
          `}
        >
          <GripVertical className="w-4 h-4" strokeWidth={1.5} />
          {isEditMode ? 'Done' : 'Reorder'}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
          Reset
        </button>
      </motion.div>

      {/* Backpack Bonus Alert */}
      <AnimatePresence>
        {showBackpackBonus && (
          <motion.div
            className="mb-4 p-4 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-2xl text-center shadow-md"
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
          >
            <div className="flex items-center justify-center gap-2 text-white font-bold">
              <Backpack className="w-5 h-5" />
              <span>On Time Bonus! +2x Stars!</span>
              <span className="text-xl">🎉</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sleep Mask Notice */}
      {sleepMaskActive && routine === 'morning' && (
        <motion.div
          className="mb-4 p-3 bg-purple-50 border border-purple-100 rounded-xl text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-purple-700 text-sm flex items-center justify-center gap-2">
            <BedDouble className="w-4 h-4" />
            Rough night mode - Take it easy today!
          </p>
        </motion.div>
      )}

      {/* Tasks List */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <motion.div className="space-y-3" initial={false}>
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

      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && allComplete && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCelebration(false)}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="text-7xl mb-4"
                animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🏆
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">All Done!</h2>
              <p className="text-slate-600 mb-4">{info.celebration}</p>

              <div className="flex justify-center gap-1 mb-6">
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

              <p className="text-lg font-bold text-amber-600 mb-6">
                You earned {totalStars} stars!
              </p>

              <button
                onClick={() => {
                  setShowCelebration(false)
                  navigate('/home')
                }}
                className={`w-full py-3 rounded-xl text-white font-medium bg-gradient-to-r ${info.gradient} shadow-md`}
              >
                Back to Home
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
