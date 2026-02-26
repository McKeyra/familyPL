/**
 * Event Categories for Calendar - Simplified
 */

export const eventCategories = {
  school: {
    id: 'school',
    name: 'School',
    icon: '🏫',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  sports: {
    id: 'sports',
    name: 'Sports',
    icon: '⚽',
    color: 'bg-green-50 text-green-700 border-green-200',
  },
  doctor: {
    id: 'doctor',
    name: 'Health',
    icon: '🏥',
    color: 'bg-red-50 text-red-700 border-red-200',
  },
  birthday: {
    id: 'birthday',
    name: 'Birthday',
    icon: '🎂',
    color: 'bg-pink-50 text-pink-700 border-pink-200',
  },
  family: {
    id: 'family',
    name: 'Family',
    icon: '👨‍👩‍👧',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  playdate: {
    id: 'playdate',
    name: 'Playdate',
    icon: '🧸',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  activity: {
    id: 'activity',
    name: 'Activity',
    icon: '🎨',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  other: {
    id: 'other',
    name: 'Other',
    icon: '📅',
    color: 'bg-slate-50 text-slate-700 border-slate-200',
  },
}

export const eventCategoryList = Object.values(eventCategories)
