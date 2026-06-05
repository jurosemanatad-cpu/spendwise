import { useMemo, useState } from 'react'
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { getTransactions } from '../utils/storage'
import { getCategoryById } from '../constants/categories'

export default function Dashboard() {
  const transactions = getTransactions()
  // NEW: Track the currently viewed month
  const [viewDate, setViewDate] = useState(new Date())

  const { totalIncome, totalExpenses, balance, monthlyRecent, expenseByCategory, monthlyData } = useMemo(() => {
    const viewMonth = viewDate.getMonth()
    const viewYear = viewDate.getFullYear()

    let income = 0
    let expenses = 0
    const categoryMap = {}
    const monthMap = {}

    // Setup 6-month trailing data for the bar chart based on the viewed month
    for (let i = 5; i >= 0; i--) {
      const d = new Date(viewYear, viewMonth - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` 
      // Format as "Jan", "Feb", etc.
      const label = d.toLocaleDateString('en-US', { month: 'short' }) 
      monthMap[key] = { month: label, fullKey: key, income: 0, expenses: 0 }
    }

    const currentMonthTransactions = []

    transactions.forEach(t => {
      const d = new Date(t.date)
      const tMonth = d.getMonth()
      const tYear = d.getFullYear()
      const key = `${tYear}-${String(tMonth + 1).padStart(2, '0')}` 

      // 1. Populate the 6-month Bar Chart
      if (monthMap[key]) {
        if (t.type === 'income') monthMap[key].income += t.amount
        else monthMap[key].expenses += t.amount
      }

      // 2. Isolate data ONLY for the currently selected month
      if (tMonth === viewMonth && tYear === viewYear) {
        currentMonthTransactions.push(t)
        if (t.type === 'income') {
          income += t.amount
        } else {
          expenses += t.amount
          categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount
        }
      }
    })

    // Sort categories by highest expense
    const expenseByCategory = Object.entries(categoryMap)
      .map(([id, amount]) => ({
        ...getCategoryById(id),
        value: amount,
      }))
      .sort((a, b) => b.value - a.value)

    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
      // Only keep 5 recent transactions for the dashboard
      monthlyRecent: currentMonthTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
      expenseByCategory,
      monthlyData: Object.values(monthMap)
    }
  }, [transactions, viewDate])

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  // UNLOCKED: You can now go into the future infinitely
  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  }

  // Format as ₱10,000.00
  const formatCurrency = (val) => `₱${val.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 

  return (
    <div className="space-y-5">
      
      {/* NEW: Month Navigator */}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <TrendingUp size={18} />
            <span className="text-xs font-medium">Income</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-red-500 mb-1">
            <TrendingDown size={18} />
            <span className="text-xs font-medium">Expenses</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(totalExpenses)}</p>
        </div>
      </div>

      {/* Balance */}
      <div className="card p-5">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
          <Wallet size={18} />
          <span className="text-sm">Net Balance</span>
        </div>
        <p className={`text-3xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {formatCurrency(balance)}
        </p>
      </div>

      {/* Monthly Chart (6-Month Trend) */}
      {monthlyData.some(d => d.income > 0 || d.expenses > 0) && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">6-Month Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₱${v}`} width={60} />
              <Tooltip formatter={(v) => `₱${v.toLocaleString()}`} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Expense Breakdown for the Selected Month */}
      {expenseByCategory.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Where your money went</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie data={expenseByCategory} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={65}>
                  {expenseByCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `₱${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2 max-h-40 overflow-y-auto pr-1">
              {expenseByCategory.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-gray-600 dark:text-gray-400 truncate">{cat.icon} {cat.label}</span>
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white shrink-0 ml-2">
                    {formatCurrency(cat.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions for the Selected Month */}
      {monthlyRecent.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Recent in {viewDate.toLocaleDateString('en-US', { month: 'long' })}</h3>
          <div className="space-y-3">
            {monthlyRecent.map((t) => {
              const cat = getCategoryById(t.category)
              return (
                <div key={t.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cat.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{cat.label}</p>
                      <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                  </div>
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
                </div>
              )
            })}
          </div>
        </div>
      )}

      {monthlyRecent.length === 0 && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <Calendar size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No activity this month</p>
          <p className="text-sm">Tap the + button to add your first transaction</p>
        </div>
      )}
    </div>
  )
}
