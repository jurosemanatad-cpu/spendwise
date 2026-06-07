import { useMemo, useState } from 'react'
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { getTransactions } from '../utils/storage'
import { getCategoryById } from '../constants/categories'

export default function Dashboard() {
  const transactions = getTransactions()
  const [viewDate, setViewDate] = useState(new Date())

  const { totalIncome, totalExpenses, balance, monthlyRecent, expenseByCategory, monthlyData } = useMemo(() => {
    const viewMonth = viewDate.getMonth()
    const viewYear = viewDate.getFullYear()

    let income = 0
    let expenses = 0
    const categoryMap = {}
    const monthMap = {}

    for (let i = 5; i >= 0; i--) {
      const d = new Date(viewYear, viewMonth - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` 
      const label = d.toLocaleDateString('en-US', { month: 'short' }) 
      monthMap[key] = { month: label, fullKey: key, income: 0, expenses: 0 }
    }

    const currentMonthTransactions = []

    transactions.forEach(t => {
      const d = new Date(t.date)
      const tMonth = d.getMonth()
      const tYear = d.getFullYear()
      const key = `${tYear}-${String(tMonth + 1).padStart(2, '0')}` 

      if (monthMap[key]) {
        if (t.type === 'income') monthMap[key].income += t.amount
        else monthMap[key].expenses += t.amount
      }

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
      monthlyRecent: currentMonthTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
      expenseByCategory,
      monthlyData: Object.values(monthMap)
    }
  }, [transactions, viewDate])

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))

  const formatCurrency = (val) => `₱${val.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 

  const leafCardStyle = "bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-lg rounded-tr-[3rem] rounded-bl-[3rem] rounded-tl-xl rounded-br-xl p-5 transition-all hover:bg-white/50 dark:hover:bg-gray-800/50"

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header Controls */}
      <div className="flex items-center justify-between gap-4">
        {/* Month Navigator */}
        <div className="flex items-center justify-between bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-white/20 rounded-full px-2 py-1.5 shadow-sm w-full">
          <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-white/60 dark:hover:bg-gray-700/60 text-emerald-600 dark:text-emerald-400 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-white px-4">
            <Calendar size={18} className="text-emerald-500" />
            {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-white/60 dark:hover:bg-gray-700/60 text-emerald-600 dark:text-emerald-400 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* --- AREA TO BE CAPTURED IN PDF --- */}
      <div id="report-content" className="space-y-6 p-4 -m-4">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className={leafCardStyle}>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
              <TrendingUp size={20} />
              <span className="text-sm font-medium">Budget</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalIncome)}</p>
          </div>
          <div className={leafCardStyle}>
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <TrendingDown size={20} />
              <span className="text-sm font-medium">Expenses</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>

        {/* Balance */}
        <div className={leafCardStyle}>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-2">
            <Wallet size={20} />
            <span className="text-sm font-medium">Net Balance</span>
          </div>
          <p className={`text-4xl font-bold ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
            {formatCurrency(balance)}
          </p>
        </div>

        {/* Monthly Chart (6-Month Trend) */}
        {monthlyData.some(d => d.income > 0 || d.expenses > 0) && (
          <div className={leafCardStyle}>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-6">6-Month Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${v}`} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expenses" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Expense Breakdown */}
          {expenseByCategory.length > 0 && (
            <div className={leafCardStyle}>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Where your money went</h3>
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={expenseByCategory} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={40} outerRadius={70} stroke="none">
                      {expenseByCategory.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `₱${v.toLocaleString()}`} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full space-y-3 mt-4">
                  {expenseByCategory.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: cat.color }} />
                        <span className="text-gray-700 dark:text-gray-300">{cat.icon} {cat.label}</span>
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(cat.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          {monthlyRecent.length > 0 && (
            <div className={leafCardStyle}>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-5">Recent in {viewDate.toLocaleDateString('en-US', { month: 'long' })}</h3>
              <div className="space-y-4">
                {monthlyRecent.map((t) => {
                  const cat = getCategoryById(t.category)
                  return (
                    <div key={t.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/40 dark:hover:bg-gray-700/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl drop-shadow-sm">{cat.icon}</span>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{cat.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(t.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {t.type === 'income' ? (
                          <ArrowUpRight size={16} className="text-emerald-500" />
                        ) : (
                          <ArrowDownRight size={16} className="text-red-500" />
                        )}
                        <span className={`text-base font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {monthlyRecent.length === 0 && (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500 bg-white/20 dark:bg-gray-800/20 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
            <Calendar size={48} className="mx-auto mb-4 opacity-40" />
            <p className="text-xl font-semibold mb-1">No activity this month</p>
            <p className="text-sm">Tap the + button to add your first transaction</p>
          </div>
        )}

      </div>
    </div>
  )
}
