import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Initial data for the family
const initialChildren = {
  bria: {
    id: 'bria',
    name: 'Bria',
    age: 8,
    avatar: '👧',
    theme: 'bria',
    stars: 47,
    color: '#f97316',
  },
  naya: {
    id: 'naya',
    name: 'Naya',
    age: 4,
    avatar: '👶',
    theme: 'naya',
    stars: 32,
    color: '#06b6d4',
  },
}

const initialChores = {
  bria: {
    morning: [
      { id: 'm1', text: 'Make bed', emoji: '🛏️', completed: false, stars: 1 },
      { id: 'm2', text: 'Brush teeth', emoji: '🦷', completed: false, stars: 1 },
      { id: 'm3', text: 'Get dressed', emoji: '👗', completed: false, stars: 1 },
      { id: 'm4', text: 'Eat breakfast', emoji: '🥣', completed: false, stars: 1 },
      { id: 'm5', text: 'Pack backpack', emoji: '🎒', completed: false, stars: 2 },
    ],
    bedtime: [
      { id: 'b1', text: 'Take a bath', emoji: '🛁', completed: false, stars: 1 },
      { id: 'b2', text: 'Put on PJs', emoji: '👚', completed: false, stars: 1 },
      { id: 'b3', text: 'Brush teeth', emoji: '🦷', completed: false, stars: 1 },
      { id: 'b4', text: 'Read a book', emoji: '📚', completed: false, stars: 2 },
      { id: 'b5', text: 'Say goodnight', emoji: '🌙', completed: false, stars: 1 },
    ],
    chores: [
      { id: 'c1', text: 'Clean room', emoji: '🧹', completed: false, stars: 3 },
      { id: 'c2', text: 'Help with dishes', emoji: '🍽️', completed: false, stars: 2 },
      { id: 'c3', text: 'Feed the pet', emoji: '🐕', completed: false, stars: 2 },
      { id: 'c4', text: 'Homework', emoji: '✏️', completed: false, stars: 3 },
    ],
  },
  naya: {
    morning: [
      { id: 'm1', text: 'Wake up happy', emoji: '☀️', completed: false, stars: 1 },
      { id: 'm2', text: 'Brush teeth', emoji: '🦷', completed: false, stars: 1 },
      { id: 'm3', text: 'Get dressed', emoji: '👗', completed: false, stars: 1 },
      { id: 'm4', text: 'Eat breakfast', emoji: '🥣', completed: false, stars: 1 },
    ],
    bedtime: [
      { id: 'b1', text: 'Bath time', emoji: '🛁', completed: false, stars: 1 },
      { id: 'b2', text: 'Put on PJs', emoji: '👚', completed: false, stars: 1 },
      { id: 'b3', text: 'Brush teeth', emoji: '🦷', completed: false, stars: 1 },
      { id: 'b4', text: 'Story time', emoji: '📖', completed: false, stars: 2 },
      { id: 'b5', text: 'Hugs & kisses', emoji: '💜', completed: false, stars: 1 },
    ],
    chores: [
      { id: 'c1', text: 'Pick up toys', emoji: '🧸', completed: false, stars: 2 },
      { id: 'c2', text: 'Help set table', emoji: '🍽️', completed: false, stars: 2 },
    ],
  },
}

const initialEvents = [
  {
    id: 'e1',
    title: 'Soccer Practice',
    emoji: '⚽',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    child: 'bria',
    sticker: 'soccer',
    notes: 'Bring jersey and cleats!',
  },
  {
    id: 'e2',
    title: 'Dance Class',
    emoji: '💃',
    date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    child: 'naya',
    sticker: 'dance',
    notes: 'Wear ballet shoes',
  },
  {
    id: 'e3',
    title: 'Birthday Party',
    emoji: '🎂',
    date: new Date(Date.now() + 432000000).toISOString().split('T')[0],
    child: 'both',
    sticker: 'birthday',
    notes: "Emma's party at 3pm",
  },
]

const initialNotes = [
  {
    id: 'n1',
    type: 'text',
    content: 'I love you Mom & Dad! 💕',
    author: 'bria',
    color: '#f97316',
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'n2',
    type: 'drawing',
    content: 'A happy sun',
    author: 'naya',
    color: '#06b6d4',
    createdAt: Date.now() - 43200000,
  },
]

const initialHearts = [
  { id: 'h1', from: 'bria', to: 'naya', timestamp: Date.now() - 3600000 },
  { id: 'h2', from: 'naya', to: 'bria', timestamp: Date.now() - 7200000 },
]

const initialTimerSessions = []

const initialGroceryList = [
  { id: 'g1', item: 'Milk', emoji: '🥛', addedBy: 'parent', completed: false },
  { id: 'g2', item: 'Cereal', emoji: '🥣', addedBy: 'bria', completed: false },
  { id: 'g3', item: 'Apples', emoji: '🍎', addedBy: 'naya', completed: false },
]

