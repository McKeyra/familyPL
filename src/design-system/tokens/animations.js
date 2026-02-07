/**
 * UR1IFE Design System - Animation Tokens
 */

// Spring configs for Framer Motion
export const springs = {
  gentle: { type: 'spring', stiffness: 200, damping: 25 },
  bouncy: { type: 'spring', stiffness: 400, damping: 20 },
  snappy: { type: 'spring', stiffness: 500, damping: 30 },
  slow: { type: 'spring', stiffness: 100, damping: 20 },
}

// Animation variants by theme type
export const animationVariants = {
  none: {
    hover: {},
    tap: {},
  },
  subtle: {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  },
  playful: {
    hover: { scale: 1.05, rotate: -1 },
    tap: { scale: 0.95, rotate: 1 },
  },
}

// Page transition variants
export const pageTransitions = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

// Card animations
export const cardAnimations = {
  subtle: {
    whileHover: { scale: 1.01 },
    whileTap: { scale: 0.99 },
  },
  playful: {
    whileHover: { y: -4, scale: 1.02 },
    whileTap: { scale: 0.98 },
  },
}

// Celebration animations
export const celebrationAnimations = {
  starBurst: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.5, opacity: 0 },
  },
  confetti: {
    initial: { y: -100, opacity: 1 },
    animate: { y: 500, opacity: 0 },
  },
}

export default {
  springs,
  animationVariants,
  pageTransitions,
  cardAnimations,
  celebrationAnimations,
}
