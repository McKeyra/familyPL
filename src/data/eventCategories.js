/**
 * Event Categories for Calendar
 */

export const eventCategories = {
  school: {
    id: 'school',
    name: 'School',
    icon: '🏫',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    bgColor: 'bg-blue-500',
  },
  work: {
    id: 'work',
    name: 'Work',
    icon: '💼',
    color: 'bg-slate-100 text-slate-700 border-slate-300',
    bgColor: 'bg-slate-500',
  },
  doctor: {
    id: 'doctor',
    name: 'Doctor',
    icon: '🏥',
    color: 'bg-red-100 text-red-700 border-red-300',
    bgColor: 'bg-red-500',
  },
  dentist: {
    id: 'dentist',
    name: 'Dentist',
    icon: '🦷',
    color: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    bgColor: 'bg-cyan-500',
  },
  sports: {
    id: 'sports',
    name: 'Sports',
    icon: '⚽',
    color: 'bg-green-100 text-green-700 border-green-300',
    bgColor: 'bg-green-500',
  },
  birthday: {
    id: 'birthday',
    name: 'Birthday',
    icon: '🎂',
    color: 'bg-pink-100 text-pink-700 border-pink-300',
    bgColor: 'bg-pink-500',
  },
  holiday: {
    id: 'holiday',
    name: 'Holiday',
    icon: '🎉',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    bgColor: 'bg-purple-500',
  },
  family: {
    id: 'family',
    name: 'Family',
    icon: '👨‍👩‍👧‍👦',
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    bgColor: 'bg-amber-500',
  },
  appointment: {
    id: 'appointment',
    name: 'Appointment',
    icon: '📅',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    bgColor: 'bg-indigo-500',
  },
  activity: {
    id: 'activity',
    name: 'Activity',
    icon: '🎨',
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    bgColor: 'bg-orange-500',
  },
  playdate: {
    id: 'playdate',
    name: 'Playdate',
    icon: '🧸',
    color: 'bg-rose-100 text-rose-700 border-rose-300',
    bgColor: 'bg-rose-500',
  },
  travel: {
    id: 'travel',
    name: 'Travel',
    icon: '✈️',
    color: 'bg-sky-100 text-sky-700 border-sky-300',
    bgColor: 'bg-sky-500',
  },
  other: {
    id: 'other',
    name: 'Other',
    icon: '📌',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    bgColor: 'bg-gray-500',
  },
}

export const eventCategoryList = Object.values(eventCategories)
