import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Pause, RotateCcw, Check, Tv, BookOpen, Gamepad2, Pencil } from 'lucide-react'
import confetti from 'canvas-confetti'
import useStore from '../store/useStore'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import TimerSlider from '../components/ui/TimerSlider'

const activities = [
  { id: 'screen', label: 'Screen Time', emoji: '📺', icon: Tv, color: 'from-blue-400 to-blue-600', stars: 1 },
  { id: 'reading', label: 'Reading', emoji: '📚', icon: BookOpen, color: 'from-amber-400 to-orange-500', stars: 2 },
  { id: 'play', label: 'Play Time', emoji: '🎮', icon: Gamepad2, color: 'from-green-400 to-emerald-500', stars: 1 },
  { id: 'homework', label: 'Homework', emoji: '✏️', icon: Pencil, color: 'from-purple-400 to-purple-600', stars: 3 },
]

export default function Timer() {
  const navigate = useNavigate()
  const {
    currentChild,
    children,
    startTimer,
    completeTimer,
    activeTimer,
    setActiveTimer,
    updateActiveTimerTime,
    pauseActiveTimer,
    resumeActiveTimer,
    clearActiveTimer,
  } = useStore()
  const child = currentChild ? children[currentChild] : null

  // Local state derived from persisted activeTimer or defaults
  const [selectedActivity, setSelectedActivity] = useState(activeTimer?.activity || null)
  const [duration, setDuration] = useState(activeTimer?.duration || 15)
  const [timeLeft, setTimeLeft] = useState(activeTimer?.timeLeft || 0)
  const [isRunning, setIsRunning] = useState(activeTimer?.isRunning || false)
  const [sessionId, setSessionId] = useState(activeTimer?.sessionId || null)
  const [showComplete, setShowComplete] = useState(false)

  const intervalRef = useRef(null)

  // Restore state from persisted activeTimer on mount
  useEffect(() => {
    if (activeTimer && activeTimer.childId === currentChild) {
      setSelectedActivity(activeTimer.activity)
      setDuration(activeTimer.duration)
      setSessionId(activeTimer.sessionId)
      setIsRunning(activeTimer.isRunning)

      // Calculate remaining time if timer was running
      if (activeTimer.isRunning && activeTimer.timeLeft > 0) {
        const elapsed = Math.floor((Date.now() - (activeTimer.pausedAt || activeTimer.startedAt)) / 1000)
        const remaining = Math.max(0, activeTimer.timeLeft - elapsed)
        setTimeLeft(remaining)
        if (remaining <= 0) {
          handleComplete()
        }
      } else {
        setTimeLeft(activeTimer.timeLeft)
      }
    }
  }, [currentChild])

  // Persist timer state when it changes
  useEffect(() => {
    if (sessionId && selectedActivity) {
      setActiveTimer({
        childId: currentChild,
        activity: selectedActivity,
        duration,
        timeLeft,
        isRunning,
        sessionId,
        startedAt: activeTimer?.startedAt || Date.now(),
        pausedAt: isRunning ? null : Date.now(),
      })
    }
  }, [timeLeft, isRunning, sessionId, selectedActivity])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const handleComplete = useCallback(() => {
    setIsRunning(false)
    const activity = activities.find(a => a.id === selectedActivity)
    if (sessionId && activity) {
      completeTimer(sessionId, activity.stars)
    }
    setShowComplete(true)
    clearActiveTimer()

    // Celebration confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
  }, [sessionId, selectedActivity, completeTimer, clearActiveTimer])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, handleComplete])

  const handleStart = () => {
    if (!selectedActivity) return

    const activity = activities.find(a => a.id === selectedActivity)
    const id = startTimer(currentChild, activity.label, duration)
    const initialTimeLeft = duration * 60

    setSessionId(id)
    setTimeLeft(initialTimeLeft)
    setIsRunning(true)

    // Persist the new timer
    setActiveTimer({
      childId: currentChild,
      activity: selectedActivity,
      duration,
      timeLeft: initialTimeLeft,
      isRunning: true,
      sessionId: id,
      startedAt: Date.now(),
      pausedAt: null,
    })
  }

  const handlePause = () => {
    setIsRunning(false)
    pauseActiveTimer()
  }

  const handleResume = () => {
    setIsRunning(true)
    resumeActiveTimer()
  }

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(0)
    setSessionId(null)
    setSelectedActivity(null)
    setShowComplete(false)
    clearActiveTimer()
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = timeLeft > 0 ? ((duration * 60 - timeLeft) / (duration * 60)) * 100 : 0

  if (!child) return null

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-4 sm:mb-6 md:mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className="text-5xl sm:text-6xl block mb-2 sm:mb-3">
          ⏰
        </span>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-800">
          Activity Timer
        </h1>
        <p className="text-sm sm:text-base text-gray-600 font-display">
          Track your time and earn stars!
        </p>
      </motion.div>

      {/* Activity Selection */}
      {!sessionId && (
        <motion.div
          className="mb-4 sm:mb-6 md:mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-base sm:text-lg font-display font-semibold text-gray-700 mb-3 sm:mb-4 text-center">
            What are you doing?
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            {activities.map((activity, index) => (
              <motion.button
                key={activity.id}
                className={`
                  p-3 sm:p-4 rounded-xl sm:rounded-2xl text-white
                  bg-gradient-to-br ${activity.color}
                  ${selectedActivity === activity.id ? 'ring-4 ring-white shadow-xl' : 'shadow-lg'}
                  transition-all
                `}
                onClick={() => setSelectedActivity(activity.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <motion.span
                  className="text-3xl sm:text-4xl block mb-1.5 sm:mb-2"
                  animate={selectedActivity === activity.id ? { y: [0, -5, 0] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {activity.emoji}
                </motion.span>
                <span className="font-display font-bold block text-sm sm:text-base">{activity.label}</span>
                <span className="text-xs sm:text-sm text-white/80">
                  {activity.stars} ⭐ earned
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Duration Slider */}
      {selectedActivity && !sessionId && (
        <motion.div
          className="mb-4 sm:mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard variant={child.theme}>
            <h2 className="text-base sm:text-lg font-display font-semibold text-white mb-3 sm:mb-4 text-center">
              How long?
            </h2>
            <TimerSlider
              value={duration}
              max={60}
              onChange={setDuration}
              type={selectedActivity}
              theme={child.theme}
            />
          </GlassCard>
        </motion.div>
      )}

      {/* Timer Display */}
      {sessionId && (
        <motion.div
          className="mb-4 sm:mb-6 md:mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <GlassCard variant={child.theme} glow={child.theme} size="xl">
            <div className="text-center">
              {/* Current activity */}
              <motion.span
                className="text-5xl sm:text-6xl block mb-3 sm:mb-4"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {activities.find(a => a.id === selectedActivity)?.emoji}
              </motion.span>

              {/* Time remaining */}
              <motion.div
                className="text-5xl sm:text-6xl md:text-7xl font-display font-bold text-white mb-3 sm:mb-4"
                animate={isRunning && timeLeft < 60 ? {
                  scale: [1, 1.1, 1],
                  color: ['#fff', '#ff6b6b', '#fff'],
                } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {formatTime(timeLeft)}
              </motion.div>

              {/* Progress ring */}
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 mx-auto mb-3 sm:mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="white"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={553}
                    initial={{ strokeDashoffset: 553 }}
                    animate={{ strokeDashoffset: 553 - (553 * progress) / 100 }}
                    transition={{ duration: 0.5 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl sm:text-5xl md:text-6xl">
                    {isRunning ? '⏳' : timeLeft > 0 ? '⏸️' : '✅'}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-2 sm:gap-3 md:gap-4">
                {isRunning ? (
                  <Button
                    variant="glass"
                    size="lg"
                    icon={<Pause className="w-5 h-5 sm:w-6 sm:h-6" />}
                    onClick={handlePause}
                  >
                    Pause
                  </Button>
                ) : timeLeft > 0 ? (
                  <Button
                    variant="glass"
                    size="lg"
                    icon={<Play className="w-5 h-5 sm:w-6 sm:h-6" />}
                    onClick={handleResume}
                  >
                    Resume
                  </Button>
                ) : null}
                <Button
                  variant="glass"
                  size="lg"
                  icon={<RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />}
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Start Button */}
      {selectedActivity && !sessionId && (
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant={child.theme}
            size="xl"
            icon={<Play className="w-6 h-6 sm:w-8 sm:h-8" />}
            onClick={handleStart}
          >
            Start Timer
          </Button>
        </motion.div>
      )}

      {/* Completion Modal */}
      <AnimatePresence>
        {showComplete && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-sm w-full text-center text-white shadow-2xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <motion.div
                className="text-6xl sm:text-8xl mb-3 sm:mb-4"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                🎉
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold mb-1.5 sm:mb-2">
                Great Job!
              </h2>
              <p className="text-lg sm:text-xl mb-3 sm:mb-4 font-display">
                You completed your {activities.find(a => a.id === selectedActivity)?.label}!
              </p>
              <div className="flex justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                {[...Array(activities.find(a => a.id === selectedActivity)?.stars || 1)].map((_, i) => (
                  <span
                    key={i}
                    className="text-3xl sm:text-4xl"
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <div className="flex gap-2 sm:gap-3">
                <Button variant="glass" size="lg" onClick={handleReset}>
                  Start Another
                </Button>
                <Button variant="glass" size="lg" onClick={() => navigate('/')}>
                  Dashboard
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
