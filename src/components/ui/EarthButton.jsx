/**
 * UR1IFE Earth Button
 * Age-adaptive button with earth tone styling
 */

import { motion } from 'framer-motion'
import { useTheme, useThemeStyles } from '../providers/ThemeProvider'
import { springs, animationVariants } from '../../design-system/tokens/animations'

export function EarthButton({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  icon,
  fullWidth = false,
  className = '',
}) {
  const { theme, colors, spacing, borderRadius, animation } = useTheme()
  const { buttonSize, iconSize, fontSize } = useThemeStyles()

  const height = buttonSize(size)
  const anims = animationVariants[animation]

  // Variant styles
  const variantStyles = {
    primary: {
      backgroundColor: colors.primary,
      color: '#FFFFFF',
      border: 'none',
    },
    secondary: {
      backgroundColor: colors.secondary,
      color: '#FFFFFF',
      border: 'none',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.text,
      border: `2px solid ${colors.primary}`,
    },
    accent: {
      backgroundColor: colors.accent,
      color: colors.text,
      border: 'none',
    },
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={anims.hover}
      whileTap={anims.tap}
      transition={springs.snappy}
      className={className}
      style={{
        height,
        padding: `0 ${spacing.large}px`,
        borderRadius: borderRadius.large,
        fontFamily: 'inherit',
        fontSize: fontSize(size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'base'),
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.small,
        width: fullWidth ? '100%' : 'auto',
        minWidth: fullWidth ? undefined : height * 2,
        ...variantStyles[variant],
      }}
    >
      {icon && (
        <span style={{ fontSize: iconSize(size), display: 'flex' }}>
          {icon}
        </span>
      )}
      {children}
    </motion.button>
  )
}

export default EarthButton
