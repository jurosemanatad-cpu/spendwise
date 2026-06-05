import React, { useState } from 'react'
import { Lock, User, ArrowRight, ShieldCheck, UserPlus } from 'lucide-react'
import { loginUser, createUser } from '../utils/storage'

export default function Auth({ onLogin }) {
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!username || !password) {
      setError('Both Username and Password are required')
      return
    }

    if (isLoginMode) {
      // Handle Login
      const result = loginUser(username, password)
      if (result.success) {
        onLogin()
      } else {
        setError(result.error)
      }
    } else {
      // Handle Account Creation
      
      // Password Validation
      if (password.length < 6 || password.length > 20) {
        setError('Password must be between 6 and 20 characters')
        return
      }
      
      // Regex check: only allows a-z, A-Z, and 0-9
      const alphanumericRegex = /^[a-zA-Z0-9]+$/
      if (!alphanumericRegex.test(password)) {
        setError('Password can only contain letters and numbers')
        return
      }

      const result = createUser(username, password)
      if (result.success) {
        setSuccessMsg('Account created successfully! Please log in.')
        setIsLoginMode(true) // Return to login screen
        setPassword('') // Clear the password field for safety
      } else {
        setError(result.error)
      }
    }
  }

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode)
    setError('')
    setSuccessMsg('')
    setPassword('') // Clear password when switching screens
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] p-8 rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-xl rounded-bl-xl transition-all duration-500">
        
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-emerald-500/20 text-emerald-600 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md flex items-center justify-center mb-4 backdrop-blur-sm border border-emerald-500/30 transition-all">
            {isLoginMode ? <ShieldCheck size={32} /> : <UserPlus size={32} />}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {isLoginMode 
              ? 'Enter your credentials to access your local data.' 
              : 'Setup a new local profile on this device.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 pl-2">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-white/40 dark:border-gray-700 rounded-tl-xl rounded-br-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-sm transition-all text-gray-800 dark:text-white"
                placeholder={isLoginMode ? "Your username" : "Choose a username"}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 pl-2">Password / PIN</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={20}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-white/40 dark:border-gray-700 rounded-tl-xl rounded-br-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-sm transition-all text-gray-800 dark:text-white"
                placeholder={isLoginMode ? "Enter your password" : "Create a password"}
              />
            </div>
            {!isLoginMode && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 pl-2">
                Must be 6-20 characters long and contain only letters and numbers.
              </p>
            )}
          </div>

          {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 dark:bg-red-900/20 py-2 rounded-lg">{error}</p>}
          {successMsg && <p className="text-emerald-600 text-sm text-center font-medium bg-emerald-50 dark:bg-emerald-900/20 py-2 rounded-lg">{successMsg}</p>}

          <button
            type="submit"
            className="w-full mt-4 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg shadow-emerald-600/30 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {isLoginMode ? 'Access Account' : 'Create Profile'}
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
          >
            {isLoginMode 
              ? "Don't have an account? Create one." 
              : "Already have an account? Log in."}
          </button>
        </div>
      </div>
    </div>
  )
}
