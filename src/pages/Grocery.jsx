import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'
import {
  Plus,
  Check,
  X,
  ShoppingCart,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import useStore from '../store/useStore'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import {
  groceryCategories,
  groceryItems,
  searchGroceryItems,
  getPopularItems,
} from '../data/groceryData'

export default function Grocery() {
  const { currentChild, children, groceryList, addGroceryItem, toggleGroceryItem, removeGroceryItem, isParentMode } = useStore()
  const child = currentChild ? children[currentChild] : null

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showCategories, setShowCategories] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [customItem, setCustomItem] = useState('')
  const [customEmoji, setCustomEmoji] = useState('🛒')

  // Get theme colors
  const themeColors = {
    bria: {
      accent: 'bg-rose-500',
      light: 'bg-rose-100',
      text: 'text-rose-600',
      border: 'border-rose-300',
      gradient: 'from-rose-400 to-pink-500',
    },
    naya: {
      accent: 'bg-sky-500',
      light: 'bg-sky-100',
      text: 'text-sky-600',
      border: 'border-sky-300',
      gradient: 'from-sky-400 to-cyan-500',
    },
    parent: {
      accent: 'bg-stone-600',
      light: 'bg-stone-100',
      text: 'text-stone-600',
      border: 'border-stone-300',
      gradient: 'from-stone-500 to-amber-600',
    },
  }

  const theme = isParentMode ? 'parent' : (child?.theme || 'bria')
  const colors = themeColors[theme]

  // Search results
  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return []
    return searchGroceryItems(searchQuery)
  }, [searchQuery])

  // Popular items for quick add
  const popularItems = useMemo(() => getPopularItems(), [])

  // Category items
  const categoryItems = useMemo(() => {
    if (!selectedCategory) return []
    return groceryItems.filter(item => item.category === selectedCategory)
  }, [selectedCategory])

  const handleAddItem = (item) => {
    addGroceryItem(item, currentChild)
    setSearchQuery('')
  }

  const handleAddCustom = () => {
    if (!customItem.trim()) return
    addGroceryItem({ item: customItem, emoji: customEmoji }, currentChild)
    setCustomItem('')
    setCustomEmoji('🛒')
    setShowAddModal(false)
  }

  const uncheckedItems = groceryList.filter((i) => !i.completed)
  const checkedItems = groceryList.filter((i) => i.completed)

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-4 sm:mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <ShoppingCart className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2 ${colors.text}`} strokeWidth={1.5} />
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-800">
          Shopping List
        </h1>
        <p className="text-gray-500 font-display text-sm sm:text-base">
          {uncheckedItems.length} items to buy
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-gray-400 focus:outline-none font-display bg-white/80 backdrop-blur"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Results */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              className="mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-h-64 overflow-y-auto"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {searchResults.map((item, index) => (
                <button
                  key={`${item.item}-${index}`}
                  onClick={() => handleAddItem(item)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                >
                  <span className="text-xl">{item.emoji}</span>
                  <span className="font-display text-gray-700 flex-1 text-left">{item.item}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${groceryCategories[item.category]?.color || 'bg-gray-100'}`}>
                    {groceryCategories[item.category]?.name || item.category}
                  </span>
                  <Plus className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Category Browser */}
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <button
          onClick={() => setShowCategories(!showCategories)}
          className="w-full flex items-center justify-between p-3 bg-white/60 rounded-xl border border-gray-200"
        >
          <span className="font-display font-semibold text-gray-700">Browse by Category</span>
          {showCategories ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        <AnimatePresence>
          {showCategories && (
            <motion.div
              className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {Object.entries(groceryCategories).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                  className={`
                    p-3 rounded-xl flex flex-col items-center gap-1 transition-all
                    ${selectedCategory === key
                      ? `${colors.light} ${colors.border} border-2`
                      : 'bg-white/60 border border-gray-200 hover:bg-white'}
                  `}
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="text-xs font-display text-gray-600">{category.name}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Items */}
        <AnimatePresence>
          {selectedCategory && categoryItems.length > 0 && (
            <motion.div
              className="mt-3 bg-white rounded-xl p-3 border border-gray-200"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-gray-700">
                  {groceryCategories[selectedCategory]?.name}
                </h3>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {categoryItems.map((item, index) => (
                  <button
                    key={`${item.item}-${index}`}
                    onClick={() => handleAddItem(item)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-lg">{item.emoji}</span>
                    <span className="font-display text-sm text-gray-700">{item.item}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick Add - Popular Items */}
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="font-display font-semibold text-gray-600 mb-2 text-sm">
          Quick Add
        </h2>
        <div className="flex flex-wrap gap-2">
          {popularItems.slice(0, 8).map((item, index) => (
            <motion.button
              key={item.item}
              className="bg-white/70 backdrop-blur px-3 py-2 rounded-full flex items-center gap-2 shadow-sm hover:shadow-md transition-all border border-gray-100"
              onClick={() => handleAddItem(item)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.02 * index }}
            >
              <span className="text-lg">{item.emoji}</span>
              <span className="font-display text-gray-700 text-sm">{item.item}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Add Custom Button */}
      <motion.div
        className="flex justify-center mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <Button
          variant="glass"
          icon={<Plus className="w-5 h-5" strokeWidth={1.5} />}
          onClick={() => setShowAddModal(true)}
        >
          Add Custom Item
        </Button>
      </motion.div>

      {/* Shopping List - Need to Buy */}
      <GlassCard variant="default" className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className={`w-5 h-5 ${colors.text}`} strokeWidth={1.5} />
          <h3 className="font-display font-bold text-gray-800">
            Need to Buy ({uncheckedItems.length})
          </h3>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {uncheckedItems.map((item) => {
              const addedBy = children[item.addedBy]
              return (
                <motion.div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-white/50 rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  layout
                >
                  <motion.button
                    className={`w-7 h-7 rounded-full border-2 ${colors.border} flex items-center justify-center`}
                    onClick={() => toggleGroceryItem(item.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  />
                  <span className="text-xl">{item.emoji}</span>
                  <span className="flex-1 font-display font-medium text-gray-800 text-sm sm:text-base">
                    {item.item}
                  </span>
                  {addedBy && (
                    <span className="text-xs text-gray-400">
                      {addedBy.name}
                    </span>
                  )}
                  <motion.button
                    className="p-1.5 text-gray-300 hover:text-red-400"
                    onClick={() => removeGroceryItem(item.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </motion.button>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {uncheckedItems.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" strokeWidth={1} />
              <p className="font-display">List is empty</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Completed Items */}
      {checkedItems.length > 0 && (
        <GlassCard variant="default">
          <div className="flex items-center gap-2 mb-3">
            <Check className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            <h3 className="font-display font-semibold text-gray-500">
              Got It ({checkedItems.length})
            </h3>
          </div>

          <div className="space-y-1.5">
            <AnimatePresence>
              {checkedItems.map((item) => (
                <motion.div
                  key={item.id}
                  className="flex items-center gap-3 p-2.5 bg-gray-50/50 rounded-lg opacity-60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  exit={{ opacity: 0, height: 0 }}
                  layout
                >
                  <motion.button
                    className={`w-6 h-6 rounded-full ${colors.accent} flex items-center justify-center`}
                    onClick={() => toggleGroceryItem(item.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                  </motion.button>
                  <span className="text-lg">{item.emoji}</span>
                  <span className="flex-1 font-display text-gray-400 text-sm line-through">
                    {item.item}
                  </span>
                  <motion.button
                    className="p-1 text-gray-300 hover:text-red-400"
                    onClick={() => removeGroceryItem(item.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </GlassCard>
      )}

      {/* Add Custom Item Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl"
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-display font-bold text-gray-800 mb-4 text-center">
                Add Custom Item
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-display font-medium text-gray-600 mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  value={customItem}
                  onChange={(e) => setCustomItem(e.target.value)}
                  placeholder="e.g., Almond butter"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-gray-400 focus:outline-none font-display"
                  autoFocus
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-display font-medium text-gray-600 mb-2">
                  Pick an emoji
                </label>
                <div className="flex flex-wrap gap-2">
                  {['🛒', '🍎', '🥛', '🍞', '🥩', '🧀', '🥬', '🍕', '🍪', '🧴', '📦', '✨'].map((emoji) => (
                    <button
                      key={emoji}
                      className={`
                        w-11 h-11 rounded-xl flex items-center justify-center text-xl
                        ${customEmoji === emoji ? `${colors.light} ring-2 ring-offset-1 ${colors.border}` : 'bg-gray-100 hover:bg-gray-200'}
                        transition-all
                      `}
                      onClick={() => setCustomEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className={`flex-1 bg-gradient-to-r ${colors.gradient} text-white`}
                  onClick={handleAddCustom}
                  disabled={!customItem.trim()}
                >
                  Add Item
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
