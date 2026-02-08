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

  // Clean theme colors
  const themeColors = {
    bria: {
      accent: '#F43F5E',
      border: 'border-rose-200',
      borderHover: 'hover:border-rose-300',
      check: 'bg-rose-500',
      ring: 'ring-rose-100',
      star: 'text-rose-300',
      starFill: 'text-amber-400 fill-amber-400',
      confetti: ['#f43f5e', '#fb7185', '#fda4af'],
    },
    naya: {
      accent: '#14B8A6',
      border: 'border-teal-200',
      borderHover: 'hover:border-teal-300',
      check: 'bg-teal-500',
      ring: 'ring-teal-100',
      star: 'text-teal-300',
      starFill: 'text-amber-400 fill-amber-400',
      confetti: ['#14b8a6', '#2dd4bf', '#5eead4'],
    },
  }

  const colors = themeColors[theme] || themeColors.bria

  const handlePop = () => {
    if (chore.completed || isPopping || isDraggingEnabled) return

    setIsPopping(true)
    setShowStars(true)

    // Trigger confetti
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.6 },
      colors: colors.confetti,
    })

    setTimeout(() => {
      onComplete(chore.id)
      setIsPopping(false)
    }, 200)

    setTimeout(() => {
      setShowStars(false)
    }, 800)
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className="relative"
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
        delay: index * 0.03,
        layout: { type: 'spring', stiffness: 400, damping: 30 },
      }}
    >
      <motion.div
        className={`
          relative w-full
          flex items-center gap-3 p-4
          bg-white
          border ${colors.border} ${colors.borderHover}
          rounded-2xl
          ${chore.completed ? 'opacity-60' : 'cursor-pointer'}
          ${isDragging ? 'shadow-xl ring-2 ' + colors.ring : 'shadow-sm'}
          transition-all duration-200
        `}
        onClick={handlePop}
        whileHover={!chore.completed && !isDraggingEnabled ? {
          y: -2,
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        } : {}}
        whileTap={!chore.completed && !isDraggingEnabled ? { scale: 0.98 } : {}}
        animate={isPopping ? { scale: [1, 0.95, 1.02, 1] } : {}}
      >
        {/* Drag handle */}
        {isDraggingEnabled && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 -ml-1 touch-none"
          >
            <GripVertical className="w-5 h-5 text-slate-300" />
          </div>
        )}

        {/* Checkbox circle with emoji or checkmark */}
        <motion.div
          className={`
            relative flex-shrink-0 w-12 h-12 rounded-xl
            flex items-center justify-center
            ${chore.completed
              ? colors.check
              : 'bg-slate-50 border border-slate-200'}
            transition-colors duration-200
          `}
          whileHover={!chore.completed ? { scale: 1.05 } : {}}
        >
          {chore.completed ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <Check className="w-6 h-6 text-white" strokeWidth={3} />
            </motion.div>
          ) : (
            <motion.span
              className="text-2xl"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {chore.emoji}
            </motion.span>
          )}
        </motion.div>

        {/* Task text and bonus */}
        <div className="flex-1 min-w-0">
          <span className={`
            block text-base font-medium
            ${chore.completed ? 'line-through text-slate-400' : 'text-slate-800'}
          `}>
            {chore.text}
          </span>
          {chore.hasBonus && !chore.completed && (
            <span className="text-xs text-amber-600 font-medium">
              ⚡ 2x bonus available
            </span>
          )}
        </div>

        {/* Stars indicator */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {[...Array(chore.stars)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${chore.completed ? colors.starFill : colors.star}`}
              strokeWidth={1.5}
              fill={chore.completed ? 'currentColor' : 'none'}
            />
          ))}
        </div>

        {/* Completed emoji floating badge */}
        {chore.completed && (
          <motion.div
            className="absolute -top-2 -right-2 text-xl bg-white rounded-full p-1 shadow-sm border border-slate-100"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, delay: 0.1 }}
          >
            {chore.emoji}
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
                  scale: [0, 1.2, 1],
                  x: (i - 1) * 50,
                  y: -60 - i * 15,
                  opacity: [1, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
              >
                <span className="text-2xl">⭐</span>
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
