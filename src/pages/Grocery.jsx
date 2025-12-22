import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Plus, Check, X, ShoppingCart, Camera } from 'lucide-react'
import useStore from '../store/useStore'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'

const suggestedItems = [
  { item: 'Milk', emoji: '🥛' },
  { item: 'Bread', emoji: '🍞' },
  { item: 'Eggs', emoji: '🥚' },
  { item: 'Apples', emoji: '🍎' },
  { item: 'Bananas', emoji: '🍌' },
  { item: 'Cereal', emoji: '🥣' },
  { item: 'Juice', emoji: '🧃' },
  { item: 'Cheese', emoji: '🧀' },
  { item: 'Yogurt', emoji: '🥛' },
  { item: 'Chicken', emoji: '🍗' },
  { item: 'Rice', emoji: '🍚' },
  { item: 'Pasta', emoji: '🍝' },
  { item: 'Cookies', emoji: '🍪' },
  { item: 'Ice Cream', emoji: '🍦' },
  { item: 'Pizza', emoji: '🍕' },
  { item: 'Carrots', emoji: '🥕' },
]

export default function Grocery() {
  const { currentChild, children, groceryList, addGroceryItem, toggleGroceryItem, removeGroceryItem } = useStore()
  const child = currentChild ? children[currentChild] : null

  const [showAddItem, setShowAddItem] = useState(false)
  const [customItem, setCustomItem] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('🛒')

  const handleAddSuggested = (item) => {
    addGroceryItem(item, currentChild)
  }

  const handleAddCustom = () => {
    if (!customItem.trim()) return
    addGroceryItem({ item: customItem, emoji: selectedEmoji }, currentChild)
    setCustomItem('')
    setShowAddItem(false)
  }

  const uncheckedItems = groceryList.filter((i) => !i.completed)
  const checkedItems = groceryList.filter((i) => i.completed)

  if (!child) return null

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.span
          className="text-6xl block mb-2"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🛒
        </motion.span>
        <h1 className="text-3xl font-display font-bold text-gray-800">
          Shopping List
        </h1>
        <p className="text-gray-600 font-display">
          Tell mom & dad what you need!
        </p>
      </motion.div>

      {/* Quick Add Suggestions */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="font-display font-semibold text-gray-700 mb-3">
          Quick Add:
        </h2>
        <div className="flex flex-wrap gap-2">
          {suggestedItems.slice(0, 8).map((item, index) => (
            <motion.button
              key={item.item}
              className="bg-white/50 backdrop-blur px-3 py-2 rounded-full flex items-center gap-2 shadow hover:shadow-md transition-shadow"
              onClick={() => handleAddSuggested(item)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * index }}
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="font-display text-gray-700">{item.item}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Add Custom Item Button */}
      <motion.div
        className="flex justify-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          variant={child.theme}
          icon={<Plus className="w-5 h-5" />}
          onClick={() => setShowAddItem(true)}
        >
          Add Something Else
        </Button>
      </motion.div>

      {/* Shopping List */}
      <GlassCard variant="default" className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="w-5 h-5 text-green-500" />
          <h3 className="font-display font-bold text-gray-800 text-lg">
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
                  className="flex items-center gap-3 p-3 bg-white/40 rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  layout
                >
                  <motion.button
                    className="w-8 h-8 rounded-full border-2 border-green-400 flex items-center justify-center"
                    onClick={() => toggleGroceryItem(item.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  />
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="flex-1 font-display font-semibold text-gray-800">
                    {item.item}
                  </span>
                  {addedBy && (
                    <span className="text-sm text-gray-500">
                      by {addedBy.avatar}
                    </span>
                  )}
                  <motion.button
                    className="p-1 text-gray-400 hover:text-red-500"
                    onClick={() => removeGroceryItem(item.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {uncheckedItems.length === 0 && (
            <p className="text-center text-gray-500 py-4 font-display">
              Nothing to buy! 🎉
            </p>
          )}
        </div>
      </GlassCard>

      {/* Completed Items */}
      {checkedItems.length > 0 && (
        <GlassCard variant="default">
          <div className="flex items-center gap-2 mb-4">
            <Check className="w-5 h-5 text-gray-400" />
            <h3 className="font-display font-bold text-gray-500 text-lg">
              Got It! ({checkedItems.length})
            </h3>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {checkedItems.map((item) => (
                <motion.div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-gray-100/50 rounded-xl opacity-60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  exit={{ opacity: 0, height: 0 }}
                  layout
                >
                  <motion.button
                    className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center"
                    onClick={() => toggleGroceryItem(item.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.button>
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="flex-1 font-display text-gray-500 line-through">
                    {item.item}
                  </span>
                  <motion.button
                    className="p-1 text-gray-400 hover:text-red-500"
                    onClick={() => removeGroceryItem(item.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </GlassCard>
      )}

      {/* Add Custom Item Modal */}
      <AnimatePresence>
        {showAddItem && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddItem(false)}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-4 text-center">
                Add to List 🛒
              </h2>

              {/* Item Input */}
              <div className="mb-4">
                <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                  What do you need?
                </label>
                <input
                  type="text"
                  value={customItem}
                  onChange={(e) => setCustomItem(e.target.value)}
                  placeholder="e.g., Strawberries"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none font-display text-lg"
                />
              </div>

              {/* Emoji Selection */}
              <div className="mb-6">
                <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                  Pick an emoji:
                </label>
                <div className="flex flex-wrap gap-2">
                  {suggestedItems.map((item) => (
                    <motion.button
                      key={item.emoji}
                      className={`
                        w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                        ${selectedEmoji === item.emoji ? 'bg-green-100 ring-2 ring-green-400' : 'bg-gray-100'}
                      `}
                      onClick={() => setSelectedEmoji(item.emoji)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {item.emoji}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowAddItem(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant={child.theme}
                  className="flex-1"
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
