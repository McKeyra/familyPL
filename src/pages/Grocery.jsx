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
  Apple,
  Milk,
  Croissant,
  Beef,
  Carrot,
  IceCream,
  Coffee,
  Pill,
  Sparkles,
  Baby,
  Dog,
  Wine,
} from 'lucide-react'
import useStore from '../store/useStore'

// Import grocery data
import {
  groceryCategories,
  groceryItems,
  searchGroceryItems,
  getPopularItems,
} from '../data/groceryData'

// Category icons mapping (replacing emoji)
const categoryIcons = {
  produce: Apple,
  dairy: Milk,
  bakery: Croissant,
  meat: Beef,
  vegetables: Carrot,
  frozen: IceCream,
  beverages: Coffee,
  health: Pill,
  household: Sparkles,
  baby: Baby,
  pet: Dog,
  alcohol: Wine,
}

// Theme configurations
const themeConfig = {
  bria: {
    primary: '#F43F5E',
    gradient: 'from-rose-400 to-pink-500',
    bgLight: 'bg-rose-100',
    border: 'border-rose-300',
    text: 'text-rose-600',
    ring: 'ring-rose-300',
  },
  naya: {
    primary: '#14B8A6',
    gradient: 'from-teal-400 to-cyan-500',
    bgLight: 'bg-teal-100',
    border: 'border-teal-300',
    text: 'text-teal-600',
    ring: 'ring-teal-300',
  },
  parent: {
    primary: '#64748B',
    gradient: 'from-slate-500 to-slate-600',
    bgLight: 'bg-slate-100',
    border: 'border-slate-300',
    text: 'text-slate-600',
    ring: 'ring-slate-300',
  },
}

