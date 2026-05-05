import { useState } from 'react'
import { X } from 'lucide-react'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants/categories'
import { addTransaction } from '../utils/storage'

export default function TransactionForm({ onClose }) {
  const [type, setType] = useState('expense')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!category || !amount || Number(amount) <= 0) return

    addTransaction({
      type,
      category,
      amount: Number(amount),
      date,
      note: note.trim(),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Transaction</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={22} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            {['expense', 'income'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setType(t); setCategory('') }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  type === t
                    ? t === 'income'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-red-500 text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Category Grid */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center p-2.5 rounded-xl text-xs transition-all ${
                    category === cat.id
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 ring-2 ring-emerald-500'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="text-xl mb-1">{cat.icon}</span>
                  <span className="text-gray-700 dark:text-gray-300 truncate w-full text-center">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!category || !amount || Number(amount) <= 0}
            className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            Add Transaction
          </button>
        </form>
      </div>
    </div>
  )
}
