import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { getTransactions } from '../utils/storage'
import { getCategoryById, EXPENSE_CATEGORIES } from '../constants/categories'

export default function Dashboard() {
  const transactions = getTransactions()

  const { totalIncome, totalExpenses, balance, recentTransactions, expenseByCategory, monthlyData } = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    let income = 0
    let expenses = 0
    const categoryMap = {}
    const monthMap = {}

    transactions.forEach(t => {
      const d = new Date(t.date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

      if (!monthMap[key]) monthMap[key] = { month: key, income: 0, expenses: 0 }
      if (t.type === 'income') {
        income += t.amount
        monthMap[key].income += t.amount
      } else {
        expenses += t.amount
        monthMap[key].expenses += t.amount
        const cat = getCategoryById(t.category)
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount
      }
    })

    const expenseByCategory = Object.entries(categoryMap).map(([id, amount]) => ({
      ...getCategoryById(id),
      value: amount,
    }))

    const monthlyData = Object.values(monthMap)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)

    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
      recentTransactions: transactions.slice(0, 5),
      expenseByCategory,
      monthlyData,
    }
  }, [transactions])

  const formatCurrency = (val) => `₱${val.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="space-y-5">
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

      {/* Monthly Chart */}
      {monthlyData.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Monthly Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => `$${v}`} />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Expense Breakdown */}
      {expenseByCategory.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Expense Breakdown</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie data={expenseByCategory} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={65}>
                  {expenseByCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `$${v}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5 max-h-40 overflow-y-auto">
              {expenseByCategory.slice(0, 5).map((cat) => (
                <div key={cat.id} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-gray-600 dark:text-gray-400">{cat.icon} {cat.label}</span>
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(cat.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Recent Transactions</h3>
          <div className="space-y-3">
            {recentTransactions.map((t) => {
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

      {transactions.length === 0 && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <Wallet size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No transactions yet</p>
          <p className="text-sm">Tap the + button to add your first transaction</p>
        </div>
      )}
    </div>
  )
}
