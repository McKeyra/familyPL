import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getTodayString, getYesterdayString } from '../lib/timezone'

// Initial data for the family
const initialChildren = {
  bria: {
    id: 'bria',
    name: 'Bria',
    age: 4,
    avatar: 'B',
    avatarType: 'letter', // 'letter', 'emoji', 'image'
    avatarImage: null, // Base64 or URL for custom image
    theme: 'bria',
    stars: 0,
    color: '#f97316',
  },
  naya: {
    id: 'naya',
    name: 'Naya',
    age: 8,
    avatar: 'N',
    avatarType: 'letter',
    avatarImage: null,
    theme: 'naya',
    stars: 0,
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

const initialEvents = []

const initialNotes = []

const initialHearts = []

const initialTimerSessions = []

const initialGroceryList = []

// Daily status tracking (sleep mask, on-time bonus, etc.)
const initialDailyStatus = {
  // Structure: { 'bria': { '2024-01-15': { sleepMask: false, backpackOnTime: false, backpackTime: null } } }
}

// Daily time limits for each child (in minutes)
const initialTimeLimits = {
  bria: {
    screen: { limit: 90, enabled: true },
    reading: { limit: 60, enabled: false },
    play: { limit: 120, enabled: false },
    homework: { limit: 60, enabled: false },
  },
  naya: {
    screen: { limit: 60, enabled: true },
    reading: { limit: 30, enabled: false },
    play: { limit: 120, enabled: false },
    homework: { limit: 30, enabled: false },
  },
}

// Sibling collaboration challenges
const initialChallenges = [
  {
    id: 'ch1',
    title: 'Kindness Week',
    description: 'Send 10 hearts to each other this week',
    emoji: '💕',
    target: 10,
    progress: { bria: 0, naya: 0 },
    reward: 'Family Movie Night',
    rewardStars: 20,
    active: false,
    startDate: null,
    endDate: null,
  },
  {
    id: 'ch2',
    title: 'Chore Champions',
    description: 'Complete 20 chores together',
    emoji: '🏆',
    target: 20,
    progress: { bria: 0, naya: 0 },
    reward: 'Ice Cream Party',
    rewardStars: 30,
    active: false,
    startDate: null,
    endDate: null,
  },
]

// Weekly streaks tracking
const initialStreaks = {
  bria: {
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    weeklyData: [], // Will store { date, tasksCompleted, starsEarned }
  },
  naya: {
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    weeklyData: [],
  },
}

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

      // New features
      timeLimits: initialTimeLimits,
      challenges: initialChallenges,
      streaks: initialStreaks,
      dailyTimeUsage: {}, // Track daily usage: { 'bria': { '2024-01-15': { screen: 45, reading: 30 } } }
      dailyStatus: initialDailyStatus, // Track daily status (sleep mask, on-time bonus)

      // Daily reset tracking
      lastResetDate: null,
      dailyLogs: [], // Historical logs: [{ date, bria: { morning: 3, bedtime: 5, chores: 2, starsEarned: 10 }, naya: {...} }]

      // Active timer state (persisted)
      activeTimer: null, // { childId, activity, duration, timeLeft, isRunning, sessionId, startedAt, pausedAt }

      // Pending timer configuration (parent sets, kid starts)
      pendingTimers: {}, // { childId: { activity, duration, setByParent: true } }

      // Actions - User Selection
      setCurrentChild: (childId) => set({ currentChild: childId, isParentMode: false }),
      setParentMode: (enabled) => set({ isParentMode: enabled, currentChild: enabled ? null : get().currentChild }),

      // Actions - Avatar Customization
      updateChildAvatar: (childId, avatarType, avatar, avatarImage = null) => {
        set((state) => ({
          children: {
            ...state.children,
            [childId]: {
              ...state.children[childId],
              avatarType,
              avatar,
              avatarImage,
            },
          },
        }))
      },

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

        // Update streak
        get().updateStreak(childId)

        // Update challenge progress for chores
        if (reason.startsWith('Completed:')) {
          get().updateChallengeProgress(childId, 'chore')
        }
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

      reorderChores: (childId, routineType, newOrder) => {
        set((state) => ({
          chores: {
            ...state.chores,
            [childId]: {
              ...state.chores[childId],
              [routineType]: newOrder,
            },
          },
        }))
      },

      updateChore: (childId, routineType, choreId, updates) => {
        set((state) => ({
          chores: {
            ...state.chores,
            [childId]: {
              ...state.chores[childId],
              [routineType]: state.chores[childId][routineType].map(c =>
                c.id === choreId ? { ...c, ...updates } : c
              ),
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

      // Actions - Notes (now supports voice notes)
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
        // Update challenge progress for hearts
        get().updateChallengeProgress(from, 'heart')
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
          // Update daily time usage
          get().addTimeUsage(session.childId, session.activity.toLowerCase().replace(' ', ''), session.duration)
        }
        // Clear active timer
        set({ activeTimer: null })
      },

      // Actions - Active Timer (persisted)
      setActiveTimer: (timerData) => {
        set({ activeTimer: timerData })
      },

      updateActiveTimerTime: (timeLeft) => {
        const activeTimer = get().activeTimer
        if (activeTimer) {
          set({ activeTimer: { ...activeTimer, timeLeft } })
        }
      },

      pauseActiveTimer: () => {
        const activeTimer = get().activeTimer
        if (activeTimer) {
          set({
            activeTimer: {
              ...activeTimer,
              isRunning: false,
              pausedAt: Date.now(),
            }
          })
        }
      },

      resumeActiveTimer: () => {
        const activeTimer = get().activeTimer
        if (activeTimer) {
          set({
            activeTimer: {
              ...activeTimer,
              isRunning: true,
              pausedAt: null,
            }
          })
        }
      },

      clearActiveTimer: () => {
        set({ activeTimer: null })
      },

      // Actions - Pending Timer (parent sets up, kid starts)
      setPendingTimer: (childId, activity, duration) => {
        set((state) => ({
          pendingTimers: {
            ...state.pendingTimers,
            [childId]: { activity, duration, setByParent: true, setAt: Date.now() },
          },
        }))
      },

      getPendingTimer: (childId) => {
        return get().pendingTimers[childId] || null
      },

      clearPendingTimer: (childId) => {
        set((state) => {
          const { [childId]: removed, ...rest } = state.pendingTimers
          return { pendingTimers: rest }
        })
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

      // Actions - Time Limits (Parent controlled)
      setTimeLimit: (childId, activity, limit, enabled) => {
        set((state) => ({
          timeLimits: {
            ...state.timeLimits,
            [childId]: {
              ...state.timeLimits[childId],
              [activity]: { limit, enabled },
            },
          },
        }))
      },

      getTimeLimit: (childId, activity) => {
        return get().timeLimits[childId]?.[activity] || { limit: 60, enabled: false }
      },

      // Actions - Daily Time Usage
      addTimeUsage: (childId, activity, minutes) => {
        const today = getTodayString()
        set((state) => {
          const childUsage = state.dailyTimeUsage[childId] || {}
          const todayUsage = childUsage[today] || {}
          return {
            dailyTimeUsage: {
              ...state.dailyTimeUsage,
              [childId]: {
                ...childUsage,
                [today]: {
                  ...todayUsage,
                  [activity]: (todayUsage[activity] || 0) + minutes,
                },
              },
            },
          }
        })
      },

      getTodayTimeUsage: (childId, activity) => {
        const today = getTodayString()
        return get().dailyTimeUsage[childId]?.[today]?.[activity] || 0
      },

      getRemainingTime: (childId, activity) => {
        const limit = get().getTimeLimit(childId, activity)
        if (!limit.enabled) return null // No limit
        const used = get().getTodayTimeUsage(childId, activity)
        return Math.max(0, limit.limit - used)
      },

      // Actions - Daily Status (sleep mask, backpack on-time)
      setDailyStatus: (childId, statusKey, value) => {
        const today = getTodayString()
        set((state) => {
          const childStatus = state.dailyStatus[childId] || {}
          const todayStatus = childStatus[today] || {}
          return {
            dailyStatus: {
              ...state.dailyStatus,
              [childId]: {
                ...childStatus,
                [today]: {
                  ...todayStatus,
                  [statusKey]: value,
                },
              },
            },
          }
        })
      },

      getDailyStatus: (childId, statusKey) => {
        const today = getTodayString()
        return get().dailyStatus[childId]?.[today]?.[statusKey] || false
      },

      setSleepMask: (childId, enabled) => {
        get().setDailyStatus(childId, 'sleepMask', enabled)
      },

      getSleepMask: (childId) => {
        return get().getDailyStatus(childId, 'sleepMask')
      },

      setBackpackOnTime: (childId) => {
        const now = new Date()
        const hours = now.getHours()
        const minutes = now.getMinutes()
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

        // Check if before 8:05 AM
        const isOnTime = hours < 8 || (hours === 8 && minutes < 5)

        get().setDailyStatus(childId, 'backpackTime', timeString)
        get().setDailyStatus(childId, 'backpackOnTime', isOnTime)

        return isOnTime
      },

      getBackpackStatus: (childId) => {
        const today = getTodayString()
        const status = get().dailyStatus[childId]?.[today] || {}
        return {
          time: status.backpackTime || null,
          onTime: status.backpackOnTime || false,
        }
      },

      // Actions - Streaks
      updateStreak: (childId) => {
        const today = getTodayString()
        const yesterday = getYesterdayString()

        set((state) => {
          const childStreak = state.streaks[childId]
          let newStreak = childStreak.currentStreak

          if (childStreak.lastCompletedDate === yesterday) {
            newStreak = childStreak.currentStreak + 1
          } else if (childStreak.lastCompletedDate !== today) {
            newStreak = 1
          }

          return {
            streaks: {
              ...state.streaks,
              [childId]: {
                ...childStreak,
                currentStreak: newStreak,
                longestStreak: Math.max(newStreak, childStreak.longestStreak),
                lastCompletedDate: today,
              },
            },
          }
        })
      },

      getWeeklyReport: (childId) => {
        const starLog = get().starLog.filter(log => log.childId === childId)
        const now = Date.now()
        const weekAgo = now - 7 * 86400000

        const weeklyLogs = starLog.filter(log => log.timestamp >= weekAgo && log.amount > 0)

        // Group by day
        const dailyData = {}
        weeklyLogs.forEach(log => {
          const date = new Date(log.timestamp).toISOString().split('T')[0]
          if (!dailyData[date]) {
            dailyData[date] = { tasks: 0, stars: 0 }
          }
          dailyData[date].tasks += 1
          dailyData[date].stars += log.amount
        })

        const totalTasks = weeklyLogs.length
        const totalStars = weeklyLogs.reduce((sum, log) => sum + log.amount, 0)
        const daysActive = Object.keys(dailyData).length

        return {
          totalTasks,
          totalStars,
          daysActive,
          dailyData,
          streak: get().streaks[childId],
        }
      },

      // Actions - Sibling Challenges
      updateChallengeProgress: (childId, type) => {
        set((state) => ({
          challenges: state.challenges.map(challenge => {
            if (!challenge.active) return challenge

            const shouldUpdate =
              (type === 'heart' && challenge.title === 'Kindness Week') ||
              (type === 'chore' && challenge.title === 'Chore Champions')

            if (!shouldUpdate) return challenge

            const newProgress = {
              ...challenge.progress,
              [childId]: (challenge.progress[childId] || 0) + 1,
            }

            return {
              ...challenge,
              progress: newProgress,
            }
          }),
        }))
      },

      addChallenge: (challenge) => {
        set((state) => ({
          challenges: [...state.challenges, { ...challenge, id: Date.now().toString() }],
        }))
      },

      removeChallenge: (challengeId) => {
        set((state) => ({
          challenges: state.challenges.filter(c => c.id !== challengeId),
        }))
      },

      toggleChallengeActive: (challengeId) => {
        set((state) => ({
          challenges: state.challenges.map(c =>
            c.id === challengeId ? { ...c, active: !c.active } : c
          ),
        }))
      },

      completeChallenge: (challengeId) => {
        const challenge = get().challenges.find(c => c.id === challengeId)
        if (challenge) {
          // Award stars to both children
          get().addStars('bria', challenge.rewardStars / 2, `Challenge completed: ${challenge.title}`)
          get().addStars('naya', challenge.rewardStars / 2, `Challenge completed: ${challenge.title}`)

          set((state) => ({
            challenges: state.challenges.map(c =>
              c.id === challengeId ? { ...c, active: false, completed: true } : c
            ),
          }))
        }
      },

      getChallengeProgress: (challengeId) => {
        const challenge = get().challenges.find(c => c.id === challengeId)
        if (!challenge) return null

        const total = (challenge.progress.bria || 0) + (challenge.progress.naya || 0)
        const percentage = Math.min(100, (total / challenge.target) * 100)
        const isComplete = total >= challenge.target

        return { total, percentage, isComplete, ...challenge }
      },

      // Utility - Get child's events
      getChildEvents: (childId) => {
        return get().events.filter(e => e.child === childId || e.child === 'both')
      },

      // Utility - Get today's events
      getTodayEvents: () => {
        const today = getTodayString()
        return get().events.filter(e => e.date === today)
      },

      // Daily Reset Functions
      checkAndResetDaily: () => {
        const today = getTodayString()
        const lastReset = get().lastResetDate

        // If already reset today, skip
        if (lastReset === today) {
          return false
        }

        // Log yesterday's progress before resetting
        if (lastReset) {
          get().logDailyProgress(lastReset)
        }

        // Reset all chores for all children
        const chores = get().chores
        const resetChores = {}

        Object.keys(chores).forEach(childId => {
          resetChores[childId] = {}
          Object.keys(chores[childId]).forEach(routineType => {
            resetChores[childId][routineType] = chores[childId][routineType].map(chore => ({
              ...chore,
              completed: false,
            }))
          })
        })

        // Clear daily time usage for new day
        set({
          chores: resetChores,
          lastResetDate: today,
        })

        return true // Indicates reset occurred
      },

      logDailyProgress: (date) => {
        const chores = get().chores
        const starLog = get().starLog

        // Calculate completed tasks for each child on the given date
        const dayStart = new Date(date).getTime()
        const dayEnd = dayStart + 86400000

        const dayLogs = starLog.filter(log =>
          log.timestamp >= dayStart && log.timestamp < dayEnd && log.amount > 0
        )

        const logEntry = {
          date,
          timestamp: Date.now(),
        }

        // Count completed tasks per child (before reset)
        Object.keys(chores).forEach(childId => {
          const childDayLogs = dayLogs.filter(log => log.childId === childId)
          const starsEarned = childDayLogs.reduce((sum, log) => sum + log.amount, 0)

          // Count completed tasks by routine type
          let morningCount = 0
          let bedtimeCount = 0
          let choresCount = 0

          Object.keys(chores[childId]).forEach(routineType => {
            const completed = chores[childId][routineType].filter(c => c.completed).length
            if (routineType === 'morning') morningCount = completed
            else if (routineType === 'bedtime') bedtimeCount = completed
            else if (routineType === 'chores') choresCount = completed
          })

          logEntry[childId] = {
            morning: morningCount,
            bedtime: bedtimeCount,
            chores: choresCount,
            starsEarned,
            tasksCompleted: morningCount + bedtimeCount + choresCount,
          }
        })

        set((state) => ({
          dailyLogs: [logEntry, ...state.dailyLogs].slice(0, 90), // Keep last 90 days
        }))
      },

      getDailyLog: (date) => {
        return get().dailyLogs.find(log => log.date === date) || null
      },

      getWeeklyLogs: () => {
        const logs = get().dailyLogs
        const date = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Toronto' }))
        date.setDate(date.getDate() - 7)
        const weekAgo = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        return logs.filter(log => log.date >= weekAgo)
      },

      getMonthlyLogs: () => {
        const logs = get().dailyLogs
        const date = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Toronto' }))
        date.setDate(date.getDate() - 30)
        const monthAgo = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        return logs.filter(log => log.date >= monthAgo)
      },

      // Reset all data to initial state
      resetAllData: () => {
        set({
          currentChild: null,
          isParentMode: false,
          children: initialChildren,
          chores: initialChores,
          events: initialEvents,
          notes: initialNotes,
          hearts: initialHearts,
          timerSessions: initialTimerSessions,
          groceryList: initialGroceryList,
          starLog: [],
          timeLimits: initialTimeLimits,
          challenges: initialChallenges,
          streaks: initialStreaks,
          dailyTimeUsage: {},
          lastResetDate: null,
          dailyLogs: [],
          activeTimer: null,
        })
      },
    }),
    {
      name: 'happy-day-helper-storage',
    }
  )
)

export default useStore
