import { useState } from 'react'
import { X } from 'lucide-react'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants/categories'
import { addTransaction } from '../utils/storage'

// Add initialData to the props
export default function TransactionForm({ onClose, initialData }) {
  // Use initialData to pre-fill the form, or fallback to defaults
  const [type, setType] = useState(initialData?.type || 'expense')
  const [category, setCategory] = useState(initialData?.category || '')
  const [amount, setAmount] = useState(initialData?.amount || '')
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState(initialData?.note || '')

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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl border border-white/20 dark:border-white/10 w-full max-w-lg rounded-tr-[3rem] rounded-bl-[3rem] rounded-tl-xl rounded-br-xl p-6 max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Transaction</h2>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/40 dark:bg-gray-700/40 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all">
            <X size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Toggle */}
          <div className="flex bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-xl p-1 border border-white/20">
            {[ { id: 'expense', label: 'Expense' }, { id: 'income', label: 'Funds' } ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => { setType(t.id); setCategory('') }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  type === t.id
                    ? t.id === 'income'
                      ? 'bg-emerald-500/90 backdrop-blur-md text-white shadow-sm'
                      : 'bg-red-500/90 backdrop-blur-md text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/20'
                }`}
              >
                {t.label}
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
                      ? 'bg-emerald-500/20 dark:bg-emerald-500/30 ring-1 ring-emerald-500 backdrop-blur-md'
                      : 'bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border border-white/20 hover:bg-white/60 dark:hover:bg-gray-800/60'
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
            <div className="relative flex shadow-sm rounded-xl">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-white/20 dark:border-gray-600 text-gray-900 dark:text-white text-lg focus:ring-2 focus:ring-emerald-500 outline-none"
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
              className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-white/20 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
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
              className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-white/20 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!category || !amount || Number(amount) <= 0}
            className="w-full py-3.5 bg-emerald-500/90 backdrop-blur-md text-white rounded-tr-2xl rounded-bl-2xl rounded-tl-md rounded-br-md font-semibold text-lg hover:bg-emerald-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg"
          >
            Add Transaction
          </button>
        </form>
      </div>
    </div>
  )
}
