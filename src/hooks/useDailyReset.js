import { useEffect, useRef } from 'react'
import useStore from '../store/useStore'

export default function useDailyReset() {
  const checkAndResetDaily = useStore((state) => state.checkAndResetDaily)
  const hasChecked = useRef(false)

  useEffect(() => {
    // Only check once per app session
    if (hasChecked.current) return
    hasChecked.current = true

    // Check if we need to reset (new day)
    const didReset = checkAndResetDaily()

    if (didReset) {
      console.log('[Daily Reset] New day detected - chores reset and progress logged')
    }

    // Also set up an interval to check every minute
    // This handles cases where the app is left open overnight
    const interval = setInterval(() => {
      checkAndResetDaily()
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [checkAndResetDaily])
}