const useStore = create(
  persist(
    (set, get) => ({
      // Current user state
      currentChild: null,
      isParentMode: false,

      // Data
      children: initialChildren,
      chores: initialChores,
      events: initialEvents,
      notes: initialNotes,
      hearts: initialHearts,
      timerSessions: initialTimerSessions,
      groceryList: initialGroceryList,
      starLog: [],

      // Actions - User Selection
      setCurrentChild: (childId) => set({ currentChild: childId, isParentMode: false }),
      setParentMode: (enabled) => set({ isParentMode: enabled, currentChild: enabled ? null : get().currentChild }),

      // Actions - Stars
      addStars: (childId, amount, reason) => {
        const logEntry = {
          id: Date.now().toString(),
          childId,
          amount,
          reason,
          timestamp: Date.now(),
        }
        set((state) => ({
          children: {
            ...state.children,
            [childId]: {
              ...state.children[childId],
              stars: state.children[childId].stars + amount,
            },
          },
          starLog: [logEntry, ...state.starLog],
        }))
      },

      spendStars: (childId, amount, reward) => {
        const current = get().children[childId].stars
        if (current >= amount) {
          set((state) => ({
            children: {
              ...state.children,
              [childId]: {
                ...state.children[childId],
                stars: state.children[childId].stars - amount,
              },
            },
            starLog: [{
              id: Date.now().toString(),
              childId,
              amount: -amount,
              reason: `Redeemed: ${reward}`,
              timestamp: Date.now(),
            }, ...state.starLog],
          }))
          return true
        }
        return false
      },

      // Actions - Chores
      completeChore: (childId, routineType, choreId) => {
        const chore = get().chores[childId][routineType].find(c => c.id === choreId)
        if (chore && !chore.completed) {
          set((state) => ({
            chores: {
              ...state.chores,
              [childId]: {
                ...state.chores[childId],
                [routineType]: state.chores[childId][routineType].map(c =>
                  c.id === choreId ? { ...c, completed: true } : c
                ),
              },
            },
          }))
          get().addStars(childId, chore.stars, `Completed: ${chore.text}`)
          return chore.stars
        }
        return 0
      },

      resetRoutine: (childId, routineType) => {
        set((state) => ({
          chores: {
            ...state.chores,
            [childId]: {
              ...state.chores[childId],
              [routineType]: state.chores[childId][routineType].map(c => ({
                ...c,
                completed: false,
              })),
            },
          },
        }))
      },

      addChore: (childId, routineType, chore) => {
        set((state) => ({
          chores: {
            ...state.chores,
            [childId]: {
              ...state.chores[childId],
              [routineType]: [...state.chores[childId][routineType], chore],
            },
          },
        }))
      },

      removeChore: (childId, routineType, choreId) => {
        set((state) => ({
          chores: {
            ...state.chores,
            [childId]: {
              ...state.chores[childId],
              [routineType]: state.chores[childId][routineType].filter(c => c.id !== choreId),
            },
          },
        }))
      },

      // Actions - Events
      addEvent: (event) => {
        set((state) => ({
          events: [...state.events, { ...event, id: Date.now().toString() }],
        }))
      },

      removeEvent: (eventId) => {
        set((state) => ({
          events: state.events.filter(e => e.id !== eventId),
        }))
      },

      // Actions - Notes
      addNote: (note) => {
        set((state) => ({
          notes: [{ ...note, id: Date.now().toString(), createdAt: Date.now() }, ...state.notes],
        }))
      },

      removeNote: (noteId) => {
        set((state) => ({
          notes: state.notes.filter(n => n.id !== noteId),
        }))
      },

      // Actions - Hearts (Kindness Echo)
      sendHeart: (from, to) => {
        set((state) => ({
          hearts: [{ id: Date.now().toString(), from, to, timestamp: Date.now() }, ...state.hearts],
        }))
      },

      // Actions - Timer
      startTimer: (childId, activity, duration) => {
        const session = {
          id: Date.now().toString(),
          childId,
          activity,
          duration,
          startTime: Date.now(),
          completed: false,
        }
        set((state) => ({
          timerSessions: [session, ...state.timerSessions],
        }))
        return session.id
      },

      completeTimer: (sessionId, starsEarned) => {
        const session = get().timerSessions.find(s => s.id === sessionId)
        if (session) {
          set((state) => ({
            timerSessions: state.timerSessions.map(s =>
              s.id === sessionId ? { ...s, completed: true, endTime: Date.now() } : s
            ),
          }))
          if (starsEarned > 0) {
            get().addStars(session.childId, starsEarned, `Timer completed: ${session.activity}`)
          }
        }
      },

      // Actions - Grocery
      addGroceryItem: (item, addedBy) => {
        set((state) => ({
          groceryList: [...state.groceryList, {
            id: Date.now().toString(),
            item: item.item,
            emoji: item.emoji || '🛒',
            addedBy,
            completed: false,
          }],
        }))
      },

      toggleGroceryItem: (itemId) => {
        set((state) => ({
          groceryList: state.groceryList.map(i =>
            i.id === itemId ? { ...i, completed: !i.completed } : i
          ),
        }))
      },

      removeGroceryItem: (itemId) => {
        set((state) => ({
          groceryList: state.groceryList.filter(i => i.id !== itemId),
        }))
      },

      // Utility - Get child's events
      getChildEvents: (childId) => {
        return get().events.filter(e => e.child === childId || e.child === 'both')
      },

      // Utility - Get today's events
      getTodayEvents: () => {
        const today = new Date().toISOString().split('T')[0]
        return get().events.filter(e => e.date === today)
      },
    }),
    {
      name: 'happy-day-helper-storage',
    }
  )
)

export default useStore
