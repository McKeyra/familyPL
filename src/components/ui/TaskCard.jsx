/**
 * UR1IFE Task Card
 * Age-adaptive task completion card with earth tones
 */

import { motion } from 'framer-motion'
import { EarthCard } from './EarthCard'
import { useTheme, useThemeStyles } from '../providers/ThemeProvider'
import { springs } from '../../design-system/tokens/animations'

export function TaskCard({
  title,
  icon,
  completed = false,
  onComplete,
  stars = 1,
}) {
  const { theme, colors, spacing } = useTheme()
  const { iconSize, fontSize } = useThemeStyles()

  return (
    <EarthCard onClick={onComplete} elevated>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.medium,
          opacity: completed ? 0.6 : 1,
        }}
      >
        {/* Icon */}
        <motion.div
          animate={{
            filter: completed ? 'grayscale(1)' : 'grayscale(0)',
            scale: completed ? 0.9 : 1,
          }}
          transition={springs.gentle}
          style={{
            fontSize: iconSize('large'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </motion.div>

        {/* Title */}
        <div style={{ flex: 1 }}>
          <h3
            style={{
              margin: 0,
              fontSize: fontSize('base'),
              fontWeight: 600,
              color: colors.text,
              textDecoration: completed ? 'line-through' : 'none',
            }}
          >
            {title}
          </h3>
          {stars > 0 && (
            <div
              style={{
                fontSize: fontSize('sm'),
                color: colors.secondary,
                marginTop: 4,
              }}
            >
              {'⭐'.repeat(stars)}
            </div>
          )}
        </div>

        {/* Completion indicator */}
        <motion.div
          animate={{
            backgroundColor: completed ? colors.primary : 'transparent',
            borderColor: colors.primary,
          }}
          transition={springs.snappy}
          style={{
            width: theme === 'toddler' ? 36 : theme === 'child' ? 28 : 24,
            height: theme === 'toddler' ? 36 : theme === 'child' ? 28 : 24,
            borderRadius: '50%',
            border: `3px solid ${colors.primary}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: theme === 'toddler' ? 20 : 16,
            fontWeight: 'bold',
          }}
        >
          {completed && '✓'}
        </motion.div>
      </div>
    </EarthCard>
  )
}

export default TaskCard
