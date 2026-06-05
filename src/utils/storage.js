const USERS_KEY = 'spendwise_users'
const ACTIVE_USER_KEY = 'spendwise_active_user'

// --- AUTHENTICATION ---
export function getActiveUser() {
  return localStorage.getItem(ACTIVE_USER_KEY)
}

export function logoutUser() {
  localStorage.removeItem(ACTIVE_USER_KEY)
}

export function loginUser(username, password) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}')
  const normalizedUsername = username.trim().toLowerCase()
  
  if (!users[normalizedUsername]) {
    return { success: false, error: 'User does not exist. Please create an account.' }
  }
  
  if (users[normalizedUsername] === password) {
    localStorage.setItem(ACTIVE_USER_KEY, normalizedUsername)
    return { success: true }
  }
  
  return { success: false, error: 'Incorrect password' }
}

export function createUser(username, password) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}')
  const normalizedUsername = username.trim().toLowerCase()
  
  if (users[normalizedUsername]) {
    return { success: false, error: 'Username already exists' }
  }
  
  users[normalizedUsername] = password
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  // Note: We do NOT set the ACTIVE_USER_KEY here, so they aren't auto-logged in.
  return { success: true }
}

// Dynamically prefix keys based on who is logged in
function getPrefix() {
  const user = getActiveUser()
  return user ? `spendwise_${user}_` : 'spendwise_'
}

// --- TRANSACTIONS ---
export function getTransactions() {
  const data = localStorage.getItem(getPrefix() + 'transactions')
  return data ? JSON.parse(data) : []
}

export function saveTransactions(transactions) {
  localStorage.setItem(getPrefix() + 'transactions', JSON.stringify(transactions))
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

// --- BUDGETS ---
export function getBudgets() {
  const data = localStorage.getItem(getPrefix() + 'budgets')
  return data ? JSON.parse(data) : []
}

export function saveBudgets(budgets) {
  localStorage.setItem(getPrefix() + 'budgets', JSON.stringify(budgets))
}

export function setBudget(categoryId, amount, monthKey) {
  const budgets = getBudgets()
  // Check if a budget already exists for this category AND this specific month
  const existing = budgets.findIndex(b => b.categoryId === categoryId && b.monthKey === monthKey)
  if (existing >= 0) {
    budgets[existing].amount = amount
  } else {
    budgets.push({ categoryId, amount, monthKey })
  }
  saveBudgets(budgets)
  return budgets
}

export function deleteBudget(categoryId, monthKey) {
  // Only delete the budget for the specific month
  const budgets = getBudgets().filter(b => !(b.categoryId === categoryId && b.monthKey === monthKey))
  saveBudgets(budgets)
  return budgets
}

// --- DATA TRANSFER (IMPORT / EXPORT) ---
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
  a.download = `${getPrefix()}export_${new Date().toISOString().slice(0, 10)}.csv` 
  a.click()
  URL.revokeObjectURL(url)
  return true
}

export function exportAllData() {
  // Only exports the logged-in user's data (does not export passwords)
  const data = {
    transactions: getTransactions(),
    budgets: getBudgets(),
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${getPrefix()}backup_${new Date().toISOString().slice(0, 10)}.json` 
  a.click()
  URL.revokeObjectURL(url)
  return true
}

export async function importAllData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (data.transactions) saveTransactions(data.transactions)
        if (data.budgets) saveBudgets(data.budgets)
        resolve(true)
      } catch (error) {
        reject(new Error('Invalid backup file formatting.'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read the file.'))
    reader.readAsText(file)
  })
}

// --- ADMIN FUNCTIONS ---
export function getAllUsers() {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}')
  // Convert the object into an array and filter out the 'admin' account itself
  return Object.entries(users)
    .map(([username, password]) => ({ username, password }))
    .filter(u => u.username !== 'admin')
}

export function updateUserPassword(targetUsername, newPassword) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}')
  if (users[targetUsername]) {
    users[targetUsername] = newPassword
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    return true
  }
  return false
}

export function deleteUserAccount(targetUsername) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}')
  if (users[targetUsername]) {
    // 1. Remove from the user list
    delete users[targetUsername]
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    
    // 2. Erase their specific data scopes
    localStorage.removeItem(`spendwise_${targetUsername}_transactions`)
    localStorage.removeItem(`spendwise_${targetUsername}_budgets`)
    return true
  }
  return false
}
