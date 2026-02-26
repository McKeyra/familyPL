import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Pause, RotateCcw, Check, Volume2, VolumeX, Sparkles, Clock, AlertCircle } from 'lucide-react'
import confetti from 'canvas-confetti'
import useStore from '../store/useStore'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import DurationPicker from '../components/ui/DurationPicker'
import { ModalOverlay } from '../components/ui/Modal'
import { activities, getActivity } from '../data/activities'

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
    getRemainingTime,
    getTimeLimit,
  } = useStore()
  const child = currentChild ? children[currentChild] : null

  // Local state derived from persisted activeTimer or defaults
  const [selectedActivity, setSelectedActivity] = useState(activeTimer?.activity || null)
  const [duration, setDuration] = useState(activeTimer?.duration || 30)
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

  // Play a beep sound
  const playBeep = useCallback((frequency = 440, dur = 200, type = 'sine') => {
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
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur / 1000)
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + dur / 1000)
    } catch (e) {
      console.log('Audio not available')
    }
  }, [audioEnabled, getAudioContext])

  const playWarningSound = useCallback(() => {
    if (!audioEnabled) return
    playBeep(880, 150)
    setTimeout(() => playBeep(880, 150), 200)
    setTimeout(() => playBeep(880, 150), 400)
  }, [playBeep, audioEnabled])

  const playCompletionSound = useCallback(() => {
    if (!audioEnabled) return
    playBeep(523, 150)
    setTimeout(() => playBeep(659, 150), 150)
    setTimeout(() => playBeep(784, 150), 300)
    setTimeout(() => playBeep(1047, 300), 450)
  }, [playBeep, audioEnabled])

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
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const handleComplete = useCallback(() => {
    setIsRunning(false)
    if (sessionId) {
      // No stars for timer completion - timer is for time management, not rewards
      completeTimer(sessionId, 0)
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
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors })
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }, [sessionId, completeTimer, clearActiveTimer, playCompletionSound, child?.theme])

  // Timer countdown effect with 1-minute warning
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
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
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, handleComplete, playWarningSound, hasPlayedWarning])

  const handleStart = () => {
    if (!selectedActivity) return

    const celebration = startCelebrations[Math.floor(Math.random() * startCelebrations.length)]
    setStartCelebration(celebration)
    setShowStartCelebration(true)
    playStartSound()

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } })

    setTimeout(() => {
      const activity = getActivity(selectedActivity)
      const id = startTimer(currentChild, activity.label, duration)
      const initialTimeLeft = duration * 60

      setSessionId(id)
      setTimeLeft(initialTimeLeft)
      setIsRunning(true)
      setHasPlayedWarning(false)
      setShowStartCelebration(false)

      if (pendingTimer) clearPendingTimer(currentChild)

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
  const isLastQuarter = progress > 75
  const isLastMinute = timeLeft > 0 && timeLeft <= 60

  if (!child) return null

  // Get remaining time for each activity from daily budget
  const getActivityRemaining = (activityId) => {
    const remaining = getRemainingTime(currentChild, activityId)
    const limit = getTimeLimit(currentChild, activityId)
    return { remaining, enabled: limit.enabled, limit: limit.limit }
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-2xl mx-auto pt-16">
      {/* Header */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className="text-5xl sm:text-6xl block mb-2">
          {sessionId ? getActivity(selectedActivity)?.emoji : '⏰'}
        </span>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-800">
          {sessionId ? getActivity(selectedActivity)?.label : 'Activity Timer'}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 font-display">
          {isParentMode ? 'Set up a timer for your child' : sessionId ? 'Focus on your activity!' : 'Ready when you are!'}
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

      {/* Child View: Pending Timer Notice */}
      {pendingTimer && !sessionId && !isParentMode && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard variant={child.theme} className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-6 h-6 text-white" />
              <span className="font-display font-bold text-white text-lg">Timer Ready!</span>
            </div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-5xl">{getActivity(selectedActivity)?.emoji}</span>
              <div className="text-left">
                <p className="text-white font-display font-semibold text-lg">
                  {getActivity(selectedActivity)?.label}
                </p>
                <p className="text-white/80 text-sm font-display">
                  {duration} minutes
                </p>
              </div>
            </div>
            <Button
              variant="glass"
              size="xl"
              icon={<Play className="w-7 h-7" />}
              onClick={handleStart}
              className="w-full"
            >
              Start Timer!
            </Button>
          </GlassCard>
        </motion.div>
      )}

      {/* Child View: No pending timer - show message */}
      {!pendingTimer && !sessionId && !isParentMode && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-xl font-display font-bold text-slate-700 mb-2">
            No Timer Set
          </h2>
          <p className="text-slate-500 font-display">
            Ask Mom or Dad to set up a timer for you!
          </p>
        </motion.div>
      )}

      {/* Parent Mode: Activity Selection */}
      {!sessionId && isParentMode && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-display font-semibold text-gray-700 mb-3 text-center">
            Select Activity for {child.name}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {activities.map((activity, index) => {
              const budget = getActivityRemaining(activity.id)
              const Icon = activity.icon
              const isSelected = selectedActivity === activity.id
              const noTimeLeft = budget.enabled && budget.remaining === 0

              return (
                <motion.button
                  key={activity.id}
                  className={`
                    relative p-4 rounded-2xl border-2 transition-all min-h-[120px]
                    ${noTimeLeft ? 'opacity-50 cursor-not-allowed' : ''}
                    ${isSelected && !noTimeLeft
                      ? `${activity.borderColor} ${activity.bgColor} ring-2 ring-offset-2 ring-${activity.color}-300 shadow-lg scale-[1.02]`
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'}
                  `}
                  onClick={() => !noTimeLeft && setSelectedActivity(activity.id)}
                  disabled={noTimeLeft}
                  whileHover={noTimeLeft ? {} : { y: -2 }}
                  whileTap={noTimeLeft ? {} : { scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  {/* Selected checkmark */}
                  {isSelected && !noTimeLeft && (
                    <motion.div
                      className={`absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br ${activity.gradientFrom} ${activity.gradientTo} flex items-center justify-center shadow-md`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </motion.div>
                  )}

                  <div className={`w-12 h-12 rounded-xl ${activity.bgColor} flex items-center justify-center mx-auto mb-2`}>
                    <Icon className={`w-6 h-6 ${activity.textColor}`} strokeWidth={1.5} />
                  </div>
                  <span className={`font-display font-bold block text-sm ${isSelected ? activity.textColor : 'text-gray-700'}`}>
                    {activity.label}
                  </span>

                  {/* Time Remaining indicator */}
                  {budget.enabled ? (
                    <div className={`mt-2 flex items-center justify-center gap-1 text-xs ${noTimeLeft ? 'text-red-500' : 'text-slate-500'}`}>
                      {noTimeLeft ? (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          <span>No time left</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>{budget.remaining} min left</span>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-slate-400">No limit</div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Parent Mode: Duration Picker */}
      {selectedActivity && !sessionId && isParentMode && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <h2 className="text-lg font-display font-semibold text-gray-700 mb-4 text-center">
              How long?
            </h2>
            <DurationPicker
              value={duration}
              onChange={setDuration}
              theme={child.theme}
            />
          </div>
        </motion.div>
      )}

      {/* Timer Display - Enhanced */}
      {sessionId && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <GlassCard variant={child.theme} glow={child.theme} size="xl">
            <div className="text-center py-4">
              {/* Progress ring - larger (240px) with color transitions */}
              <div className="relative w-60 h-60 sm:w-64 sm:h-64 mx-auto mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
                  {/* Background ring */}
                  <circle
                    cx="120"
                    cy="120"
                    r="108"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="16"
                    fill="none"
                  />
                  {/* Progress ring with color transition */}
                  <motion.circle
                    cx="120"
                    cy="120"
                    r="108"
                    stroke={isLastQuarter ? '#fbbf24' : 'white'}
                    strokeWidth="16"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={678.6}
                    initial={{ strokeDashoffset: 678.6 }}
                    animate={{
                      strokeDashoffset: 678.6 - (678.6 * progress) / 100,
                      stroke: isLastQuarter ? '#fbbf24' : 'white',
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    className="text-5xl sm:text-6xl md:text-7xl font-display font-bold text-white tabular-nums"
                    animate={isLastMinute ? {
                      scale: [1, 1.05, 1],
                    } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {formatTime(timeLeft)}
                  </motion.div>
                  <p className="text-white/70 text-sm mt-2 font-display">
                    {isRunning ? 'remaining' : 'paused'}
                  </p>
                </div>

                {/* Pulsing glow effect in last minute */}
                {isLastMinute && isRunning && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{
                      boxShadow: [
                        '0 0 0 0 rgba(251, 191, 36, 0)',
                        '0 0 40px 20px rgba(251, 191, 36, 0.3)',
                        '0 0 0 0 rgba(251, 191, 36, 0)',
                      ],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </div>

              {/* Controls - larger touch targets (56px) */}
              <div className="flex justify-center gap-4">
                {isRunning ? (
                  <motion.button
                    className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    onClick={handlePause}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Pause className="w-7 h-7" strokeWidth={2.5} />
                  </motion.button>
                ) : timeLeft > 0 ? (
                  <motion.button
                    className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    onClick={handleResume}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Play className="w-7 h-7 ml-1" strokeWidth={2.5} />
                  </motion.button>
                ) : null}
                {isParentMode && (
                  <motion.button
                    className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    onClick={handleReset}
                    whileTap={{ scale: 0.9 }}
                  >
                    <RotateCcw className="w-6 h-6" strokeWidth={2.5} />
                  </motion.button>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Parent Mode: Set Timer Button */}
      {selectedActivity && !sessionId && isParentMode && (
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant={child.theme}
            size="xl"
            icon={<Check className="w-6 h-6" />}
            onClick={handleParentSetTimer}
          >
            Set Timer for {child.name}
          </Button>
          {pendingTimer && (
            <motion.p
              className="text-green-600 font-display text-sm flex items-center gap-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Check className="w-4 h-4" />
              Timer is set! {child.name} can start when ready.
            </motion.p>
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
            animate={{ scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] }}
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
          className="bg-gradient-to-r from-amber-400 to-yellow-400 text-yellow-900 px-8 py-5 rounded-2xl shadow-2xl"
          initial={{ scale: 0, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0, y: -50 }}
        >
          <div className="flex items-center gap-4">
            <motion.span
              className="text-4xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: 3 }}
            >
              ⚡
            </motion.span>
            <span className="text-xl font-display font-bold">1 Minute Left!</span>
            <motion.span
              className="text-4xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: 3 }}
            >
              ⚡
            </motion.span>
          </div>
        </motion.div>
      </ModalOverlay>

      {/* Completion Modal - Enhanced celebration */}
      <ModalOverlay isOpen={showComplete} onClose={handleReset}>
        <motion.div
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl mx-4"
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 20 }}
        >
          {/* Animated completion ring */}
          <div className="relative w-24 h-24 mx-auto mb-4">
            <motion.svg
              className="w-full h-full"
              viewBox="0 0 96 96"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, ease: 'easeOut' }}
            >
              <circle
                cx="48"
                cy="48"
                r="44"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="8"
                strokeLinecap="round"
              />
            </motion.svg>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            >
              <span className="text-5xl">🎉</span>
            </motion.div>
          </div>

          <motion.h2
            className="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Great Job!
          </motion.h2>
          <motion.p
            className="text-lg mb-6 font-display text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            You completed your {getActivity(selectedActivity)?.label}!
          </motion.p>

          <div className="flex gap-3">
            <Button variant="clean" size="lg" onClick={handleReset} className="flex-1">
              Start Another
            </Button>
            <Button variant={child.theme} size="lg" onClick={() => navigate('/home')} className="flex-1">
              Done
            </Button>
          </div>
        </motion.div>
      </ModalOverlay>
    </div>
  )
}
