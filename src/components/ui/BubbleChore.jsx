import { motion, AnimatePresence } from 'framer-motion'
import { Check, Star } from 'lucide-react'
import { useState } from 'react'
import confetti from 'canvas-confetti'

export default function BubbleChore({
  chore,
  onComplete,
  theme = 'bria',
  index = 0,
}) {
  const [isPopping, setIsPopping] = useState(false)
  const [showStars, setShowStars] = useState(false)

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
    if (chore.completed || isPopping) return

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
      className="relative"
      initial={{ opacity: 0, scale: 0, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0, y: -50 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay: index * 0.1,
      }}
    >
      <motion.button
        className={`
          relative w-full
          flex items-center gap-4 p-4
          bg-gradient-to-r ${colors.bg}
          border-2 ${colors.border}
          rounded-full
          ${chore.completed ? 'opacity-60' : 'cursor-pointer'}
          transition-all duration-300
          overflow-hidden
        `}
        onClick={handlePop}
        disabled={chore.completed}
        whileHover={!chore.completed ? {
          scale: 1.05,
          boxShadow: theme === 'bria'
            ? '0 0 40px rgba(249, 115, 22, 0.5)'
            : '0 0 40px rgba(6, 182, 212, 0.5)',
        } : {}}
        whileTap={!chore.completed ? { scale: 0.9 } : {}}
        animate={isPopping ? {
          scale: [1, 1.3, 0],
          opacity: [1, 1, 0],
        } : {}}
      >
        {/* Bubble shine effect */}
        <motion.div
          className="absolute top-2 left-4 w-6 h-6 bg-white/40 rounded-full blur-sm"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Emoji */}
        <motion.span
          className="text-4xl"
          animate={!chore.completed ? {
            y: [0, -3, 0],
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {chore.emoji}
        </motion.span>

        {/* Task text */}
        <span className={`
          flex-1 text-left text-xl font-display font-semibold text-white
          ${chore.completed ? 'line-through opacity-70' : ''}
        `}>
          {chore.text}
        </span>

        {/* Stars indicator */}
        <div className="flex items-center gap-1">
          {[...Array(chore.stars)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${chore.completed ? 'text-yellow-500 fill-yellow-500' : 'text-white/70'}`}
            />
          ))}
        </div>

        {/* Completion check */}
        {chore.completed && (
          <motion.div
            className="absolute right-4 bg-green-500 rounded-full p-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            <Check className="w-6 h-6 text-white" />
          </motion.div>
        )}
      </motion.button>

      {/* Floating stars animation */}
      <AnimatePresence>
        {showStars && (
          <>
            {[...Array(chore.stars)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2"
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
