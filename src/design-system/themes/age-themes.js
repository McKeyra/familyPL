/**
 * UR1IFE Design System - Age-Adaptive Themes
 * Toddler (3-5), Child (6-9), Parent (10+)
 */

import { spacing, borderRadius } from './base'
import { earthTones } from './colors'

export const ageThemes = {
  toddler: {
    colors: {
      primary: '#E8D5C4',
      secondary: '#C8B5A6',
      accent: '#B8D4C8',
      background: '#FFF9F5',
      text: '#4A3F35',
      card: '#FFFFFF',
      border: '#E8D5C4',
    },
    typography: {
      fontFamily: '"Nunito", sans-serif',
      sizes: {
        xs: '16px',
        sm: '18px',
        base: '22px',
        lg: '28px',
        xl: '36px',
        xxl: '48px',
      },
    },
    spacing: {
      ...spacing,
      base: 20,    // Larger touch targets
      medium: 28,
      large: 40,
    },
    borderRadius: {
      ...borderRadius,
      medium: 16,
      large: 24,
      xl: 32,
    },
    animation: 'playful',
    touchTargetMin: 56,
  },

  child: {
    colors: {
      primary: '#B89976',
      secondary: '#8F7A66',
      accent: '#9FB4A8',
      background: '#F8F6F3',
      text: '#3D3731',
      card: '#FFFFFF',
      border: '#D9CAB3',
    },
    typography: {
      fontFamily: '"Space Grotesk", sans-serif',
      sizes: {
        xs: '14px',
        sm: '16px',
        base: '18px',
        lg: '24px',
        xl: '32px',
        xxl: '42px',
      },
    },
    spacing: spacing,
    borderRadius: borderRadius,
    animation: 'subtle',
    touchTargetMin: 44,
  },

  parent: {
    colors: {
      primary: earthTones.terracotta,
      secondary: earthTones.clay,
      accent: earthTones.sage,
      background: earthTones.cream,
      text: earthTones.charcoal,
      card: '#FFFFFF',
      border: earthTones.sand,
    },
    typography: {
      fontFamily: '"Inter", sans-serif',
      sizes: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '20px',
        xl: '28px',
        xxl: '36px',
      },
    },
    spacing: spacing,
    borderRadius: {
      ...borderRadius,
      medium: 12,
      large: 16,
    },
    animation: 'subtle',
    touchTargetMin: 36,
  },
}

/**
 * Get theme based on age
 * @param {number} age - User's age
 * @returns {'toddler' | 'child' | 'parent'}
 */
export function getThemeForAge(age) {
  if (age < 6) return 'toddler'
  if (age < 10) return 'child'
  return 'parent'
}

/**
 * Get theme config based on age
 * @param {number} age - User's age
 */
export function getThemeConfig(age) {
  const themeName = getThemeForAge(age)
  return {
    name: themeName,
    ...ageThemes[themeName]
  }
}

export default ageThemes
