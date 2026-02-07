/**
 * Network Status Hook
 * Tracks online/offline status and provides sync utilities
 */

import { useState, useEffect, useCallback } from 'react'

export default function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      console.log('[Network] Back online')
      setIsOnline(true)
      if (!navigator.onLine) return
      setWasOffline(true)
      // Clear the "was offline" flag after a short delay
      setTimeout(() => setWasOffline(false), 3000)
    }

    const handleOffline = () => {
      console.log('[Network] Gone offline')
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Helper to check if we can make network requests
  const canSync = useCallback(() => {
    return isOnline && navigator.onLine
  }, [isOnline])

  return {
    isOnline,
    wasOffline,
    canSync,
  }
}

/**
 * Check if currently online (static helper)
 */
export function checkOnline() {
  return typeof navigator !== 'undefined' && navigator.onLine
}
