import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl',
  bria: 'bg-gradient-to-r from-bria-400 to-bria-600 text-white shadow-lg hover:shadow-glow-bria',
  naya: 'bg-gradient-to-r from-naya-400 to-naya-600 text-white shadow-lg hover:shadow-glow-naya',
  parent: 'bg-gradient-to-r from-parent-400 to-parent-600 text-white shadow-lg hover:shadow-glow-parent',
  glass: 'bg-white/25 backdrop-blur-xl border border-white/20 text-gray-800 hover:bg-white/40',
  ghost: 'bg-transparent hover:bg-white/10 text-gray-700',
  danger: 'bg-gradient-to-r from-red-400 to-red-600 text-white shadow-lg',
  success: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg',
  // Clean variants - no gradients, solid colors with subtle styling
  clean: 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm',
  'clean-primary': 'bg-white border-2 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 shadow-sm',
  'clean-bria': 'bg-white border-2 border-bria-300 text-bria-600 hover:bg-bria-50 hover:border-bria-400 shadow-sm',
  'clean-naya': 'bg-white border-2 border-naya-300 text-naya-600 hover:bg-naya-50 hover:border-naya-400 shadow-sm',
  'clean-parent': 'bg-white border-2 border-parent-300 text-parent-600 hover:bg-parent-50 hover:border-parent-400 shadow-sm',
  // Outline variants - transparent background with colored border
  outline: 'bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-100',
  'outline-primary': 'bg-transparent border-2 border-purple-400 text-purple-600 hover:bg-purple-50',
  'outline-bria': 'bg-transparent border-2 border-bria-400 text-bria-600 hover:bg-bria-50',
  'outline-naya': 'bg-transparent border-2 border-naya-400 text-naya-600 hover:bg-naya-50',
  'outline-danger': 'bg-transparent border-2 border-red-400 text-red-600 hover:bg-red-50',
  // Solid variants - flat colors without gradients
  'solid-bria': 'bg-bria-500 text-white hover:bg-bria-600 shadow-md',
  'solid-naya': 'bg-naya-500 text-white hover:bg-naya-600 shadow-md',
  'solid-parent': 'bg-parent-500 text-white hover:bg-parent-600 shadow-md',
}

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-lg min-h-[36px] min-w-[36px]',
  md: 'px-5 py-3 text-base rounded-xl min-h-[44px] min-w-[44px]',
  lg: 'px-8 py-4 text-lg rounded-2xl min-h-[52px] min-w-[52px]',
  xl: 'px-10 py-5 text-xl rounded-2xl min-h-[60px] min-w-[60px]',
  icon: 'p-3 rounded-full min-h-[44px] min-w-[44px]',
  'icon-lg': 'p-5 rounded-full min-h-[56px] min-w-[56px]',
  'icon-sm': 'p-2 rounded-full min-h-[36px] min-w-[36px]',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  ...props
}) {
  return (
    <motion.button
      type={type}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        font-display font-semibold
        inline-flex items-center justify-center gap-2
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        no-select
        ${className}
      `}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      {...props}
    >
      {loading ? (
        <motion.div
          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="text-xl">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="text-xl">{icon}</span>}
        </>
      )}
    </motion.button>
  )
}
