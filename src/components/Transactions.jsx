import { useState, useMemo, useEffect } from 'react'
import { Trash2, Search, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { getTransactions, deleteTransaction } from '../utils/storage'
import { getCategoryById } from '../constants/categories'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [viewDate, setViewDate] = useState(new Date())

  const refresh = () => setTransactions(getTransactions())
  
  useEffect(() => {
    refresh()
    const handleStorage = () => refresh()
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const filteredAndGrouped = useMemo(() => {
    const viewMonth = viewDate.getMonth()
    const viewYear = viewDate.getFullYear()

    // 1. Filter by month/year, type (income/expense), and search text
    const filtered = transactions.filter(t => {
      const d = new Date(t.date)
      if (d.getMonth() !== viewMonth || d.getFullYear() !== viewYear) return false
      
      if (filter !== 'all' && t.type !== filter) return false
      
      if (search) {
        const cat = getCategoryById(t.category)
        const q = search.toLowerCase()
        return cat.label.toLowerCase().includes(q) || (t.note || '').toLowerCase().includes(q)
      }
      
      return true
    })

    // 2. Sort from newest to oldest
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date))

    // 3. Group by formatted day
    const groups = {}
    filtered.forEach(t => {
      const dateKey = new Date(t.date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      })
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(t)
    })

    // Return as an array of [dateString, transactionsArray]
    return Object.entries(groups)
  }, [transactions, filter, search, viewDate])

  const handleDelete = (id) => {
    const updated = deleteTransaction(id)
    setTransactions(updated)
  }

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
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

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transactions..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
        {[
          { id: 'all', label: 'All' },
          { id: 'income', label: 'Budget' },
          { id: 'expense', label: 'Expense' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.id
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Transaction List (Grouped by Day) */}
      <div className="space-y-4 pt-1">
        {filteredAndGrouped.length > 0 ? (
          filteredAndGrouped.map(([date, items]) => (
            <div key={date} className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 pl-1 uppercase tracking-wide">
                {date}
              </p>
              <div className="card divide-y divide-gray-100 dark:divide-gray-700">
                {items.map((t) => {
                  const cat = getCategoryById(t.category)
                  return (
                    <div key={t.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cat.icon}</span>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{cat.label}</p>
                          {t.note && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.note}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {t.type === 'income' ? (
                            <ArrowUpRight size={14} className="text-emerald-500" />
                          ) : (
                            <ArrowDownRight size={14} className="text-red-500" />
                          )}
                          <span className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <p className="text-sm">No transactions found for this month</p>
          </div>
        )}
      </div>
    </div>
  )
}
