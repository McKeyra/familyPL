import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function TimerSlider({
  value,
  max,
  onChange,
  type = 'screen',
  theme = 'bria',
}) {
  const [isDragging, setIsDragging] = useState(false)
  const percentage = (value / max) * 100

  const themeColors = {
    bria: {
      track: 'from-bria-300 to-bria-500',
      thumb: 'bg-bria-600',
      glow: 'shadow-glow-bria',
    },
    naya: {
      track: 'from-naya-300 to-naya-500',
      thumb: 'bg-naya-600',
      glow: 'shadow-glow-naya',
    },
  }

  const colors = themeColors[theme]

  const typeIcons = {
    screen: { start: '🌙', end: '📺' },
    reading: { start: '📖', end: '🌟' },
    play: { start: '🎮', end: '🏆' },
    homework: { start: '✏️', end: '🎉' },
  }

  const icons = typeIcons[type] || typeIcons.screen

  return (
    <div className="w-full px-4">
      {/* Labels */}
      <div className="flex justify-between mb-4">
        <motion.span
          className="text-4xl"
          animate={{ scale: percentage < 20 ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {icons.start}
        </motion.span>
        <span className="font-display font-bold text-2xl text-gray-700">
          {Math.floor(value)} min
        </span>
        <motion.span
          className="text-4xl"
          animate={{ scale: percentage > 80 ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {icons.end}
        </motion.span>
      </div>

      {/* Slider track */}
      <div className="relative h-16 bg-gray-200 rounded-full overflow-hidden shadow-neumorphic-inset">
        {/* Progress fill */}
        <motion.div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colors.track} rounded-full`}
          style={{ width: `${percentage}%` }}
          animate={{
            boxShadow: isDragging
              ? '0 0 30px rgba(255,255,255,0.5)'
              : 'none',
          }}
        />

        {/* Stars along the track */}
        {[25, 50, 75].map((pos) => (
          <motion.div
            key={pos}
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: `${pos}%` }}
            animate={{
              scale: percentage >= pos ? 1.2 : 1,
              opacity: percentage >= pos ? 1 : 0.3,
            }}
          >
            <span className="text-2xl">⭐</span>
          </motion.div>
        ))}

        {/* Interactive slider */}
        <input
          type="range"
          min={0}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {/* Custom thumb */}
        <motion.div
          className={`
            absolute top-1/2 -translate-y-1/2 -translate-x-1/2
            w-14 h-14 ${colors.thumb}
            rounded-full shadow-lg
            flex items-center justify-center
            pointer-events-none
            ${isDragging ? colors.glow : ''}
          `}
          style={{ left: `${percentage}%` }}
          animate={{
            scale: isDragging ? 1.2 : 1,
          }}
        >
          {type === 'screen' && (
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="text-2xl">☀️</span>
            </motion.div>
          )}
          {type === 'reading' && <span className="text-2xl">📚</span>}
          {type === 'play' && <span className="text-2xl">🎯</span>}
          {type === 'homework' && <span className="text-2xl">📝</span>}
        </motion.div>
      </div>

      {/* Time markers */}
      <div className="flex justify-between mt-2 px-2 text-sm text-gray-500 font-display">
        <span>0</span>
        <span>{max / 2}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}