export default function Grocery() {
  const { currentChild, children, groceryList, addGroceryItem, toggleGroceryItem, removeGroceryItem, isParentMode } = useStore()
  const child = currentChild ? children[currentChild] : null

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showCategories, setShowCategories] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [customItem, setCustomItem] = useState('')

  const theme = themeConfig[isParentMode ? 'parent' : (child?.theme || 'bria')]

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
    addGroceryItem({ item: customItem, emoji: '' }, currentChild)
    setCustomItem('')
    setShowAddModal(false)
  }

  const uncheckedItems = groceryList.filter((i) => !i.completed)
  const checkedItems = groceryList.filter((i) => i.completed)

  // Get category icon
  const getCategoryIcon = (categoryKey) => {
    const IconComponent = categoryIcons[categoryKey] || ShoppingCart
    return <IconComponent className="w-5 h-5" strokeWidth={1.5} />
  }

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto">
      {/* Compact Header */}
      <motion.header
        className="flex items-center justify-between mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
            <ShoppingCart className="w-5 h-5 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Shopping List</h1>
            <p className="text-xs text-slate-500">{uncheckedItems.length} items to buy</p>
          </div>
        </div>
        <motion.button
          onClick={() => setShowAddModal(true)}
          className={`p-2.5 rounded-xl bg-gradient-to-br ${theme.gradient} shadow-sm`}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5 text-white" strokeWidth={2} />
        </motion.button>
      </motion.header>

      {/* PRIORITY: Active Shopping List */}
      <motion.section
        className="mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {uncheckedItems.length > 0 ? (
            <div className="divide-y divide-slate-100">
              <AnimatePresence>
                {uncheckedItems.map((item) => {
                  const addedBy = children[item.addedBy]
                  return (
                    <motion.div
                      key={item.id}
                      className="flex items-center gap-3 p-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      layout
                    >
                      <motion.button
                        className={`w-6 h-6 rounded-full border-2 ${theme.border} flex items-center justify-center shrink-0`}
                        onClick={() => toggleGroceryItem(item.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      />
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <ShoppingCart className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                      </div>
                      <span className="flex-1 font-medium text-slate-800 text-sm truncate">
                        {item.item}
                      </span>
                      {addedBy && (
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {addedBy.name}
                        </span>
                      )}
                      <motion.button
                        className="p-1 text-slate-300 hover:text-red-400 shrink-0"
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
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" strokeWidth={1.5} />
              <p className="font-medium text-slate-500">List is empty</p>
              <p className="text-sm">Add items below</p>
            </div>
          )}
        </div>
      </motion.section>

      {/* Completed Items (collapsed by default) */}
      {checkedItems.length > 0 && (
        <motion.section
          className="mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2 p-3 border-b border-slate-200">
              <Check className="w-4 h-4 text-green-500" strokeWidth={2} />
              <span className="text-sm font-medium text-slate-500">
                Got It ({checkedItems.length})
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {checkedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2.5 opacity-50"
                >
                  <motion.button
                    className={`w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0`}
                    onClick={() => toggleGroceryItem(item.id)}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                  </motion.button>
                  <span className="flex-1 text-sm text-slate-400 line-through truncate">
                    {item.item}
                  </span>
                  <motion.button
                    className="p-1 text-slate-300 hover:text-red-400 shrink-0"
                    onClick={() => removeGroceryItem(item.id)}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </motion.button>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Add Item Section */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Add Items</h2>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-400 focus:outline-none text-sm bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Results */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              className="mb-3 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden max-h-48 overflow-y-auto"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {searchResults.slice(0, 6).map((item, index) => (
                <button
                  key={`${item.item}-${index}`}
                  onClick={() => handleAddItem(item)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    {getCategoryIcon(item.category)}
                  </div>
                  <span className="text-sm text-slate-700 flex-1 text-left">{item.item}</span>
                  <Plus className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Add Pills */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {popularItems.slice(0, 6).map((item, index) => (
              <motion.button
                key={item.item}
                className="bg-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-slate-100 text-sm"
                onClick={() => handleAddItem(item)}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.02 * index }}
              >
                <Plus className="w-3 h-3 text-slate-400" strokeWidth={2} />
                <span className="text-slate-600">{item.item}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Browse Categories - Collapsed by default */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="w-full flex items-center justify-between p-3"
          >
            <span className="text-sm font-medium text-slate-700">Browse Categories</span>
            {showCategories ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <AnimatePresence>
            {showCategories && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-slate-100"
              >
                <div className="p-3 flex flex-wrap gap-2">
                  {Object.entries(groceryCategories).map(([key, category]) => {
                    const IconComponent = categoryIcons[key] || ShoppingCart
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                        className={`
                          flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all
                          ${selectedCategory === key
                            ? `${theme.bgLight} ${theme.text} ring-2 ${theme.ring}`
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}
                        `}
                      >
                        <IconComponent className="w-4 h-4" strokeWidth={1.5} />
                        <span>{category.name}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Category Items */}
                <AnimatePresence>
                  {selectedCategory && categoryItems.length > 0 && (
                    <motion.div
                      className="p-3 border-t border-slate-100 bg-slate-50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-500">
                          {groceryCategories[selectedCategory]?.name}
                        </span>
                        <button
                          onClick={() => setSelectedCategory(null)}
                          className="p-1 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                        {categoryItems.map((item, index) => (
                          <button
                            key={`${item.item}-${index}`}
                            onClick={() => handleAddItem(item)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg text-xs text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            <Plus className="w-3 h-3 text-slate-400" />
                            {item.item}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Add Custom Item Modal - Bottom Sheet Style */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              className="bg-white rounded-t-3xl p-5 w-full max-w-lg shadow-2xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-800 mb-4 text-center">
                Add Custom Item
              </h2>

              <div className="mb-4">
                <input
                  type="text"
                  value={customItem}
                  onChange={(e) => setCustomItem(e.target.value)}
                  placeholder="Item name..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:outline-none text-sm"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleAddCustom}
                  disabled={!customItem.trim()}
                  className={`flex-1 py-3 rounded-xl bg-gradient-to-r ${theme.gradient} text-white text-sm font-medium shadow-sm disabled:opacity-50`}
                  whileTap={{ scale: 0.98 }}
                >
                  Add Item
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
