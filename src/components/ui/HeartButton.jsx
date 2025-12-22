import { motion, AnimatePresence } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useState } from 'react'

export default function HeartButton({ onSend, recipient, theme = 'bria' }) {
  const [isSending, setIsSending] = useState(false)
  const [hearts, setHearts] = useState([])

  const themeColors = {
    bria: 'from-bria-400 to-pink-500',
    naya: 'from-naya-400 to-purple-500',
  }

  const handleSendHeart = () => {
    if (isSending) return

    setIsSending(true)

    // Add floating hearts
    const newHearts = [...Array(5)].map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 100,
      delay: i * 0.1,
    }))
    setHearts(newHearts)

    onSend()

    setTimeout(() => {
      setIsSending(false)
      setHearts([])
    }, 1500)
  }

  return (
    <div className="relative inline-block">
      <motion.button
        className={`
          relative p-6
          bg-gradient-to-br ${themeColors[theme]}
          rounded-full shadow-lg
          overflow-hidden
        `}
        onClick={handleSendHeart}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={isSending ? {
          scale: [1, 1.2, 1],
        } : {}}
      >
        <motion.div
          animate={isSending ? {
            scale: [1, 1.3, 1],
          } : {
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: isSending ? 0.3 : 1,
            repeat: isSending ? 0 : Infinity,
            ease: 'easeInOut',
          }}
        >
          <Heart className="w-12 h-12 text-white fill-white" />
        </motion.div>

        {/* Pulse rings */}
        <AnimatePresence>
          {isSending && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-4 border-white"
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: 2 + i * 0.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Floating hearts */}
      <AnimatePresence>
        {hearts.map((heart) => (
          <motion.div
            key={heart.id}
            className="absolute top-1/2 left-1/2 pointer-events-none"
            initial={{ y: 0, x: 0, opacity: 1, scale: 0 }}
            animate={{
              y: -150,
              x: heart.x,
              opacity: [1, 1, 0],
              scale: [0, 1.5, 1],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, delay: heart.delay }}
          >
            <span className="text-3xl">💕</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Recipient label */}
      <motion.div
        className="mt-3 text-center font-display font-semibold text-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Send to {recipient}
      </motion.div>
    </div>
  )
}
