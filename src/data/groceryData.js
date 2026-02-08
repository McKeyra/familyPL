/**
 * Comprehensive Grocery Data with Categories
 * Organized for easy searching and browsing
 */

export const groceryCategories = {
  produce: {
    name: 'Produce',
    icon: '🥬',
    color: 'bg-green-100 text-green-700',
  },
  dairy: {
    name: 'Dairy & Eggs',
    icon: '🥛',
    color: 'bg-blue-100 text-blue-700',
  },
  meat: {
    name: 'Meat & Seafood',
    icon: '🥩',
    color: 'bg-red-100 text-red-700',
  },
  bakery: {
    name: 'Bakery',
    icon: '🍞',
    color: 'bg-amber-100 text-amber-700',
  },
  frozen: {
    name: 'Frozen',
    icon: '🧊',
    color: 'bg-cyan-100 text-cyan-700',
  },
  pantry: {
    name: 'Pantry',
    icon: '🥫',
    color: 'bg-orange-100 text-orange-700',
  },
  snacks: {
    name: 'Snacks',
    icon: '🍿',
    color: 'bg-purple-100 text-purple-700',
  },
  beverages: {
    name: 'Beverages',
    icon: '🥤',
    color: 'bg-pink-100 text-pink-700',
  },
  household: {
    name: 'Household',
    icon: '🧹',
    color: 'bg-gray-100 text-gray-700',
  },
  baby: {
    name: 'Baby',
    icon: '👶',
    color: 'bg-rose-100 text-rose-700',
  },
  health: {
    name: 'Health & Beauty',
    icon: '💊',
    color: 'bg-teal-100 text-teal-700',
  },
  pet: {
    name: 'Pet Supplies',
    icon: '🐾',
    color: 'bg-yellow-100 text-yellow-700',
  },
}

