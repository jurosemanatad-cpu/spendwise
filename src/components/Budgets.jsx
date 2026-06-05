import { useState, useMemo, useEffect } from 'react'
import { Plus, Trash2, AlertTriangle, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { getBudgets, setBudget, deleteBudget, getTransactions } from '../utils/storage'
import { EXPENSE_CATEGORIES, getCategoryById } from '../constants/categories'

export default function Budgets() {
  const [budgets, setBudgets] = useState([])
  const [transactions, setTransactions] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [budgetAmount, setBudgetAmount] = useState('')
  
  // NEW: Track the currently viewed month
  const [viewDate, setViewDate] = useState(new Date())

  const refresh = () => {
    setBudgets(getBudgets())
    setTransactions(getTransactions())
  }
  
  useEffect(() => { refresh() }, [])

  // Generate the YYYY-MM key for the currently viewed month
  const currentMonthKey = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}` 

  const budgetStatus = useMemo(() => {
    // Only look at budgets assigned to THIS specific month
    const monthlyBudgets = budgets.filter(b => b.monthKey === currentMonthKey)

    return monthlyBudgets.map(b => {
      const spent = transactions
        .filter(t => {
          const d = new Date(t.date)
          return t.type === 'expense' && 
                 t.category === b.categoryId && 
                 d.getMonth() === viewDate.getMonth() && 
                 d.getFullYear() === viewDate.getFullYear()
        })
        .reduce((sum, t) => sum + t.amount, 0)
        
      const cat = getCategoryById(b.categoryId)
      const pct = b.amount > 0 ? Math.min((spent / b.amount) * 100, 100) : 0
      const over = spent > b.amount
      return { ...b, spent, cat, pct, over }
    })
  }, [budgets, transactions, viewDate, currentMonthKey])

  const existingCategoryIds = budgetStatus.map(b => b.categoryId)
  const availableCategories = EXPENSE_CATEGORIES.filter(c => !existingCategoryIds.includes(c.id))

  const handleAdd = () => {
    if (!selectedCategory || !budgetAmount || Number(budgetAmount) <= 0) return
    // Save budget with the current month key attached
    setBudget(selectedCategory, Number(budgetAmount), currentMonthKey)
    setSelectedCategory('')
    setBudgetAmount('')
    setShowAdd(false)
    refresh()
  }

  const handleDelete = (categoryId) => {
    deleteBudget(categoryId, currentMonthKey)
    refresh()
  }

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
    setShowAdd(false) // Close form when navigating
  }

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
    setShowAdd(false) // Close form when navigating
  }

  const formatCurrency = (val) => `₱${val.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 

  return (
    <div className="space-y-4">
      {/* Month Navigator */}
      <div className="card p-3 flex items-center justify-between bg-white/60 dark:bg-gray-800/60 backdrop-blur-md">
        <button 
          onClick={handlePrevMonth}
          className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-white">
          <Calendar size={18} className="text-emerald-500" />
          {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>

        <button 
          onClick={handleNextMonth}
          className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex items-center justify-between mt-2">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Budgets</h2>
        {availableCategories.length > 0 && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            <Plus size={18} />
            Add Budget
          </button>
        )}
      </div>

      {/* Add Budget Form */}
      {showAdd && (
        <div className="card p-4 space-y-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Select category</option>
            {availableCategories.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
            ))}
          </select>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₱</span>
            <input
              type="number"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              placeholder="Budget limit"
              min="1"
              step="0.01"
              className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!selectedCategory || !budgetAmount || Number(budgetAmount) <= 0}
              className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add
            </button>
            <button
              onClick={() => { setShowAdd(false); setSelectedCategory(''); setBudgetAmount('') }}
              className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Budget Cards */}
      {budgetStatus.map(b => (
        <div key={b.categoryId} className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{b.cat.icon}</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{b.cat.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {b.over && <AlertTriangle size={16} className="text-red-500" />}
              <button
                onClick={() => handleDelete(b.categoryId)}
                className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all ${b.over ? 'bg-red-500' : b.pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${b.pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className={`${b.over ? 'text-red-500 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
              {formatCurrency(b.spent)} spent
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {formatCurrency(b.amount)} limit
            </span>
          </div>
        </div>
      ))}

      {budgetStatus.length === 0 && !showAdd && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <p className="text-sm">No budgets set for this month</p>
          <p className="text-xs mt-1">Add a budget to plan your spending</p>
        </div>
      )}
    </div>
  )
}
