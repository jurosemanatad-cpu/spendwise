import { useState, useMemo, useEffect } from 'react'
import { Trash2, Search, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { getTransactions, deleteTransaction } from '../utils/storage'
import { getCategoryById } from '../constants/categories'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const refresh = () => setTransactions(getTransactions())

  useEffect(() => {
    refresh()
    const handleStorage = () => refresh()
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (filter !== 'all' && t.type !== filter) return false
      if (search) {
        const cat = getCategoryById(t.category)
        const q = search.toLowerCase()
        return cat.label.toLowerCase().includes(q) || (t.note || '').toLowerCase().includes(q)
      }
      return true
    })
  }, [transactions, filter, search])

  const handleDelete = (id) => {
    const updated = deleteTransaction(id)
    setTransactions(updated)
  }

  const formatCurrency = (val) => `₱${val.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const grouped = useMemo(() => {
    const groups = {}
    filtered.forEach(t => {
      const key = new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      if (!groups[key]) groups[key] = []
      groups[key].push(t)
    })
    return groups
  }, [filtered])

  return (
    <div className="space-y-4">
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
        {['all', 'income', 'expense'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-1">{date}</p>
          <div className="card divide-y divide-gray-100 dark:divide-gray-700">
            {items.map((t) => {
              const cat = getCategoryById(t.category)
              return (
                <div key={t.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cat.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{cat.label}</p>
                      {t.note && <p className="text-xs text-gray-500 dark:text-gray-400">{t.note}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {t.type === 'income' ? (
                        <ArrowUpRight size={14} className="text-emerald-500" />
                      ) : (
                        <ArrowDownRight size={14} className="text-red-500" />
                      )}
                      <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
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
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <p className="text-sm">No transactions found</p>
        </div>
      )}
    </div>
  )
}
