/**
 * UR1IFE Theme Provider
 * Age-adaptive theme injection for the entire app
 */

import { createContext, useContext, useMemo } from 'react'
import { ageThemes, getThemeForAge } from '../../design-system/themes/age-themes'

const ThemeContext = createContext(null)

export function ThemeProvider({ children, age = 10 }) {
  // Determine theme based on age
  const themeName = getThemeForAge(age)
  const themeConfig = ageThemes[themeName]

  const value = useMemo(() => ({
    theme: themeName,
    ...themeConfig,
  }), [themeName, themeConfig])

  // CSS custom properties for the theme
  const cssVars = {
    '--color-primary': themeConfig.colors.primary,
    '--color-secondary': themeConfig.colors.secondary,
    '--color-accent': themeConfig.colors.accent,
    '--color-background': themeConfig.colors.background,
    '--color-text': themeConfig.colors.text,
    '--color-card': themeConfig.colors.card,
    '--color-border': themeConfig.colors.border,
    '--font-family': themeConfig.typography.fontFamily,
    '--font-size-xs': themeConfig.typography.sizes.xs,
    '--font-size-sm': themeConfig.typography.sizes.sm,
    '--font-size-base': themeConfig.typography.sizes.base,
    '--font-size-lg': themeConfig.typography.sizes.lg,
    '--font-size-xl': themeConfig.typography.sizes.xl,
    '--font-size-xxl': themeConfig.typography.sizes.xxl,
    '--spacing-base': `${themeConfig.spacing.base}px`,
    '--spacing-medium': `${themeConfig.spacing.medium}px`,
    '--spacing-large': `${themeConfig.spacing.large}px`,
    '--border-radius-medium': `${themeConfig.borderRadius.medium}px`,
    '--border-radius-large': `${themeConfig.borderRadius.large}px`,
    '--touch-target-min': `${themeConfig.touchTargetMin}px`,
  }

  return (
    <ThemeContext.Provider value={value}>
      <div style={cssVars} className="theme-root">
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

/**
 * Hook to get theme-aware styles
 */
export function useThemeStyles() {
  const theme = useTheme()

  return {
    // Button sizes by theme
    buttonSize: (size = 'medium') => {
      const sizeMap = {
        toddler: { small: 56, medium: 64, large: 72 },
        child: { small: 44, medium: 52, large: 60 },
        parent: { small: 36, medium: 44, large: 52 },
      }
      return sizeMap[theme.theme][size]
    },

    // Icon sizes by theme
    iconSize: (size = 'medium') => {
      const sizeMap = {
        toddler: { small: 24, medium: 32, large: 48 },
        child: { small: 20, medium: 24, large: 36 },
        parent: { small: 16, medium: 20, large: 24 },
      }
      return sizeMap[theme.theme][size]
    },

    // Font size by theme
    fontSize: (size = 'base') => {
      return theme.typography.sizes[size] || theme.typography.sizes.base
    },
  }
}

export default ThemeProvider
