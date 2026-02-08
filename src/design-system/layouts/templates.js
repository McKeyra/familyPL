/**
 * UR1IFE Design System - Layout Templates
 * Pre-configured layouts for different user types
 */

export const layoutTemplates = {
  // ========================================
  // For 4-year-old
  // ========================================
  toddler_simple: {
    id: 'toddler_simple',
    name: 'Simple & Fun',
    description: 'Big buttons, simple tasks, lots of celebration',
    ageRange: '3-5',
    components: [
      {
        type: 'timer',
        position: { row: 0, col: 0 },
        size: { width: 'full', height: 'large' },
        priority: 1,
      },
      {
        type: 'chore_card',
        position: { row: 1, col: 0 },
        size: { width: 'full', height: 'extra-large' },
        priority: 2,
      },
      {
        type: 'star_display',
        position: { row: 2, col: 0 },
        size: { width: 'full', height: 'medium' },
        priority: 3,
      },
    ],
    features: [
      'big-buttons',
      'high-contrast',
      'sound-feedback',
      'celebration-animations',
      'simple-icons',
    ],
    theme: 'toddler',
    gridColumns: 1,
    gridGap: 24,
  },

  // ========================================
  // For 8-year-old
  // ========================================
  child_explorer: {
    id: 'child_explorer',
    name: 'Explorer Dashboard',
    description: 'Track progress, earn stars, complete challenges',
    ageRange: '6-9',
    components: [
      {
        type: 'dashboard_header',
        position: { row: 0, col: 0 },
        size: { width: 'full', height: 'small' },
        priority: 1,
      },
      {
        type: 'star_display',
        position: { row: 0, col: 1 },
        size: { width: 'half', height: 'small' },
        priority: 2,
      },
      {
        type: 'chore_list',
        position: { row: 1, col: 0 },
        size: { width: 'half', height: 'large' },
        priority: 3,
      },
      {
        type: 'calendar_mini',
        position: { row: 1, col: 1 },
        size: { width: 'half', height: 'large' },
        priority: 4,
      },
      {
        type: 'challenge_card',
        position: { row: 2, col: 0 },
        size: { width: 'full', height: 'medium' },
        priority: 5,
      },
    ],
    features: [
      'streaks',
      'challenges',
      'stars',
      'progress-tracking',
      'weekly-view',
    ],
    theme: 'child',
    gridColumns: 2,
    gridGap: 16,
  },

  // ========================================
  // For parents
  // ========================================
  parent_command_center: {
    id: 'parent_command_center',
    name: 'Family Command Center',
    description: 'Full overview of all family members and tasks',
    ageRange: '18+',
    components: [
      {
        type: 'family_overview',
        position: { row: 0, col: 0 },
        size: { width: 'full', height: 'medium' },
        priority: 1,
      },
      {
        type: 'todays_tasks',
        position: { row: 1, col: 0 },
        size: { width: 'half', height: 'large' },
        priority: 2,
      },
      {
        type: 'calendar',
        position: { row: 1, col: 1 },
        size: { width: 'half', height: 'large' },
        priority: 3,
      },
      {
        type: 'upcoming_events',
        position: { row: 2, col: 0 },
        size: { width: 'third', height: 'medium' },
        priority: 4,
      },
      {
        type: 'star_summary',
        position: { row: 2, col: 1 },
        size: { width: 'third', height: 'medium' },
        priority: 5,
      },
      {
        type: 'quick_actions',
        position: { row: 2, col: 2 },
        size: { width: 'third', height: 'medium' },
        priority: 6,
      },
    ],
    features: [
      'family-overview',
      'upcoming-tasks',
      'analytics',
      'settings-access',
      'multi-child-view',
    ],
    theme: 'parent',
    gridColumns: 3,
    gridGap: 12,
  },

  // ========================================
  // Focus Mode (all ages)
  // ========================================
  focus_mode: {
    id: 'focus_mode',
    name: 'Focus Mode',
    description: 'Timer and current task only',
    ageRange: 'all',
    components: [
      {
        type: 'timer',
        position: { row: 0, col: 0 },
        size: { width: 'full', height: 'half' },
        priority: 1,
      },
      {
        type: 'current_task',
        position: { row: 1, col: 0 },
        size: { width: 'full', height: 'half' },
        priority: 2,
      },
    ],
    features: [
      'distraction-free',
      'large-timer',
      'single-task',
    ],
    theme: 'inherit',
    gridColumns: 1,
    gridGap: 16,
  },
}

/**
 * Get recommended layout for age
 */
export function getRecommendedLayout(age) {
  if (age < 6) return layoutTemplates.toddler_simple
  if (age < 10) return layoutTemplates.child_explorer
  return layoutTemplates.parent_command_center
}

/**
 * Get all layouts for age range
 */
export function getLayoutsForAge(age) {
  return Object.values(layoutTemplates).filter(layout => {
    if (layout.ageRange === 'all') return true
    if (layout.ageRange === '3-5' && age < 6) return true
    if (layout.ageRange === '6-9' && age >= 6 && age < 10) return true
    if (layout.ageRange === '18+' && age >= 10) return true
    return false
  })
}

export default layoutTemplates