export const groceryItems = [
  // Produce - Fruits
  { item: 'Apples', emoji: '🍎', category: 'produce', subcategory: 'fruit' },
  { item: 'Bananas', emoji: '🍌', category: 'produce', subcategory: 'fruit' },
  { item: 'Oranges', emoji: '🍊', category: 'produce', subcategory: 'fruit' },
  { item: 'Grapes', emoji: '🍇', category: 'produce', subcategory: 'fruit' },
  { item: 'Strawberries', emoji: '🍓', category: 'produce', subcategory: 'fruit' },
  { item: 'Blueberries', emoji: '🫐', category: 'produce', subcategory: 'fruit' },
  { item: 'Raspberries', emoji: '🫐', category: 'produce', subcategory: 'fruit' },
  { item: 'Watermelon', emoji: '🍉', category: 'produce', subcategory: 'fruit' },
  { item: 'Peaches', emoji: '🍑', category: 'produce', subcategory: 'fruit' },
  { item: 'Pears', emoji: '🍐', category: 'produce', subcategory: 'fruit' },
  { item: 'Lemons', emoji: '🍋', category: 'produce', subcategory: 'fruit' },
  { item: 'Limes', emoji: '🍋', category: 'produce', subcategory: 'fruit' },
  { item: 'Pineapple', emoji: '🍍', category: 'produce', subcategory: 'fruit' },
  { item: 'Mango', emoji: '🥭', category: 'produce', subcategory: 'fruit' },
  { item: 'Avocado', emoji: '🥑', category: 'produce', subcategory: 'fruit' },
  { item: 'Cherries', emoji: '🍒', category: 'produce', subcategory: 'fruit' },
  { item: 'Kiwi', emoji: '🥝', category: 'produce', subcategory: 'fruit' },
  { item: 'Cantaloupe', emoji: '🍈', category: 'produce', subcategory: 'fruit' },

  // Produce - Vegetables
  { item: 'Carrots', emoji: '🥕', category: 'produce', subcategory: 'vegetable' },
  { item: 'Broccoli', emoji: '🥦', category: 'produce', subcategory: 'vegetable' },
  { item: 'Lettuce', emoji: '🥬', category: 'produce', subcategory: 'vegetable' },
  { item: 'Spinach', emoji: '🥬', category: 'produce', subcategory: 'vegetable' },
  { item: 'Tomatoes', emoji: '🍅', category: 'produce', subcategory: 'vegetable' },
  { item: 'Onions', emoji: '🧅', category: 'produce', subcategory: 'vegetable' },
  { item: 'Garlic', emoji: '🧄', category: 'produce', subcategory: 'vegetable' },
  { item: 'Potatoes', emoji: '🥔', category: 'produce', subcategory: 'vegetable' },
  { item: 'Sweet Potatoes', emoji: '🍠', category: 'produce', subcategory: 'vegetable' },
  { item: 'Bell Peppers', emoji: '🫑', category: 'produce', subcategory: 'vegetable' },
  { item: 'Cucumbers', emoji: '🥒', category: 'produce', subcategory: 'vegetable' },
  { item: 'Celery', emoji: '🥬', category: 'produce', subcategory: 'vegetable' },
  { item: 'Corn', emoji: '🌽', category: 'produce', subcategory: 'vegetable' },
  { item: 'Mushrooms', emoji: '🍄', category: 'produce', subcategory: 'vegetable' },
  { item: 'Green Beans', emoji: '🫛', category: 'produce', subcategory: 'vegetable' },
  { item: 'Zucchini', emoji: '🥒', category: 'produce', subcategory: 'vegetable' },
  { item: 'Cauliflower', emoji: '🥦', category: 'produce', subcategory: 'vegetable' },
  { item: 'Cabbage', emoji: '🥬', category: 'produce', subcategory: 'vegetable' },
  { item: 'Asparagus', emoji: '🌿', category: 'produce', subcategory: 'vegetable' },

  // Dairy & Eggs
  { item: 'Milk', emoji: '🥛', category: 'dairy' },
  { item: 'Eggs', emoji: '🥚', category: 'dairy' },
  { item: 'Butter', emoji: '🧈', category: 'dairy' },
  { item: 'Cheese', emoji: '🧀', category: 'dairy' },
  { item: 'Cheddar Cheese', emoji: '🧀', category: 'dairy' },
  { item: 'Mozzarella', emoji: '🧀', category: 'dairy' },
  { item: 'Parmesan', emoji: '🧀', category: 'dairy' },
  { item: 'Cream Cheese', emoji: '🧀', category: 'dairy' },
  { item: 'Yogurt', emoji: '🥛', category: 'dairy' },
  { item: 'Greek Yogurt', emoji: '🥛', category: 'dairy' },
  { item: 'Sour Cream', emoji: '🥛', category: 'dairy' },
  { item: 'Heavy Cream', emoji: '🥛', category: 'dairy' },
  { item: 'Cottage Cheese', emoji: '🥛', category: 'dairy' },
  { item: 'Almond Milk', emoji: '🥛', category: 'dairy' },
  { item: 'Oat Milk', emoji: '🥛', category: 'dairy' },

  // Meat & Seafood
  { item: 'Chicken Breast', emoji: '🍗', category: 'meat' },
  { item: 'Chicken Thighs', emoji: '🍗', category: 'meat' },
  { item: 'Ground Beef', emoji: '🥩', category: 'meat' },
  { item: 'Steak', emoji: '🥩', category: 'meat' },
  { item: 'Pork Chops', emoji: '🥩', category: 'meat' },
  { item: 'Bacon', emoji: '🥓', category: 'meat' },
  { item: 'Sausage', emoji: '🌭', category: 'meat' },
  { item: 'Ham', emoji: '🍖', category: 'meat' },
  { item: 'Turkey', emoji: '🦃', category: 'meat' },
  { item: 'Ground Turkey', emoji: '🦃', category: 'meat' },
  { item: 'Salmon', emoji: '🐟', category: 'meat' },
  { item: 'Shrimp', emoji: '🦐', category: 'meat' },
  { item: 'Tuna', emoji: '🐟', category: 'meat' },
  { item: 'Cod', emoji: '🐟', category: 'meat' },
  { item: 'Hot Dogs', emoji: '🌭', category: 'meat' },
  { item: 'Deli Meat', emoji: '🥪', category: 'meat' },

  // Bakery
  { item: 'Bread', emoji: '🍞', category: 'bakery' },
  { item: 'Whole Wheat Bread', emoji: '🍞', category: 'bakery' },
  { item: 'Bagels', emoji: '🥯', category: 'bakery' },
  { item: 'English Muffins', emoji: '🧁', category: 'bakery' },
  { item: 'Tortillas', emoji: '🫓', category: 'bakery' },
  { item: 'Croissants', emoji: '🥐', category: 'bakery' },
  { item: 'Muffins', emoji: '🧁', category: 'bakery' },
  { item: 'Buns', emoji: '🍔', category: 'bakery' },
  { item: 'Pita Bread', emoji: '🫓', category: 'bakery' },
  { item: 'Donuts', emoji: '🍩', category: 'bakery' },
  { item: 'Cake', emoji: '🎂', category: 'bakery' },
  { item: 'Cookies', emoji: '🍪', category: 'bakery' },
  { item: 'Pie', emoji: '🥧', category: 'bakery' },

  // Frozen
  { item: 'Ice Cream', emoji: '🍦', category: 'frozen' },
  { item: 'Frozen Pizza', emoji: '🍕', category: 'frozen' },
  { item: 'Frozen Vegetables', emoji: '🥦', category: 'frozen' },
  { item: 'Frozen Fruit', emoji: '🍓', category: 'frozen' },
  { item: 'Frozen Waffles', emoji: '🧇', category: 'frozen' },
  { item: 'Frozen Chicken', emoji: '🍗', category: 'frozen' },
  { item: 'Fish Sticks', emoji: '🐟', category: 'frozen' },
  { item: 'Chicken Nuggets', emoji: '🍗', category: 'frozen' },
  { item: 'French Fries', emoji: '🍟', category: 'frozen' },
  { item: 'Frozen Burritos', emoji: '🌯', category: 'frozen' },
  { item: 'Popsicles', emoji: '🍦', category: 'frozen' },
  { item: 'Ice Cream Bars', emoji: '🍦', category: 'frozen' },

  // Pantry
  { item: 'Rice', emoji: '🍚', category: 'pantry' },
  { item: 'Pasta', emoji: '🍝', category: 'pantry' },
  { item: 'Spaghetti', emoji: '🍝', category: 'pantry' },
  { item: 'Macaroni', emoji: '🍝', category: 'pantry' },
  { item: 'Cereal', emoji: '🥣', category: 'pantry' },
  { item: 'Oatmeal', emoji: '🥣', category: 'pantry' },
  { item: 'Peanut Butter', emoji: '🥜', category: 'pantry' },
  { item: 'Jelly', emoji: '🍇', category: 'pantry' },
  { item: 'Honey', emoji: '🍯', category: 'pantry' },
  { item: 'Maple Syrup', emoji: '🥞', category: 'pantry' },
  { item: 'Olive Oil', emoji: '🫒', category: 'pantry' },
  { item: 'Vegetable Oil', emoji: '🍶', category: 'pantry' },
  { item: 'Flour', emoji: '🌾', category: 'pantry' },
  { item: 'Sugar', emoji: '🧂', category: 'pantry' },
  { item: 'Brown Sugar', emoji: '🧂', category: 'pantry' },
  { item: 'Salt', emoji: '🧂', category: 'pantry' },
  { item: 'Pepper', emoji: '🌶️', category: 'pantry' },
  { item: 'Canned Tomatoes', emoji: '🥫', category: 'pantry' },
  { item: 'Tomato Sauce', emoji: '🥫', category: 'pantry' },
  { item: 'Pasta Sauce', emoji: '🥫', category: 'pantry' },
  { item: 'Canned Beans', emoji: '🥫', category: 'pantry' },
  { item: 'Canned Corn', emoji: '🥫', category: 'pantry' },
  { item: 'Canned Soup', emoji: '🥫', category: 'pantry' },
  { item: 'Chicken Broth', emoji: '🍲', category: 'pantry' },
  { item: 'Tuna Can', emoji: '🐟', category: 'pantry' },
  { item: 'Crackers', emoji: '🍘', category: 'pantry' },
  { item: 'Breadcrumbs', emoji: '🍞', category: 'pantry' },
  { item: 'Pancake Mix', emoji: '🥞', category: 'pantry' },
  { item: 'Baking Powder', emoji: '🧂', category: 'pantry' },
  { item: 'Baking Soda', emoji: '🧂', category: 'pantry' },
  { item: 'Vanilla Extract', emoji: '🍶', category: 'pantry' },
  { item: 'Chocolate Chips', emoji: '🍫', category: 'pantry' },
  { item: 'Cocoa Powder', emoji: '🍫', category: 'pantry' },
  { item: 'Ketchup', emoji: '🍅', category: 'pantry' },
  { item: 'Mustard', emoji: '🟡', category: 'pantry' },
  { item: 'Mayonnaise', emoji: '🥚', category: 'pantry' },
  { item: 'Soy Sauce', emoji: '🍶', category: 'pantry' },
  { item: 'Vinegar', emoji: '🍶', category: 'pantry' },
  { item: 'Hot Sauce', emoji: '🌶️', category: 'pantry' },
  { item: 'Salsa', emoji: '🫙', category: 'pantry' },

  // Snacks
  { item: 'Chips', emoji: '🍟', category: 'snacks' },
  { item: 'Popcorn', emoji: '🍿', category: 'snacks' },
  { item: 'Pretzels', emoji: '🥨', category: 'snacks' },
  { item: 'Nuts', emoji: '🥜', category: 'snacks' },
  { item: 'Trail Mix', emoji: '🥜', category: 'snacks' },
  { item: 'Granola Bars', emoji: '🍫', category: 'snacks' },
  { item: 'Fruit Snacks', emoji: '🍬', category: 'snacks' },
  { item: 'Goldfish', emoji: '🐟', category: 'snacks' },
  { item: 'Cheese Crackers', emoji: '🧀', category: 'snacks' },
  { item: 'Candy', emoji: '🍬', category: 'snacks' },
  { item: 'Chocolate', emoji: '🍫', category: 'snacks' },
  { item: 'Gummy Bears', emoji: '🧸', category: 'snacks' },
  { item: 'Dried Fruit', emoji: '🍇', category: 'snacks' },
  { item: 'Applesauce', emoji: '🍎', category: 'snacks' },
  { item: 'Pudding', emoji: '🍮', category: 'snacks' },
  { item: 'Jello', emoji: '🍮', category: 'snacks' },

  // Beverages
  { item: 'Water', emoji: '💧', category: 'beverages' },
  { item: 'Sparkling Water', emoji: '💧', category: 'beverages' },
  { item: 'Juice', emoji: '🧃', category: 'beverages' },
  { item: 'Apple Juice', emoji: '🍎', category: 'beverages' },
  { item: 'Orange Juice', emoji: '🍊', category: 'beverages' },
  { item: 'Grape Juice', emoji: '🍇', category: 'beverages' },
  { item: 'Lemonade', emoji: '🍋', category: 'beverages' },
  { item: 'Soda', emoji: '🥤', category: 'beverages' },
  { item: 'Coffee', emoji: '☕', category: 'beverages' },
  { item: 'Tea', emoji: '🍵', category: 'beverages' },
  { item: 'Hot Chocolate', emoji: '☕', category: 'beverages' },
  { item: 'Sports Drinks', emoji: '🥤', category: 'beverages' },
  { item: 'Coconut Water', emoji: '🥥', category: 'beverages' },

  // Household
  { item: 'Paper Towels', emoji: '🧻', category: 'household' },
  { item: 'Toilet Paper', emoji: '🧻', category: 'household' },
  { item: 'Tissues', emoji: '🤧', category: 'household' },
  { item: 'Trash Bags', emoji: '🗑️', category: 'household' },
  { item: 'Dish Soap', emoji: '🧴', category: 'household' },
  { item: 'Laundry Detergent', emoji: '🧺', category: 'household' },
  { item: 'All-Purpose Cleaner', emoji: '🧹', category: 'household' },
  { item: 'Sponges', emoji: '🧽', category: 'household' },
  { item: 'Aluminum Foil', emoji: '📄', category: 'household' },
  { item: 'Plastic Wrap', emoji: '📄', category: 'household' },
  { item: 'Ziploc Bags', emoji: '📦', category: 'household' },
  { item: 'Light Bulbs', emoji: '💡', category: 'household' },
  { item: 'Batteries', emoji: '🔋', category: 'household' },
  { item: 'Hand Soap', emoji: '🧴', category: 'household' },

  // Baby
  { item: 'Diapers', emoji: '👶', category: 'baby' },
  { item: 'Baby Wipes', emoji: '👶', category: 'baby' },
  { item: 'Baby Food', emoji: '🍼', category: 'baby' },
  { item: 'Baby Formula', emoji: '🍼', category: 'baby' },
  { item: 'Baby Cereal', emoji: '🥣', category: 'baby' },
  { item: 'Baby Snacks', emoji: '🍪', category: 'baby' },
  { item: 'Baby Shampoo', emoji: '🧴', category: 'baby' },
  { item: 'Baby Lotion', emoji: '🧴', category: 'baby' },

  // Health & Beauty
  { item: 'Shampoo', emoji: '🧴', category: 'health' },
  { item: 'Conditioner', emoji: '🧴', category: 'health' },
  { item: 'Body Wash', emoji: '🧴', category: 'health' },
  { item: 'Toothpaste', emoji: '🪥', category: 'health' },
  { item: 'Toothbrush', emoji: '🪥', category: 'health' },
  { item: 'Floss', emoji: '🦷', category: 'health' },
  { item: 'Mouthwash', emoji: '🦷', category: 'health' },
  { item: 'Deodorant', emoji: '🧴', category: 'health' },
  { item: 'Sunscreen', emoji: '☀️', category: 'health' },
  { item: 'Band-Aids', emoji: '🩹', category: 'health' },
  { item: 'Pain Reliever', emoji: '💊', category: 'health' },
  { item: 'Vitamins', emoji: '💊', category: 'health' },
  { item: 'Cold Medicine', emoji: '💊', category: 'health' },
  { item: 'Lotion', emoji: '🧴', category: 'health' },
  { item: 'Cotton Balls', emoji: '⚪', category: 'health' },
  { item: 'Q-Tips', emoji: '🦻', category: 'health' },

  // Pet Supplies
  { item: 'Dog Food', emoji: '🐕', category: 'pet' },
  { item: 'Cat Food', emoji: '🐈', category: 'pet' },
  { item: 'Dog Treats', emoji: '🦴', category: 'pet' },
  { item: 'Cat Treats', emoji: '🐟', category: 'pet' },
  { item: 'Cat Litter', emoji: '🐈', category: 'pet' },
  { item: 'Pet Shampoo', emoji: '🧴', category: 'pet' },
  { item: 'Poop Bags', emoji: '🐕', category: 'pet' },
]

// Search function for grocery items
export function searchGroceryItems(query) {
  if (!query || query.length < 2) return []

  const lowerQuery = query.toLowerCase()
  return groceryItems.filter(item =>
    item.item.toLowerCase().includes(lowerQuery) ||
    item.category.toLowerCase().includes(lowerQuery)
  ).slice(0, 20)
}

// Get items by category
export function getItemsByCategory(categoryId) {
  return groceryItems.filter(item => item.category === categoryId)
}

// Get popular/common items
export function getPopularItems() {
  const popularNames = [
    'Milk', 'Bread', 'Eggs', 'Bananas', 'Apples', 'Chicken Breast',
    'Cheese', 'Butter', 'Rice', 'Pasta', 'Cereal', 'Yogurt',
    'Orange Juice', 'Carrots', 'Tomatoes', 'Onions'
  ]
  return groceryItems.filter(item => popularNames.includes(item.item))
}
