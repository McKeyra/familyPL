import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Play, Pause, X, Clock, Tv, BookOpen, Gamepad2, Pencil } from 'lucide-react'
import confetti from 'canvas-confetti'
import useStore from '../store/useStore'

const activityIcons = {
  screen: { emoji: '📺', icon: Tv, color: 'blue' },
  reading: { emoji: '📚', icon: BookOpen, color: 'amber' },
  play: { emoji: '🎮', icon: Gamepad2, color: 'green' },
  homework: { emoji: '✏️', icon: Pencil, color: 'purple' },
}

const activityLabels = {
  screen: 'Screen Time',
  reading: 'Reading',
  play: 'Play Time',
  homework: 'Homework',
}

const activityStars = {
  screen: 1,
  reading: 2,
  play: 1,
  homework: 3,
}

export default function FloatingTimer() {
  const location = useLocation()
  const navigate = useNavigate()
  const {
    activeTimer,
    setActiveTimer,
    pauseActiveTimer,
    resumeActiveTimer,
    clearActiveTimer,
    completeTimer,
    children,
  } = useStore()

  const [localTimeLeft, setLocalTimeLeft] = useState(activeTimer?.timeLeft || 0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [position, setPosition] = useState('bottom-right') // bottom-right, bottom-left, top-right, top-left
  const intervalRef = useRef(null)
  const audioContextRef = useRef(null)

  // Don't show on timer page
  const isOnTimerPage = location.pathname === '/timer'

  // Lazy initialize audio context only when needed
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      } catch (e) {
        console.log('Audio not available')
        return null
      }
    }
    // Resume if suspended (iOS requirement)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }
    return audioContextRef.current
  }, [])

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Play sound - lazily creates audio context
  const playSound = useCallback((frequencies) => {
    const ctx = getAudioContext()
    if (!ctx) return
    try {
      frequencies.forEach(({ freq, delay, duration }) => {
        setTimeout(() => {
          const oscillator = ctx.createOscillator()
          const gainNode = ctx.createGain()
          oscillator.connect(gainNode)
          gainNode.connect(ctx.destination)
          oscillator.frequency.value = freq
          oscillator.type = 'sine'
          gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000)
          oscillator.start(ctx.currentTime)
          oscillator.stop(ctx.currentTime + duration / 1000)
        }, delay)
      })
    } catch (e) {
      console.log('Audio not available')
    }
  }, [getAudioContext])

  const playCompletionSound = useCallback(() => {
    playSound([
      { freq: 523, delay: 0, duration: 150 },
      { freq: 659, delay: 150, duration: 150 },
      { freq: 784, delay: 300, duration: 150 },
      { freq: 1047, delay: 450, duration: 300 },
    ])
  }, [playSound])

  // Handle timer completion
  const handleComplete = useCallback(() => {
    if (!activeTimer) return

    const stars = activityStars[activeTimer.activity] || 1
    completeTimer(activeTimer.sessionId, stars)
    clearActiveTimer()
    setShowNotification(true)
    playCompletionSound()

    // Celebration confetti
    const child = children[activeTimer.childId]
    const colors = child?.theme === 'bria'
      ? ['#f43f5e', '#fb7185', '#fda4af']
      : ['#06b6d4', '#22d3ee', '#67e8f9']

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    })
  }, [activeTimer, completeTimer, clearActiveTimer, playCompletionSound, children])

  // Sync with store timer and count down
  useEffect(() => {
    if (!activeTimer) {
      setLocalTimeLeft(0)
      return
    }

    // Calculate current time left based on when timer started/paused
    if (activeTimer.isRunning) {
      const elapsed = Math.floor((Date.now() - activeTimer.startedAt) / 1000)
      const pauseOffset = activeTimer.pausedAt
        ? Math.floor((activeTimer.pausedAt - activeTimer.startedAt) / 1000)
        : 0
      const adjustedTimeLeft = activeTimer.duration * 60 - elapsed + pauseOffset
      setLocalTimeLeft(Math.max(0, adjustedTimeLeft))
    } else {
      setLocalTimeLeft(activeTimer.timeLeft)
    }
  }, [activeTimer?.sessionId, activeTimer?.isRunning, activeTimer?.pausedAt])

  // Countdown interval
  useEffect(() => {
    if (!activeTimer?.isRunning || localTimeLeft <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setLocalTimeLeft((prev) => {
        if (prev <= 1) {
          handleComplete()
          return 0
        }
        // Update store every 10 seconds to persist
        if (prev % 10 === 0) {
          setActiveTimer({
            ...activeTimer,
            timeLeft: prev - 1,
          })
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [activeTimer?.isRunning, activeTimer?.sessionId, handleComplete])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePause = () => {
    pauseActiveTimer()
    setActiveTimer({
      ...activeTimer,
      isRunning: false,
      timeLeft: localTimeLeft,
      pausedAt: Date.now(),
    })
  }

  const handleResume = () => {
    resumeActiveTimer()
    setActiveTimer({
      ...activeTimer,
      isRunning: true,
      pausedAt: null,
      startedAt: Date.now() - ((activeTimer.duration * 60 - localTimeLeft) * 1000),
    })
  }

  const handleDismissNotification = () => {
    setShowNotification(false)
  }

  const positionClasses = {
    'bottom-right': 'bottom-20 right-4 sm:bottom-24 sm:right-6',
    'bottom-left': 'bottom-20 left-4 sm:bottom-24 sm:left-6',
    'top-right': 'top-20 right-4 sm:top-24 sm:right-6',
    'top-left': 'top-20 left-4 sm:top-24 sm:left-6',
  }

  // Don't render if no active timer or on timer page
  if ((!activeTimer || isOnTimerPage) && !showNotification) {
    return null
  }

  const activity = activeTimer ? activityIcons[activeTimer.activity] : null
  const child = activeTimer ? children[activeTimer.childId] : null

  return (
    <>
      {/* Floating Mini Timer */}
      <AnimatePresence>
        {activeTimer && !isOnTimerPage && (
          <motion.div
            className={`fixed z-40 ${positionClasses[position]}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            drag
            dragConstraints={{ left: -200, right: 200, top: -300, bottom: 100 }}
            dragElastic={0.1}
          >
            <motion.div
              className={`
                ${isExpanded ? 'w-56' : 'w-auto'}
                bg-white rounded-2xl shadow-2xl border-2
                ${child?.theme === 'bria' ? 'border-rose-300' : 'border-teal-300'}
                overflow-hidden
              `}
              layout
            >
              {/* Collapsed view - just timer */}
              {!isExpanded ? (
                <motion.button
                  className={`
                    flex items-center gap-2 px-4 py-3
                    ${child?.theme === 'bria' ? 'bg-gradient-to-r from-rose-50 to-pink-50' : 'bg-gradient-to-r from-teal-50 to-cyan-50'}
                  `}
                  onClick={() => setIsExpanded(true)}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span
                    className="text-2xl"
                    animate={activeTimer.isRunning ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {activity?.emoji}
                  </motion.span>
                  <span className={`
                    text-lg font-display font-bold tabular-nums
                    ${localTimeLeft < 60 ? 'text-red-500' : child?.theme === 'bria' ? 'text-rose-600' : 'text-teal-600'}
                  `}>
                    {formatTime(localTimeLeft)}
                  </span>
                  {!activeTimer.isRunning && (
                    <span className="text-gray-400 text-sm">⏸️</span>
                  )}
                </motion.button>
              ) : (
                /* Expanded view - full controls */
                <div className={`
                  p-4
                  ${child?.theme === 'bria' ? 'bg-gradient-to-br from-rose-50 to-pink-50' : 'bg-gradient-to-br from-teal-50 to-cyan-50'}
                `}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{activity?.emoji}</span>
                      <span className="text-sm font-display font-semibold text-gray-700">
                        {activityLabels[activeTimer.activity]}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="p-1 rounded-full hover:bg-white/50"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  {/* Timer display */}
                  <div className="text-center mb-3">
                    <motion.span
                      className={`
                        text-3xl font-display font-bold tabular-nums
                        ${localTimeLeft < 60 ? 'text-red-500' : child?.theme === 'bria' ? 'text-rose-600' : 'text-teal-600'}
                      `}
                      animate={localTimeLeft < 60 ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      {formatTime(localTimeLeft)}
                    </motion.span>
                  </div>

                  {/* Controls */}
                  <div className="flex gap-2">
                    {activeTimer.isRunning ? (
                      <motion.button
                        className={`
                          flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                          ${child?.theme === 'bria' ? 'bg-rose-500 text-white' : 'bg-teal-500 text-white'}
                        `}
                        onClick={handlePause}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Pause className="w-4 h-4" />
                        <span className="text-sm font-medium">Pause</span>
                      </motion.button>
                    ) : (
                      <motion.button
                        className={`
                          flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                          ${child?.theme === 'bria' ? 'bg-rose-500 text-white' : 'bg-teal-500 text-white'}
                        `}
                        onClick={handleResume}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Play className="w-4 h-4" />
                        <span className="text-sm font-medium">Resume</span>
                      </motion.button>
                    )}
                    <motion.button
                      className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-600"
                      onClick={() => navigate('/timer')}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Clock className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer Complete Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismissNotification}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="text-6xl sm:text-7xl mb-4"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                🎉
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-2">
                Timer Done!
              </h2>
              <p className="text-gray-600 mb-6 font-display">
                Great job completing your activity!
              </p>
              <motion.button
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-display font-semibold shadow-lg"
                onClick={handleDismissNotification}
                whileTap={{ scale: 0.95 }}
              >
                Awesome! 🌟
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
