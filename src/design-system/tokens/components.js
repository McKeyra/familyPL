/**
 * UR1IFE Design System - Component Themes
 * Age-adaptive component styling configurations
 */

export const componentThemes = {
  // ========================================
  // Task Cards
  // ========================================
  taskCard: {
    toddler: {
      borderRadius: 24,           // very rounded
      padding: 24,
      shadow: 'none',             // less visual complexity
      iconSize: 48,               // BIG icons
      animation: 'bounce',        // playful
      fontSize: 22,
      checkboxSize: 36,
      gap: 20,
    },
    child: {
      borderRadius: 16,
      padding: 20,
      shadow: '0 2px 8px rgba(62, 55, 49, 0.08)',
      iconSize: 36,
      animation: 'subtle-scale',
      fontSize: 18,
      checkboxSize: 28,
      gap: 16,
    },
    parent: {
      borderRadius: 12,
      padding: 16,
      shadow: '0 1px 4px rgba(62, 55, 49, 0.06)',
      iconSize: 24,
      animation: 'none',
      fontSize: 16,
      checkboxSize: 24,
      gap: 12,
    }
  },

  // ========================================
  // Buttons
  // ========================================
  button: {
    toddler: {
      height: 64,                 // easy to tap
      minWidth: 120,
      fontSize: 22,
      borderRadius: 32,
      iconSize: 32,
      padding: '0 32px',
    },
    child: {
      height: 52,
      minWidth: 100,
      fontSize: 18,
      borderRadius: 26,
      iconSize: 24,
      padding: '0 24px',
    },
    parent: {
      height: 44,
      minWidth: 80,
      fontSize: 16,
      borderRadius: 12,
      iconSize: 20,
      padding: '0 20px',
    }
  },

  // ========================================
  // Cards (general)
  // ========================================
  card: {
    toddler: {
      borderRadius: 24,
      padding: 24,
      shadow: 'none',
      borderWidth: 3,
    },
    child: {
      borderRadius: 16,
      padding: 20,
      shadow: '0 2px 8px rgba(62, 55, 49, 0.08)',
      borderWidth: 2,
    },
    parent: {
      borderRadius: 12,
      padding: 16,
      shadow: '0 1px 4px rgba(62, 55, 49, 0.06)',
      borderWidth: 1,
    }
  },

  // ========================================
  // Timer
  // ========================================
  timer: {
    toddler: {
      size: 280,
      strokeWidth: 16,
      fontSize: 64,
      labelSize: 24,
    },
    child: {
      size: 220,
      strokeWidth: 12,
      fontSize: 48,
      labelSize: 18,
    },
    parent: {
      size: 180,
      strokeWidth: 8,
      fontSize: 36,
      labelSize: 14,
    }
  },

  // ========================================
  // Navigation
  // ========================================
  navigation: {
    toddler: {
      itemHeight: 72,
      iconSize: 36,
      fontSize: 18,
      gap: 16,
    },
    child: {
      itemHeight: 56,
      iconSize: 28,
      fontSize: 14,
      gap: 12,
    },
    parent: {
      itemHeight: 48,
      iconSize: 20,
      fontSize: 12,
      gap: 8,
    }
  },

  // ========================================
  // Star Display
  // ========================================
  starDisplay: {
    toddler: {
      starSize: 48,
      fontSize: 36,
      gap: 8,
    },
    child: {
      starSize: 32,
      fontSize: 28,
      gap: 6,
    },
    parent: {
      starSize: 24,
      fontSize: 20,
      gap: 4,
    }
  },

  // ========================================
  // Avatar
  // ========================================
  avatar: {
    toddler: {
      size: 80,
      fontSize: 36,
      borderWidth: 4,
    },
    child: {
      size: 56,
      fontSize: 24,
      borderWidth: 3,
    },
    parent: {
      size: 40,
      fontSize: 16,
      borderWidth: 2,
    }
  },
}

/**
 * Get component theme for age
 */
export function getComponentTheme(componentName, age) {
  const theme = componentThemes[componentName]
  if (!theme) return null

  if (age < 6) return theme.toddler
  if (age < 10) return theme.child
  return theme.parent
}

/**
 * Get theme name for age
 */
export function getThemeName(age) {
  if (age < 6) return 'toddler'
  if (age < 10) return 'child'
  return 'parent'
}

export default componentThemes
