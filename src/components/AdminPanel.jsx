import React, { useState, useEffect } from 'react'
import { Users, Key, Trash2, Shield, Save, X, Mail, UserRound, User } from 'lucide-react'
import { getAllUsers, updateUserDetails, deleteUserAccount } from '../utils/storage'

export default function AdminPanel({ showToast }) {
  const [users, setUsers] = useState([])
  const [editingUser, setEditingUser] = useState(null)
  
  // Hold all edit fields in a single state object
  const [editData, setEditData] = useState({ password: '', email: '', firstName: '', lastName: '', age: '', gender: '' })

  const loadUsers = () => {
    setUsers(getAllUsers())
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleEditClick = (user) => {
    setEditingUser(user.username)
    setEditData({
      password: user.password || '',
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      age: user.age || '',
      gender: user.gender || ''
    })
  }

  const handleSaveData = (username) => {
    if (!editData.password.trim()) {
      showToast('Password cannot be empty', 'warning')
      return
    }
    updateUserDetails(username, editData)
    setEditingUser(null)
    loadUsers()
    showToast(`Details updated for ${username}`, 'success')
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
              className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 p-5 rounded-tl-3xl rounded-br-3xl rounded-tr-xl rounded-bl-xl shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4 transition-all"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 mt-1 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0">
                  <Users size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 dark:text-white capitalize text-lg">{user.firstName ? `${user.firstName} ${user.lastName}` : user.username}</h3>
                  
                  {editingUser === user.username ? (
                    <div className="mt-3 space-y-2 max-w-sm">
                      <div className="flex items-center gap-2">
                        <UserRound size={16} className="text-gray-400 w-5" />
                        <input
                          type="text"
                          value={editData.firstName}
                          onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                          className="flex-1 bg-white/60 dark:bg-gray-900/60 border border-emerald-500/30 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white"
                          placeholder="First Name"
                          autoFocus
                        />
                        <input
                          type="text"
                          value={editData.lastName}
                          onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                          className="flex-1 bg-white/60 dark:bg-gray-900/60 border border-emerald-500/30 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white"
                          placeholder="Last Name"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400 w-5" />
                        <input
                          type="text"
                          value={user.username}
                          disabled
                          className="flex-1 bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          title="Username cannot be changed as it is the unique account identifier"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400 w-5" />
                        <input
                          type="email"
                          value={editData.email}
                          onChange={(e) => setEditData({...editData, email: e.target.value})}
                          className="flex-1 bg-white/60 dark:bg-gray-900/60 border border-emerald-500/30 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white"
                          placeholder="Email"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <UserRound size={16} className="text-gray-400 w-5" opacity={0} />
                        <input
                          type="number"
                          value={editData.age}
                          onChange={(e) => setEditData({...editData, age: e.target.value})}
                          className="w-20 bg-white/60 dark:bg-gray-900/60 border border-emerald-500/30 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white"
                          placeholder="Age"
                        />
                        <select
                          value={editData.gender}
                          onChange={(e) => setEditData({...editData, gender: e.target.value})}
                          className="flex-1 bg-white/60 dark:bg-gray-900/60 border border-emerald-500/30 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white appearance-none"
                        >
                          <option value="" disabled>Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <Key size={16} className="text-gray-400 w-5" />
                        <input
                          type="text"
                          value={editData.password}
                          onChange={(e) => setEditData({...editData, password: e.target.value})}
                          className="flex-1 bg-white/60 dark:bg-gray-900/60 border border-emerald-500/30 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white"
                          placeholder="Password / PIN"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 pt-2">
                        <button onClick={() => handleSaveData(user.username)} className="flex items-center gap-1 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-800/60 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                          <Save size={14} /> Save
                        </button>
                        <button onClick={() => setEditingUser(null)} className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                          <X size={14} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
                      {user.firstName && (
                        <div className="flex items-center gap-2">
                          <UserRound size={14} />
                          <span className="w-16 font-medium text-gray-600 dark:text-gray-300">Name:</span>
                          <span>{user.firstName} {user.lastName}</span>
                        </div>
                      )}
                      {user.age && (
                        <div className="flex items-center gap-2">
                          <UserRound size={14} />
                          <span className="w-16 font-medium text-gray-600 dark:text-gray-300">Age:</span>
                          <span>{user.age}</span>
                        </div>
                      )}
                      {user.gender && (
                        <div className="flex items-center gap-2">
                          <UserRound size={14} />
                          <span className="w-16 font-medium text-gray-600 dark:text-gray-300">Gender:</span>
                          <span>{user.gender}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <User size={14} />
                        <span className="w-16 font-medium text-gray-600 dark:text-gray-300">Username:</span>
                        <span>{user.username}</span>
                      </div>
                      {user.email && (
                        <div className="flex items-center gap-2">
                          <Mail size={14} />
                          <span className="w-16 font-medium text-gray-600 dark:text-gray-300">Email:</span>
                          <span>{user.email}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Key size={14} />
                        <span className="w-16 font-medium text-gray-600 dark:text-gray-300">PIN:</span>
                        <span className="font-mono bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded text-xs tracking-wider">
                          {user.password}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto shrink-0 mt-4 md:mt-0">
                {editingUser !== user.username && (
                  <>
                    <button
                      onClick={() => handleEditClick(user)}
                      className="px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                    >
                      Edit Info
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
