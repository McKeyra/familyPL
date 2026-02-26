/**
 * Centralized Activity Configuration
 * Used by Timer, FloatingTimer, and ParentPortal
 */
import { Tv, BookOpen, Gamepad2, Pencil } from 'lucide-react'

export const activities = [
  {
    id: 'screen',
    label: 'Screen Time',
    emoji: '📺',
    icon: Tv,
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-600',
    gradientFrom: 'from-blue-400',
    gradientTo: 'to-blue-600',
  },
  {
    id: 'reading',
    label: 'Reading',
    emoji: '📚',
    icon: BookOpen,
    color: 'amber',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-600',
    gradientFrom: 'from-amber-400',
    gradientTo: 'to-amber-600',
  },
  {
    id: 'play',
    label: 'Play Time',
    emoji: '🎮',
    icon: Gamepad2,
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-600',
    gradientFrom: 'from-green-400',
    gradientTo: 'to-green-600',
  },
  {
    id: 'homework',
    label: 'Homework',
    emoji: '✏️',
    icon: Pencil,
    color: 'purple',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-600',
    gradientFrom: 'from-purple-400',
    gradientTo: 'to-purple-600',
  },
]

// Helper to get activity by ID
export const getActivity = (id) => activities.find(a => a.id === id)

// Helper to get activity icon component
export const getActivityIcon = (id) => {
  const activity = getActivity(id)
  return activity?.icon || null
}

// Duration presets for parent timer setup
export const durationPresets = [
  { value: 15, label: '15 min', description: 'Quick' },
  { value: 30, label: '30 min', description: 'Short' },
  { value: 45, label: '45 min', description: 'Medium' },
  { value: 60, label: '60 min', description: 'Long' },
]
