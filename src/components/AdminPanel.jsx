import React, { useState, useEffect } from 'react'
import { Users, Key, Trash2, Shield, Save, X } from 'lucide-react'
import { getAllUsers, updateUserPassword, deleteUserAccount } from '../utils/storage'

export default function AdminPanel({ showToast }) {
  const [users, setUsers] = useState([])
  const [editingUser, setEditingUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')

  const loadUsers = () => {
    setUsers(getAllUsers())
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleEditClick = (username, currentPassword) => {
    setEditingUser(username)
    setNewPassword(currentPassword)
  }

  const handleSavePassword = (username) => {
    if (!newPassword.trim()) {
      showToast('Password cannot be empty', 'warning')
      return
    }
    updateUserPassword(username, newPassword)
    setEditingUser(null)
    loadUsers()
    showToast(`Password updated for ${username}`, 'success')
  }

  const handleDelete = (username) => {
    if (window.confirm(`Are you sure you want to completely delete '${username}' and ALL their data? This cannot be undone.`)) {
      deleteUserAccount(username)
      loadUsers()
      showToast(`Account ${username} deleted`, 'success')
    }
  }

  return (
    <div className="pb-10 animate-in fade-in zoom-in duration-300">
      <div className="flex items-center gap-3 mb-8 bg-emerald-600/10 dark:bg-emerald-500/10 p-6 rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-xl rounded-bl-xl border border-emerald-500/20">
        <Shield size={32} className="text-emerald-600 dark:text-emerald-400" />
        <div>
          <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">Admin Dashboard</h2>
          <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">Manage local users and access credentials</p>
        </div>
      </div>

      <div className="space-y-4">
        {users.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl border border-white/50 dark:border-gray-700/50">
            <Users size={48} className="mx-auto mb-3 opacity-50" />
            <p>No other local users found.</p>
          </div>
        ) : (
          users.map((user) => (
            <div 
              key={user.username} 
              className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 p-5 rounded-tl-3xl rounded-br-3xl rounded-tr-xl rounded-bl-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white capitalize">{user.username}</h3>
                  
                  {editingUser === user.username ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Key size={14} className="text-gray-400" />
                      <input
                        type="text"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-white/60 dark:bg-gray-900/60 border border-emerald-500/30 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white w-32"
                        autoFocus
                      />
                      <button onClick={() => handleSavePassword(user.username)} className="text-emerald-600 hover:text-emerald-700 p-1">
                        <Save size={16} />
                      </button>
                      <button onClick={() => setEditingUser(null)} className="text-red-500 hover:text-red-600 p-1">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <Key size={14} />
                      <span className="font-mono bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded text-xs tracking-wider">
                        {user.password}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                {editingUser !== user.username && (
                  <>
                    <button
                      onClick={() => handleEditClick(user.username, user.password)}
                      className="px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                    >
                      Edit Pass
                    </button>
                    <button
                      onClick={() => handleDelete(user.username)}
                      className="p-2 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                      title="Delete User Data"
                    >
                      <Trash2 size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
