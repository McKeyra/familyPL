/**
 * UR1IFE Earth Card
 * Age-adaptive card with earth tone styling
 */

import { motion } from 'framer-motion'
import { useTheme } from '../providers/ThemeProvider'
import { springs, cardAnimations } from '../../design-system/tokens/animations'

export function EarthCard({
  children,
  onClick,
  elevated = false,
  padding = 'large',
  className = '',
}) {
  const { theme, colors, spacing, borderRadius, animation } = useTheme()

  // Shadow by theme
  const shadows = {
    toddler: elevated ? '0 4px 16px rgba(62, 55, 49, 0.08)' : 'none',
    child: elevated ? '0 2px 8px rgba(62, 55, 49, 0.08)' : 'none',
    parent: elevated ? '0 1px 4px rgba(62, 55, 49, 0.06)' : 'none',
  }

  // Padding by prop
  const paddingMap = {
    none: 0,
    small: spacing.small,
    medium: spacing.medium,
    large: spacing.large,
  }

  const anims = animation === 'playful' ? cardAnimations.playful : cardAnimations.subtle

  return (
    <motion.div
      onClick={onClick}
      {...(animation !== 'none' ? anims : {})}
      transition={springs.gentle}
      className={className}
      style={{
        backgroundColor: colors.card,
        padding: paddingMap[padding],
        borderRadius: borderRadius.large,
        boxShadow: shadows[theme],
        cursor: onClick ? 'pointer' : 'default',
        border: `1px solid ${colors.border}`,
      }}
    >
      {children}
    </motion.div>
  )
}

export default EarthCard
