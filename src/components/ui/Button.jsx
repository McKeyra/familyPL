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
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-base rounded-xl',
  lg: 'px-8 py-4 text-lg rounded-2xl',
  xl: 'px-10 py-5 text-xl rounded-2xl',
  icon: 'p-3 rounded-full',
  'icon-lg': 'p-5 rounded-full',
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
