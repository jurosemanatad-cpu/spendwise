export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Salary', icon: '💼', color: '#10b981' },
  { id: 'freelance', label: 'Freelance', icon: '💻', color: '#06b6d4' },
  { id: 'investments', label: 'Investments', icon: '📈', color: '#8b5cf6' },
  { id: 'gifts', label: 'Gifts', icon: '🎁', color: '#f59e0b' },
  { id: 'other_income', label: 'Other Income', icon: '💰', color: '#6b7280' },
]

export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: '🍔', color: '#ef4444' },
  { id: 'transport', label: 'Transport', icon: '🚗', color: '#f97316' },
  { id: 'housing', label: 'Housing', icon: '🏠', color: '#8b5cf6' },
  { id: 'utilities', label: 'Utilities', icon: '💡', color: '#eab308' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#ec4899' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: '#14b8a6' },
  { id: 'health', label: 'Health', icon: '🏥', color: '#06b6d4' },
  { id: 'education', label: 'Education', icon: '📚', color: '#3b82f6' },
  { id: 'travel', label: 'Travel', icon: '✈️', color: '#a855f7' },
  { id: 'subscriptions', label: 'Subscriptions', icon: '📱', color: '#f43f5e' },
  { id: 'other_expense', label: 'Other Expense', icon: '📋', color: '#6b7280' },
]

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]

export function getCategoryById(id) {
  return ALL_CATEGORIES.find(c => c.id === id) || { id, label: id, icon: '❓', color: '#6b7280' }
}
