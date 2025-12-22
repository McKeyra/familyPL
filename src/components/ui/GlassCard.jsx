import { motion } from 'framer-motion'

const variants = {
  default: 'bg-white/25 backdrop-blur-xl border border-white/20',
  dark: 'bg-black/15 backdrop-blur-xl border border-white/10',
  solid: 'bg-white backdrop-blur-none border border-gray-100',
  bria: 'bg-gradient-to-br from-bria-400/30 to-bria-600/20 backdrop-blur-xl border border-bria-300/30',
  naya: 'bg-gradient-to-br from-naya-400/30 to-naya-600/20 backdrop-blur-xl border border-naya-300/30',
  parent: 'bg-gradient-to-br from-parent-400/30 to-parent-600/20 backdrop-blur-xl border border-parent-300/30',
}

const glowVariants = {
  bria: 'shadow-glow-bria',
  naya: 'shadow-glow-naya',
  parent: 'shadow-glow-parent',
  none: '',
}

const sizes = {
  sm: 'p-3 rounded-xl',
  md: 'p-5 rounded-2xl',
  lg: 'p-6 rounded-3xl',
  xl: 'p-8 rounded-3xl',
}

export default function GlassCard({
  children,
  variant = 'default',
  glow = 'none',
  size = 'md',
  className = '',
  hover = true,
  onClick,
  as = 'div',
  layoutId,
  ...props
}) {
  const Component = motion[as] || motion.div

  return (
    <Component
      layoutId={layoutId}
      className={`
        ${variants[variant]}
        ${glowVariants[glow]}
        ${sizes[size]}
        ${hover ? 'transition-all duration-300' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      whileHover={hover && onClick ? {
        scale: 1.02,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
      } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      {...props}
    >
      {children}
    </Component>
  )
}
