const TRANSACTIONS_KEY = 'spendwise_transactions'
const BUDGETS_KEY = 'spendwise_budgets'

export function getTransactions() {
  const data = localStorage.getItem(TRANSACTIONS_KEY)
  return data ? JSON.parse(data) : []
}

export function saveTransactions(transactions) {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions))
}

export function addTransaction(transaction) {
  const transactions = getTransactions()
  const newTransaction = {
    ...transaction,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  transactions.unshift(newTransaction)
  saveTransactions(transactions)
  return newTransaction
}

export function deleteTransaction(id) {
  const transactions = getTransactions().filter(t => t.id !== id)
  saveTransactions(transactions)
  return transactions
}

export function getBudgets() {
  const data = localStorage.getItem(BUDGETS_KEY)
  return data ? JSON.parse(data) : []
}

export function saveBudgets(budgets) {
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets))
}

export function setBudget(categoryId, amount) {
  const budgets = getBudgets()
  const existing = budgets.findIndex(b => b.categoryId === categoryId)
  if (existing >= 0) {
    budgets[existing].amount = amount
  } else {
    budgets.push({ categoryId, amount })
  }
  saveBudgets(budgets)
  return budgets
}

export function deleteBudget(categoryId) {
  const budgets = getBudgets().filter(b => b.categoryId !== categoryId)
  saveBudgets(budgets)
  return budgets
}

export function exportToCSV() {
  const transactions = getTransactions()
  if (transactions.length === 0) return false

  const headers = ['Date', 'Type', 'Category', 'Amount', 'Note']
  const rows = transactions.map(t => [
    new Date(t.date).toLocaleDateString(),
    t.type,
    t.category,
    t.amount,
    t.note || '',
  ])

  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `spendwise_export_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  return true
}
