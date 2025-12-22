import { motion, AnimatePresence } from 'framer-motion'
import { Star, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function StarCounter({ count, size = 'md', showAnimation = true }) {
  const [prevCount, setPrevCount] = useState(count)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (count !== prevCount && showAnimation) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setIsAnimating(false)
        setPrevCount(count)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [count, prevCount, showAnimation])

  const sizeClasses = {
    sm: 'text-lg px-3 py-1',
    md: 'text-2xl px-4 py-2',
    lg: 'text-4xl px-6 py-3',
    xl: 'text-6xl px-8 py-4',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  }

  return (
    <motion.div
      className={`
        ${sizeClasses[size]}
        inline-flex items-center gap-2
        bg-gradient-to-r from-yellow-400 to-amber-500
        rounded-full shadow-lg
        font-display font-bold text-yellow-900
      `}
      animate={isAnimating ? {
        scale: [1, 1.2, 1],
        rotate: [0, -5, 5, 0],
      } : {}}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        animate={isAnimating ? { rotate: 360 } : {}}
        transition={{ duration: 0.5 }}
      >
        <Star className={`${iconSizes[size]} fill-yellow-900`} />
      </motion.div>

      <AnimatePresence mode="popLayout">
        <motion.span
          key={count}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {count}
        </motion.span>
      </AnimatePresence>

      {/* Sparkle effects */}
      <AnimatePresence>
        {isAnimating && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{
                  scale: 0,
                  x: 0,
                  y: 0,
                  opacity: 1
                }}
                animate={{
                  scale: [0, 1, 0],
                  x: (i - 1) * 40,
                  y: -30 - i * 10,
                  opacity: [1, 1, 0]
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
