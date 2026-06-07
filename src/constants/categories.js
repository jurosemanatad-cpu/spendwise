export const INCOME_CATEGORIES = [
  { id: 'allowance', label: 'Allowance', icon: '💸', color: '#10b981' },
  { id: 'savings', label: 'Savings', icon: '🐖', color: '#3b82f6' },
  { id: 'gifts', label: 'Gifts', icon: '🎁', color: '#8b5cf6' },
  { id: 'scholarship', label: 'Scholarship', icon: '🎓', color: '#f59e0b' },
  { id: 'part_time', label: 'Part-time Job', icon: '💻', color: '#06b6d4' },
  { id: 'selling', label: 'Selling Items', icon: '🏷️', color: '#ec4899' },
  { id: 'other_income', label: 'Other', icon: '💰', color: '#64748b' }
]

export const EXPENSE_CATEGORIES = [
  { id: 'tuition', label: 'Tuition & Fees', icon: '🏫', color: '#ef4444' },
  { id: 'supplies', label: 'Books & Supplies', icon: '📚', color: '#f97316' },
  { id: 'food', label: 'Food & Groceries', icon: '🍔', color: '#eab308' },
  { id: 'transport', label: 'Transportation', icon: '🚌', color: '#3b82f6' },
  { id: 'housing', label: 'Housing & Dorm', icon: '🏠', color: '#8b5cf6' },
  { id: 'electronics', label: 'Electronics & Gadgets', icon: '💻', color: '#6366f1' },
  { id: 'clothing', label: 'Clothing & Shoes', icon: '👕', color: '#ec4899' },
  { id: 'personal_care', label: 'Personal Care', icon: '🧴', color: '#14b8a6' },
  { id: 'subscriptions', label: 'Subscriptions', icon: '🎵', color: '#84cc16' },
  { id: 'gaming', label: 'Gaming (MLBB, etc.)', icon: '🎮', color: '#a855f7' },
  { id: 'social', label: 'Social & Fun', icon: '🍿', color: '#f43f5e' },
  { id: 'other_expense', label: 'Other', icon: '💸', color: '#64748b' }
]

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]

export function getCategoryById(id) {
  return ALL_CATEGORIES.find(c => c.id === id) || { id, label: id, icon: '❓', color: '#6b7280' }
}

