import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Pause, RotateCcw, Check, Tv, BookOpen, Gamepad2, Pencil, Volume2, VolumeX, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'
import useStore from '../store/useStore'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import TimerSlider from '../components/ui/TimerSlider'
import { ModalOverlay } from '../components/ui/Modal'

const activities = [
  { id: 'screen', label: 'Screen Time', emoji: '📺', icon: Tv, color: 'blue', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-600', stars: 1 },
  { id: 'reading', label: 'Reading', emoji: '📚', icon: BookOpen, color: 'amber', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', textColor: 'text-amber-600', stars: 2 },
  { id: 'play', label: 'Play Time', emoji: '🎮', icon: Gamepad2, color: 'green', bgColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-green-600', stars: 1 },
  { id: 'homework', label: 'Homework', emoji: '✏️', icon: Pencil, color: 'purple', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', textColor: 'text-purple-600', stars: 3 },
]

// Funny celebration messages for starting the timer
const startCelebrations = [
  { emoji: '🚀', text: 'Blast off!' },
  { emoji: '🎪', text: 'Let the fun begin!' },
  { emoji: '🦸', text: 'Hero mode activated!' },
  { emoji: '🎯', text: 'Ready, set, GO!' },
  { emoji: '🌟', text: 'Superstar time!' },
  { emoji: '🎉', text: 'Party time!' },
]

export default function Timer() {
  const navigate = useNavigate()
  const {
    currentChild,
    children,
    isParentMode,
    startTimer,
    completeTimer,
    activeTimer,
    setActiveTimer,
    pauseActiveTimer,
    resumeActiveTimer,
    clearActiveTimer,
    getPendingTimer,
    setPendingTimer,
    clearPendingTimer,
  } = useStore()
  const child = currentChild ? children[currentChild] : null

  // Local state derived from persisted activeTimer or defaults
  const [selectedActivity, setSelectedActivity] = useState(activeTimer?.activity || null)
  const [duration, setDuration] = useState(activeTimer?.duration || 15)
  const [timeLeft, setTimeLeft] = useState(activeTimer?.timeLeft || 0)
  const [isRunning, setIsRunning] = useState(activeTimer?.isRunning || false)
  const [sessionId, setSessionId] = useState(activeTimer?.sessionId || null)
  const [showComplete, setShowComplete] = useState(false)
  const [showStartCelebration, setShowStartCelebration] = useState(false)
  const [startCelebration, setStartCelebration] = useState(null)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [showOneMinuteWarning, setShowOneMinuteWarning] = useState(false)
  const [hasPlayedWarning, setHasPlayedWarning] = useState(false)

  const intervalRef = useRef(null)
  const audioContextRef = useRef(null)

  // Get pending timer set by parent
  const pendingTimer = currentChild ? getPendingTimer(currentChild) : null

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

  // Play a beep sound - lazily creates audio context
  const playBeep = useCallback((frequency = 440, duration = 200, type = 'sine') => {
    if (!audioEnabled) return

    const ctx = getAudioContext()
    if (!ctx) return

    try {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = frequency
      oscillator.type = type

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration / 1000)
    } catch (e) {
      console.log('Audio not available')
    }
  }, [audioEnabled, getAudioContext])

  // Play warning sound (multiple beeps)
  const playWarningSound = useCallback(() => {
    if (!audioEnabled) return
    playBeep(880, 150)
    setTimeout(() => playBeep(880, 150), 200)
    setTimeout(() => playBeep(880, 150), 400)
  }, [playBeep, audioEnabled])

  // Play completion sound (happy melody)
  const playCompletionSound = useCallback(() => {
    if (!audioEnabled) return
    playBeep(523, 150) // C
    setTimeout(() => playBeep(659, 150), 150) // E
    setTimeout(() => playBeep(784, 150), 300) // G
    setTimeout(() => playBeep(1047, 300), 450) // High C
  }, [playBeep, audioEnabled])

  // Play start sound
  const playStartSound = useCallback(() => {
    if (!audioEnabled) return
    playBeep(440, 100)
    setTimeout(() => playBeep(554, 100), 100)
    setTimeout(() => playBeep(659, 150), 200)
  }, [playBeep, audioEnabled])

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
    } else if (pendingTimer && !sessionId) {
      // Load pending timer from parent
      setSelectedActivity(pendingTimer.activity)
      setDuration(pendingTimer.duration)
    }
  }, [currentChild, pendingTimer])

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
    playCompletionSound()

    // Big celebration confetti
    const duration = 3000
    const end = Date.now() + duration
    const colors = child?.theme === 'bria'
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
  }, [sessionId, selectedActivity, completeTimer, clearActiveTimer, playCompletionSound, child?.theme])

  // Timer countdown effect with 1-minute warning
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          // 1-minute warning
          if (prev === 61 && !hasPlayedWarning) {
            setShowOneMinuteWarning(true)
            playWarningSound()
            setHasPlayedWarning(true)
            setTimeout(() => setShowOneMinuteWarning(false), 3000)
          }

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
  }, [isRunning, handleComplete, playWarningSound, hasPlayedWarning])

  const handleStart = () => {
    if (!selectedActivity) return

    // Show celebration animation
    const celebration = startCelebrations[Math.floor(Math.random() * startCelebrations.length)]
    setStartCelebration(celebration)
    setShowStartCelebration(true)
    playStartSound()

    // Trigger confetti
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    })

    // Start timer after celebration
    setTimeout(() => {
      const activity = activities.find(a => a.id === selectedActivity)
      const id = startTimer(currentChild, activity.label, duration)
      const initialTimeLeft = duration * 60

      setSessionId(id)
      setTimeLeft(initialTimeLeft)
      setIsRunning(true)
      setHasPlayedWarning(false)
      setShowStartCelebration(false)

      // Clear pending timer if it exists
      if (pendingTimer) {
        clearPendingTimer(currentChild)
      }

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
    }, 1500)
  }

  const handleParentSetTimer = () => {
    if (!selectedActivity) return
    setPendingTimer(currentChild, selectedActivity, duration)

    // Show confirmation
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#c084fc', '#e9d5ff'],
    })
  }

  const handlePause = () => {
    setIsRunning(false)
    pauseActiveTimer()
    playBeep(330, 100)
  }

  const handleResume = () => {
    setIsRunning(true)
    resumeActiveTimer()
    playBeep(440, 100)
  }

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(0)
    setSessionId(null)
    setSelectedActivity(null)
    setShowComplete(false)
    setHasPlayedWarning(false)
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
          {isParentMode ? 'Set up a timer for your child' : 'Track your time and earn stars!'}
        </p>

        {/* Audio toggle */}
        <motion.button
          className={`mt-2 p-2 rounded-full ${audioEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
          onClick={() => setAudioEnabled(!audioEnabled)}
          whileTap={{ scale: 0.9 }}
        >
          {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </motion.button>
      </motion.div>

      {/* Pending Timer Notice (for kids) */}
      {pendingTimer && !sessionId && !isParentMode && (
        <motion.div
          className="mb-4 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl border-2 border-purple-300"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className="font-display font-bold text-purple-700">Timer Ready!</span>
          </div>
          <p className="text-center text-purple-600 text-sm font-display">
            Mom or Dad set up a {duration} minute {activities.find(a => a.id === selectedActivity)?.label} timer for you!
          </p>
        </motion.div>
      )}

      {/* Activity Selection (only if no pending timer for kids, or parent mode) */}
      {!sessionId && (isParentMode || !pendingTimer) && (
        <motion.div
          className="mb-4 sm:mb-6 md:mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-base sm:text-lg font-display font-semibold text-gray-700 mb-3 sm:mb-4 text-center">
            {isParentMode ? 'Select activity for your child:' : 'What are you doing?'}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {activities.map((activity, index) => (
              <motion.button
                key={activity.id}
                className={`
                  p-4 sm:p-5 rounded-2xl sm:rounded-3xl
                  bg-white border-2 shadow-sm
                  ${selectedActivity === activity.id
                    ? `${activity.borderColor} ${activity.bgColor} ring-2 ring-offset-2 ring-${activity.color}-400 shadow-md`
                    : 'border-gray-200 hover:border-gray-300'}
                  transition-all min-h-[100px] sm:min-h-[120px]
                `}
                onClick={() => setSelectedActivity(activity.id)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <motion.span
                  className="text-4xl sm:text-5xl block mb-2 sm:mb-3"
                  animate={selectedActivity === activity.id ? { y: [0, -5, 0] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {activity.emoji}
                </motion.span>
                <span className={`font-display font-bold block text-sm sm:text-base ${selectedActivity === activity.id ? activity.textColor : 'text-gray-700'}`}>
                  {activity.label}
                </span>
                <span className={`text-xs sm:text-sm ${selectedActivity === activity.id ? activity.textColor + '/70' : 'text-gray-500'}`}>
                  {activity.stars} ⭐ earned
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Duration Slider */}
      {selectedActivity && !sessionId && (isParentMode || !pendingTimer) && (
        <motion.div
          className="mb-4 sm:mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard variant="clean-elevated">
            <h2 className="text-base sm:text-lg font-display font-semibold text-gray-700 mb-3 sm:mb-4 text-center">
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

              {/* Controls - Only pause/resume for parents */}
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
                {isParentMode && (
                  <Button
                    variant="glass"
                    size="lg"
                    icon={<RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />}
                    onClick={handleReset}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Start Button (for kids) or Set Timer Button (for parents) */}
      {selectedActivity && !sessionId && (
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {isParentMode ? (
            <>
              <Button
                variant={child.theme}
                size="xl"
                icon={<Check className="w-6 h-6 sm:w-8 sm:h-8" />}
                onClick={handleParentSetTimer}
              >
                Set Timer for {child.name}
              </Button>
              {pendingTimer && (
                <p className="text-green-600 font-display text-sm">
                  ✓ Timer is set! {child.name} can start when ready.
                </p>
              )}
            </>
          ) : (
            <Button
              variant={child.theme}
              size="xl"
              icon={<Play className="w-6 h-6 sm:w-8 sm:h-8" />}
              onClick={handleStart}
            >
              {pendingTimer ? 'Start My Timer!' : 'Start Timer'}
            </Button>
          )}
        </motion.div>
      )}

      {/* Start Celebration Modal */}
      <ModalOverlay isOpen={showStartCelebration && !!startCelebration} closeOnBackdrop={false}>
        <motion.div
          className="text-center p-6"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <motion.span
            className="text-8xl sm:text-9xl block"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -10, 10, 0],
            }}
            transition={{ duration: 0.5, repeat: 2 }}
          >
            {startCelebration?.emoji}
          </motion.span>
          <motion.p
            className="text-2xl sm:text-3xl font-display font-bold text-white mt-4 drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {startCelebration?.text}
          </motion.p>
        </motion.div>
      </ModalOverlay>

      {/* One Minute Warning */}
      <ModalOverlay isOpen={showOneMinuteWarning} closeOnBackdrop={false} className="pointer-events-none">
        <motion.div
          className="bg-yellow-400 text-yellow-900 px-6 sm:px-8 py-4 rounded-2xl shadow-2xl"
          initial={{ scale: 0, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0, y: -50 }}
        >
          <div className="flex items-center gap-3">
            <motion.span
              className="text-3xl sm:text-4xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: 3 }}
            >
              ⚡
            </motion.span>
            <span className="text-lg sm:text-xl font-display font-bold">1 Minute Left!</span>
            <motion.span
              className="text-3xl sm:text-4xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: 3 }}
            >
              ⚡
            </motion.span>
          </div>
        </motion.div>
      </ModalOverlay>

      {/* Completion Modal */}
      <ModalOverlay isOpen={showComplete} onClose={handleReset}>
        <motion.div
          className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-sm w-full text-center shadow-2xl mx-4"
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 20 }}
        >
          <motion.div
            className="text-6xl sm:text-8xl mb-3 sm:mb-4"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: 3 }}
          >
            🎉
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-1.5 sm:mb-2">
            Great Job!
          </h2>
          <p className="text-lg sm:text-xl mb-3 sm:mb-4 font-display text-gray-600">
            You completed your {activities.find(a => a.id === selectedActivity)?.label}!
          </p>
          <div className="flex justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
            {[...Array(activities.find(a => a.id === selectedActivity)?.stars || 1)].map((_, i) => (
              <motion.span
                key={i}
                className="text-3xl sm:text-4xl"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                ⭐
              </motion.span>
            ))}
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Button variant="clean" size="lg" onClick={handleReset} className="flex-1">
              Start Another
            </Button>
            <Button variant={child.theme} size="lg" onClick={() => navigate('/')} className="flex-1">
              Dashboard
            </Button>
          </div>
        </motion.div>
      </ModalOverlay>
    </div>
  )
}
