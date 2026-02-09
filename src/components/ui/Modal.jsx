import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

/**
 * Reusable Modal component with:
 * - Proper centering on mobile/tablet/desktop
 * - Keyboard awareness (adjusts when virtual keyboard opens)
 * - Scrollable content when needed
 * - Touch-friendly close button
 * - Backdrop click to close
 */
export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  className = '',
}) {
  const modalRef = useRef(null)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight)

  // Handle viewport resize (keyboard open/close)
  useEffect(() => {
    if (!isOpen) return

    const handleResize = () => {
      // Detect virtual keyboard by comparing window heights
      const currentHeight = window.visualViewport?.height || window.innerHeight
      const fullHeight = window.screen.height

      // If viewport is significantly smaller, keyboard is likely open
      const possibleKeyboardHeight = fullHeight - currentHeight

      if (possibleKeyboardHeight > 150) {
        setKeyboardHeight(possibleKeyboardHeight)
      } else {
        setKeyboardHeight(0)
      }

      setViewportHeight(currentHeight)
    }

    // Use visualViewport API if available (better for mobile keyboards)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      window.visualViewport.addEventListener('scroll', handleResize)
    } else {
      window.addEventListener('resize', handleResize)
    }

    // Initial check
    handleResize()

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
        window.visualViewport.removeEventListener('scroll', handleResize)
      } else {
        window.removeEventListener('resize', handleResize)
      }
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Focus trap - scroll active input into view
  useEffect(() => {
    if (!isOpen) return

    const handleFocus = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        // Wait for keyboard to appear, then scroll input into view
        setTimeout(() => {
          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 300)
      }
    }

    document.addEventListener('focusin', handleFocus)
    return () => document.removeEventListener('focusin', handleFocus)
  }, [isOpen])

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            // Adjust for keyboard on mobile
            height: keyboardHeight > 0 ? `${viewportHeight}px` : '100%',
            paddingBottom: keyboardHeight > 0 ? '0' : 'env(safe-area-inset-bottom)',
          }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          {/* Modal Container - handles scrolling and centering */}
          <div
            className="relative z-10 w-full h-full flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
            style={{
              // Ensure we can scroll when keyboard is open
              maxHeight: keyboardHeight > 0 ? `${viewportHeight}px` : '100%',
            }}
          >
            {/* Modal Content */}
            <motion.div
              ref={modalRef}
              className={`
                bg-white rounded-2xl sm:rounded-3xl shadow-2xl
                w-full ${sizeClasses[size]}
                max-h-[90vh] overflow-hidden
                flex flex-col
                ${className}
              `}
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with close button */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 shrink-0">
                  {title && (
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-800">
                      {title}
                    </h2>
                  )}
                  {showCloseButton && (
                    <motion.button
                      className="p-2 sm:p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ml-auto"
                      onClick={onClose}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Close modal"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </motion.button>
                  )}
                </div>
              )}

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 overscroll-contain">
                {children}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Simple modal overlay for celebration/notification modals
 * that don't need the full modal structure
 */
export function ModalOverlay({
  isOpen,
  onClose,
  children,
  closeOnBackdrop = true,
  className = '',
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          {/* Content */}
          <div className="relative z-10" onClick={(e) => e.stopPropagation()}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
