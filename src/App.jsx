import { useState, useCallback } from 'react'
import { Home, PlusCircle, List, Target, Download, Moon, Sun } from 'lucide-react'
import Dashboard from './components/Dashboard'
import Transactions from './components/Transactions'
import Budgets from './components/Budgets'
import TransactionForm from './components/TransactionForm'
import { exportToCSV } from './utils/storage'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showForm, setShowForm] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const prefersDark = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    if (prefersDark) document.documentElement.classList.add('dark')
    return prefersDark
  })
  const [refreshKey, setRefreshKey] = useState(0)
  const [toast, setToast] = useState(null)

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark')
      localStorage.theme = 'light'
    } else {
      document.documentElement.classList.add('dark')
      localStorage.theme = 'dark'
    }
    setDarkMode(!darkMode)
  }

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-600">SpendWise</h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4">
        {activeTab === 'dashboard' && <Dashboard key={refreshKey} />}
        {activeTab === 'transactions' && <Transactions key={refreshKey} />}
        {activeTab === 'budgets' && <Budgets key={refreshKey} />}
      </main>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-20 right-6 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 transition-all active:scale-95 z-50"
      >
        <PlusCircle size={28} />
      </button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
        <div className="max-w-2xl mx-auto grid grid-cols-4 text-xs">
          {[
            { icon: Home, label: 'Home', tab: 'dashboard' },
            { icon: List, label: 'Transactions', tab: 'transactions' },
            { icon: Target, label: 'Budgets', tab: 'budgets' },
            { icon: Download, label: 'Export', tab: 'export' },
          ].map(({ icon: Icon, label, tab }) => (
            <button
              key={tab}
              onClick={() => {
                if (tab === 'export') {
                  const hasData = exportToCSV()
                  if (!hasData) showToast('No transactions to export', 'warning')
                  else showToast('CSV exported!', 'success')
                } else {
                  setActiveTab(tab)
                }
              }}
              className={`py-3 flex flex-col items-center ${activeTab === tab ? 'text-emerald-600' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <Icon size={22} />
              <span className="mt-1">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl text-sm font-medium shadow-lg transition-all ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : toast.type === 'warning' ? 'bg-amber-500 text-white' : 'bg-gray-800 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Transaction Form Modal */}
      {showForm && <TransactionForm onClose={() => { setShowForm(false); refresh() }} />}
    </div>
  )
}

export default App