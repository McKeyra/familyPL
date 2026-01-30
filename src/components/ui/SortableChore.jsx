import { motion, AnimatePresence } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Check, Star, GripVertical } from 'lucide-react'
import { useState } from 'react'
import confetti from 'canvas-confetti'

export default function SortableChore({
  chore,
  onComplete,
  theme = 'bria',
  index = 0,
  isDraggingEnabled = false,
}) {
  const [isPopping, setIsPopping] = useState(false)
  const [showStars, setShowStars] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chore.id, disabled: !isDraggingEnabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  const themeColors = {
    bria: {
      bg: 'from-bria-300 to-bria-500',
      border: 'border-bria-400',
      glow: 'shadow-glow-bria',
      text: 'text-bria-700',
    },
    naya: {
      bg: 'from-naya-300 to-naya-500',
      border: 'border-naya-400',
      glow: 'shadow-glow-naya',
      text: 'text-naya-700',
    },
  }

  const colors = themeColors[theme]

  const handlePop = () => {
    if (chore.completed || isPopping || isDraggingEnabled) return

    setIsPopping(true)
    setShowStars(true)

    // Trigger confetti at the click location
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.6 },
      colors: theme === 'bria'
        ? ['#f97316', '#fb923c', '#fdba74']
        : ['#06b6d4', '#22d3ee', '#67e8f9'],
    })

    setTimeout(() => {
      onComplete(chore.id)
      setIsPopping(false)
    }, 300)

    setTimeout(() => {
      setShowStars(false)
    }, 1000)
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className="relative"
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
        delay: index * 0.05,
        layout: { type: 'spring', stiffness: 400, damping: 30 },
      }}
    >
      <motion.div
        className={`
          relative w-full
          flex items-center gap-3 p-3 sm:p-4
          bg-gradient-to-r ${colors.bg}
          border-2 ${colors.border}
          rounded-full
          ${chore.completed ? 'opacity-60' : 'cursor-pointer'}
          ${isDragging ? 'shadow-2xl' : ''}
          transition-all duration-300
          overflow-hidden
        `}
        onClick={handlePop}
        whileHover={!chore.completed && !isDraggingEnabled ? {
          scale: 1.02,
          boxShadow: theme === 'bria'
            ? '0 0 30px rgba(249, 115, 22, 0.4)'
            : '0 0 30px rgba(6, 182, 212, 0.4)',
        } : {}}
        whileTap={!chore.completed && !isDraggingEnabled ? { scale: 0.98 } : {}}
        animate={isPopping ? {
          scale: [1, 1.2, 0.9, 1],
          opacity: [1, 1, 0.8, 1],
        } : {}}
      >
        {/* Drag handle */}
        {isDraggingEnabled && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 -ml-1 touch-none"
          >
            <GripVertical className="w-5 h-5 text-white/70" />
          </div>
        )}

        {/* Bubble shine effect */}
        <motion.div
          className="absolute top-2 left-4 w-6 h-6 bg-white/40 rounded-full blur-sm"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Emoji */}
        <motion.span
          className="text-3xl sm:text-4xl"
          animate={!chore.completed && !isDraggingEnabled ? {
            y: [0, -3, 0],
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {chore.emoji}
        </motion.span>

        {/* Task text */}
        <span className={`
          flex-1 text-left text-lg sm:text-xl font-display font-semibold text-white
          ${chore.completed ? 'line-through opacity-70' : ''}
        `}>
          {chore.text}
        </span>

        {/* Bonus indicator */}
        {chore.hasBonus && (
          <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold">
            2x
          </span>
        )}

        {/* Stars indicator */}
        <div className="flex items-center gap-0.5">
          {[...Array(chore.stars)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 sm:w-5 sm:h-5 ${chore.completed ? 'text-yellow-500 fill-yellow-500' : 'text-white/70'}`}
            />
          ))}
        </div>

        {/* Completion check */}
        {chore.completed && (
          <motion.div
            className="absolute right-3 sm:right-4 bg-green-500 rounded-full p-1.5 sm:p-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </motion.div>
        )}
      </motion.div>

      {/* Floating stars animation */}
      <AnimatePresence>
        {showStars && (
          <>
            {[...Array(chore.stars)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 pointer-events-none"
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1.5, 1],
                  x: (i - 1) * 60,
                  y: -80 - i * 20,
                  opacity: [1, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
              >
                <span className="text-4xl">⭐</span>
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
