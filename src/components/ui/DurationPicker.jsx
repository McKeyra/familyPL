import { motion } from 'framer-motion'
import { Check, Clock } from 'lucide-react'
import { durationPresets } from '../../data/activities'

/**
 * DurationPicker - Parent-only component for selecting timer duration
 * Displays 4 large tappable cards with clock visuals: 15, 30, 45, 60 min
 */
export default function DurationPicker({ value, onChange, theme = 'bria' }) {
  const themeColors = {
    bria: {
      selected: 'border-rose-400 bg-rose-50 ring-2 ring-rose-300',
      checkBg: 'bg-rose-500',
      text: 'text-rose-600',
    },
    naya: {
      selected: 'border-teal-400 bg-teal-50 ring-2 ring-teal-300',
      checkBg: 'bg-teal-500',
      text: 'text-teal-600',
    },
  }

  const colors = themeColors[theme] || themeColors.bria

  // Generate clock arc path for visual
  const getClockArc = (minutes) => {
    const percentage = minutes / 60
    const angle = percentage * 360 - 90 // Start from top
    const endAngle = angle * (Math.PI / 180)
    const startAngle = -90 * (Math.PI / 180)

    const cx = 40, cy = 40, r = 32
    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)

    const largeArc = percentage > 0.5 ? 1 : 0

    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {durationPresets.map((preset, index) => {
        const isSelected = value === preset.value

        return (
          <motion.button
            key={preset.value}
            onClick={() => onChange(preset.value)}
            className={`
              relative p-4 rounded-2xl border-2 transition-all
              ${isSelected
                ? colors.selected
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Selected checkmark */}
            {isSelected && (
              <motion.div
                className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${colors.checkBg} flex items-center justify-center shadow-md`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </motion.div>
            )}

            {/* Clock visual */}
            <div className="flex justify-center mb-2">
              <svg width="80" height="80" viewBox="0 0 80 80">
                {/* Clock face background */}
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke={isSelected ? 'currentColor' : '#e2e8f0'}
                  strokeWidth="2"
                  className={isSelected ? colors.text : ''}
                />

                {/* Clock marks */}
                {[0, 90, 180, 270].map((angle) => {
                  const rad = (angle - 90) * (Math.PI / 180)
                  const x1 = 40 + 30 * Math.cos(rad)
                  const y1 = 40 + 30 * Math.sin(rad)
                  const x2 = 40 + 36 * Math.cos(rad)
                  const y2 = 40 + 36 * Math.sin(rad)
                  return (
                    <line
                      key={angle}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isSelected ? 'currentColor' : '#cbd5e1'}
                      strokeWidth="2"
                      strokeLinecap="round"
                      className={isSelected ? colors.text : ''}
                    />
                  )
                })}

                {/* Filled arc showing duration */}
                <motion.path
                  d={getClockArc(preset.value)}
                  fill={isSelected ? 'currentColor' : '#e2e8f0'}
                  className={isSelected ? colors.text : ''}
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: isSelected ? 0.4 : 0.3 }}
                />

                {/* Center dot */}
                <circle
                  cx="40"
                  cy="40"
                  r="3"
                  fill={isSelected ? 'currentColor' : '#94a3b8'}
                  className={isSelected ? colors.text : ''}
                />
              </svg>
            </div>

            {/* Duration text */}
            <div className="text-center">
              <span className={`text-2xl font-bold ${isSelected ? colors.text : 'text-slate-700'}`}>
                {preset.value}
              </span>
              <span className={`text-sm ml-1 ${isSelected ? colors.text : 'text-slate-500'}`}>
                min
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isSelected ? colors.text : 'text-slate-400'}`}>
              {preset.description}
            </p>
          </motion.button>
        )
      })}
    </div>
  )
}
