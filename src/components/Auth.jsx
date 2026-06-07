import React, { useState } from 'react'
import { Lock, User, ArrowRight, ShieldCheck, UserPlus, Mail, UserRound, Send } from 'lucide-react'
import { loginUser, createUser, checkUserExists, verifyUserEmail, updateUserDetails } from '../utils/storage'
import emailjs from '@emailjs/browser'

export default function Auth({ onLogin }) {
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [isVerificationMode, setIsVerificationMode] = useState(false)
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false)
  const [isResetMode, setIsResetMode] = useState(false)
  
  const [verificationCode, setVerificationCode] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [generatedResetCode, setGeneratedResetCode] = useState(null)
  
  const [isSending, setIsSending] = useState(false)
  const [pendingUser, setPendingUser] = useState(null)
  
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [email, setEmail] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleVerify = (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    
    if (!verificationCode) {
      setError('Please enter the confirmation code')
      return
    }
    
    if (pendingUser && pendingUser.code === verificationCode) {
      const result = createUser(pendingUser.username, pendingUser.password, pendingUser.email, pendingUser.firstName, pendingUser.lastName, pendingUser.age, pendingUser.gender)
      if (result.success) {
        setSuccessMsg('Account verified and created successfully! You can now log in.')
        setIsVerificationMode(false)
        setIsLoginMode(true)
        setPassword('')
        setEmail('')
        setFirstName('')
        setLastName('')
        setAge('')
        setGender('')
        setVerificationCode('')
        setPendingUser(null)
      } else {
        setError(result.error)
      }
    } else {
      setError('Invalid confirmation code.')
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    
    if (!username || !password) {
      setError('Both Username and Password are required')
      return
    }
    const result = loginUser(username, password)
    if (result.success) {
      onLogin()
    } else {
      setError(result.error)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    if (!firstName || !lastName || !username || !email || !age || !gender || !password) {
      setError('All fields are required to create an account')
      return
    }
    if (password.length < 6 || password.length > 20) {
      setError('Password must be between 6 and 20 characters')
      return
    }
    const alphanumericRegex = /^[a-zA-Z0-9]+$/
    if (!alphanumericRegex.test(password)) {
      setError('Password can only contain letters and numbers')
      return
    }
    if (checkUserExists(username)) {
      setError('Username already exists')
      return
    }
    
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    console.log("DEBUG: Generated Confirmation Code:", code) 
    
    setIsSending(true)
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_email: email,
          to_name: `${firstName} ${lastName}`,
          confirmation_code: code,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      
      setPendingUser({
        username,
        password,
        email,
        firstName,
        lastName,
        age,
        gender,
        code
      })
      
      setSuccessMsg(`A 6-digit code has been sent to ${email}.`)
      setIsVerificationMode(true)
      setIsLoginMode(false)
    } catch (err) {
      console.error('EmailJS Error:', err)
      setError('Failed to send activation email. Please check your connection and try again.')
    } finally {
      setIsSending(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!username || !email) {
      setError('Please enter both your username and email address.')
      return
    }

    const verify = verifyUserEmail(username, email)
    if (!verify.success) {
      setError(verify.error)
      return
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    console.log("DEBUG: Generated Reset Code:", code)

    setIsSending(true)
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_email: email,
          to_name: username,
          confirmation_code: code,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )

      setGeneratedResetCode(code)
      setSuccessMsg(`A 6-digit reset code has been sent to ${email}.`)
      setIsForgotPasswordMode(false)
      setIsResetMode(true)
    } catch (err) {
      console.error('EmailJS Error:', err)
      setError('Failed to send reset email. Please check your connection and try again.')
    } finally {
      setIsSending(false)
    }
  }

  const handleResetPassword = (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!resetCode || !newPassword) {
      setError('Please enter the reset code and your new password.')
      return
    }

    if (resetCode !== generatedResetCode) {
      setError('Invalid reset code.')
      return
    }

    if (newPassword.length < 6 || newPassword.length > 20) {
      setError('Password must be between 6 and 20 characters')
      return
    }
    
    const alphanumericRegex = /^[a-zA-Z0-9]+$/
    if (!alphanumericRegex.test(newPassword)) {
      setError('Password can only contain letters and numbers')
      return
    }

    const updated = updateUserDetails(username, { password: newPassword })
    if (updated) {
      setSuccessMsg('Password reset successfully! You can now log in.')
      setIsResetMode(false)
      setIsLoginMode(true)
      setPassword('')
      setNewPassword('')
      setResetCode('')
      setGeneratedResetCode(null)
    } else {
      setError('An error occurred while resetting your password.')
    }
  }

  const toggleMode = () => {
    if (isVerificationMode || isForgotPasswordMode || isResetMode) {
      setIsVerificationMode(false)
      setIsForgotPasswordMode(false)
      setIsResetMode(false)
      setIsLoginMode(true)
    } else {
      setIsLoginMode(!isLoginMode)
    }
    setError('')
    setSuccessMsg('')
    setPassword('')
    setNewPassword('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] p-8 rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-xl rounded-bl-xl transition-all duration-500">
        
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-emerald-500/20 text-emerald-600 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md flex items-center justify-center mb-4 backdrop-blur-sm border border-emerald-500/30 transition-all">
            {isVerificationMode || isResetMode || isForgotPasswordMode ? <ShieldCheck size={32} /> : (isLoginMode ? <ShieldCheck size={32} /> : <UserPlus size={32} />)}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {isVerificationMode ? 'Verify Email' : isResetMode ? 'Reset Password' : isForgotPasswordMode ? 'Recover Account' : isLoginMode ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {isVerificationMode
              ? 'Enter the 6-digit code sent to your email.'
              : isResetMode
                ? 'Enter the reset code and your new password.'
                : isForgotPasswordMode
                  ? 'Enter your username and email to receive a reset code.'
                  : isLoginMode
                    ? 'Enter your credentials to access your local data.'
                    : 'Setup a new local profile on this device.'}
          </p>
        </div>

        <form onSubmit={isVerificationMode ? handleVerify : isResetMode ? handleResetPassword : isForgotPasswordMode ? handleForgotPassword : isLoginMode ? handleLogin : handleSignup} className="space-y-4">
          
          {isVerificationMode ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 pl-2">Confirmation Code</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-white/40 dark:border-gray-700 rounded-tl-xl rounded-br-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-sm transition-all text-gray-800 dark:text-white text-center tracking-widest text-lg font-bold"
                  placeholder="123456"
                />
              </div>
            </div>
          ) : isResetMode ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 pl-2">Reset Code</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    maxLength={6}
                    className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-white/40 dark:border-gray-700 rounded-tl-xl rounded-br-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-sm transition-all text-gray-800 dark:text-white text-center tracking-widest text-lg font-bold"
                    placeholder="123456"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 pl-2">New Password / PIN</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    maxLength={20}
                    className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-white/40 dark:border-gray-700 rounded-tl-xl rounded-br-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-sm transition-all text-gray-800 dark:text-white"
                    placeholder="Enter new password"
                  />
                </div>
              </div>
            </>
          ) : isForgotPasswordMode ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 pl-2">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-white/40 dark:border-gray-700 rounded-tl-xl rounded-br-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-sm transition-all text-gray-800 dark:text-white"
                    placeholder="Your username"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 pl-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-white/40 dark:border-gray-700 rounded-tl-xl rounded-br-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-sm transition-all text-gray-800 dark:text-white"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {!isLoginMode && (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 pl-2">First Name</label>
                      <div className="relative">
                        <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-white/40 dark:border-gray-700 rounded-tl-xl rounded-br-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-sm transition-all text-gray-800 dark:text-white"
                          placeholder="First"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 pl-2">Last Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-white/40 dark:border-gray-700 rounded-tl-xl rounded-br-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-sm transition-all text-gray-800 dark:text-white"
                          placeholder="Last"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1/3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 pl-2">Age</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-white/40 dark:border-gray-700 rounded-tl-xl rounded-br-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-sm transition-all text-gray-800 dark:text-white"
                          placeholder="Age"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 pl-2">Gender</label>
                      <div className="relative">
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-white/40 dark:border-gray-700 rounded-tl-xl rounded-br-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-sm transition-all text-gray-800 dark:text-white appearance-none"
                        >
                          <option value="" disabled>Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
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

              {!isLoginMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 pl-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-white/40 dark:border-gray-700 rounded-tl-xl rounded-br-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-sm transition-all text-gray-800 dark:text-white"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              )}

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
                {isLoginMode && (
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoginMode(false)
                        setIsForgotPasswordMode(true)
                        setError('')
                        setSuccessMsg('')
                      }}
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 dark:bg-red-900/20 py-2 rounded-lg">{error}</p>}
          {successMsg && <p className="text-emerald-600 text-sm text-center font-medium bg-emerald-50 dark:bg-emerald-900/20 py-2 rounded-lg">{successMsg}</p>}

          <button
            type="submit"
            disabled={isSending}
            className="w-full mt-4 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg shadow-emerald-600/30 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {isVerificationMode || isResetMode
              ? 'Verify Code'
              : isForgotPasswordMode
                ? (isSending ? 'Sending Code...' : 'Send Reset Code')
                : isLoginMode
                  ? 'Access Account'
                  : (isSending ? 'Sending Code...' : 'Create Profile')}
            {isVerificationMode || isLoginMode || isResetMode ? <ArrowRight size={20} /> : <Send size={18} className={isSending ? "animate-pulse" : ""} />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-300 transition-colors"
          >
            {isVerificationMode || isForgotPasswordMode || isResetMode
              ? "Back to Login"
              : (isLoginMode
                ? "Don't have an account? Create one."
                : "Already have an account? Log in.")}
          </button>
        </div>
      </div>
    </div>
  )
}
