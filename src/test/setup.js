/**
 * Vitest Setup
 * Mocks for localStorage and Supabase
 */

import { vi, beforeEach } from 'vitest'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => {
      store[key] = value?.toString()
    }),
    removeItem: vi.fn((key) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index) => Object.keys(store)[index] ?? null),
    // For testing: get current store state
    __getStore: () => store,
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
})

// Reset localStorage before each test
beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockResolvedValue({ data: [], error: null }),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
    })),
  },
  subscribeToDailyStars: vi.fn(() => ({ unsubscribe: vi.fn() })),
}))

// Mock timezone functions
vi.mock('../lib/timezone', () => ({
  getTodayString: vi.fn(() => '2024-01-15'),
  formatDateString: vi.fn((date) => {
    const d = new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }),
  getTorontoDate: vi.fn(() => new Date('2024-01-15T12:00:00')),
}))
