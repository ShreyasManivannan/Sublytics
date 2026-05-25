import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Wallet,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Sparkles,
  TrendingUp,
  BellRing,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import useAuthStore from '../store/authStore'

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)
  const googleLogin = useAuthStore((s) => s.googleLogin)
  const isLoading = useAuthStore((s) => s.isLoading)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password || (isRegister && !name)) {
      setError('Please fill in all fields')
      return
    }
    try {
      const res = isRegister
        ? await register(name, email, password)
        : await login(email, password)
      if (res.success) {
        navigate('/dashboard')
      } else {
        setError(res.message || 'Authentication failed')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    try {
      const res = await googleLogin()
      if (res.success) navigate('/dashboard')
    } catch {
      setError('Google login failed')
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex relative overflow-hidden bg-grid">
      {/* Background Nebulas */}
      <div className="cyber-bg">
        <div className="nebula-indigo"></div>
        <div className="nebula-rose"></div>
        <div className="nebula-cyan"></div>
      </div>

      {/* LEFT COLUMN: Visual Showcase (Hidden on Mobile/Tablet) */}
      <div className="hidden lg:flex lg:w-7/12 p-12 flex-col justify-between relative z-10 border-r border-border-default/30 bg-slate-950/20">
        {/* Logo/Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent/15 text-accent border border-accent/25 shadow-lg shadow-accent/10">
            <Wallet className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-text-primary gradient-text uppercase">
            Sublytics
          </span>
        </div>

        {/* Hero Features & Showcase */}
        <div className="my-auto space-y-12 max-w-xl">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-xs font-bold text-accent animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>v1.2.0 • AI-Powered Scan Live</span>
            </div>
            <h1 className="text-5xl font-extrabold leading-[1.1] text-text-primary tracking-tight">
              Command your <span className="text-accent bg-clip-text">subscriptions</span> with financial intelligence
            </h1>
            <p className="text-base text-text-secondary leading-relaxed">
              Track recurring expenses, receive automatic alerts before billing dates, and optimize monthly cash flow using smart invoice extraction.
            </p>
          </div>

          {/* Miniature Interactive Dashboard Preview */}
          <div className="card p-6 border border-border-default/80 bg-slate-900/40 space-y-5 shadow-2xl relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl pointer-events-none group-hover:bg-accent/10 transition-all duration-500"></div>

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs text-text-secondary uppercase font-bold tracking-wider">Active Spending</p>
                <p className="text-2xl font-extrabold text-text-primary">$182.40<span className="text-xs text-text-secondary font-medium">/mo</span></p>
              </div>
              <span className="badge badge-success text-[10px] py-1 font-bold">+12% savings this month</span>
            </div>

            {/* Subscriptions List Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-border-default/50 hover:border-accent/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 font-bold text-xs">N</div>
                  <div>
                    <p className="text-xs font-bold text-text-primary">Netflix Premium</p>
                    <p className="text-[10px] text-text-secondary">Renews in 3 days</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-text-primary">$15.99</p>
                  <p className="text-[9px] text-success font-medium">Autopay On</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-border-default/50 hover:border-accent/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 font-bold text-xs">S</div>
                  <div>
                    <p className="text-xs font-bold text-text-primary">Spotify Family</p>
                    <p className="text-[10px] text-text-secondary">Renews in 5 days</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-text-primary">$14.99</p>
                  <p className="text-[9px] text-success font-medium">Autopay On</p>
                </div>
              </div>
            </div>

            {/* Smart Insight Note */}
            <div className="flex gap-3 p-3 rounded-xl bg-purple/10 border border-purple/20 text-xs">
              <Zap className="w-4 h-4 text-purple flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-text-primary">AI recommendation</p>
                <p className="text-[11px] text-text-secondary mt-0.5">Switch Spotify to annual billing to save $24.00 yearly.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center gap-6 text-xs text-text-secondary">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span>Bank-grade security</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BellRing className="w-4 h-4 text-accent" />
            <span>Smart reminders</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Auth Card container */}
      <div className="w-full lg:w-5/12 flex flex-col justify-center items-center px-4 md:px-8 py-12 relative z-10">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="flex flex-col items-center mb-8 lg:hidden">
          <div className="p-3 rounded-2xl bg-accent/15 text-accent border border-accent/20 mb-3 shadow-lg">
            <Wallet className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
            Sublytics
          </h1>
          <p className="text-xs text-text-secondary mt-1.5 text-center max-w-sm">
            Track and manage all your recurring services in one workspace
          </p>
        </div>

        {/* Elegant Auth Box */}
        <div className="w-full max-w-[420px]">
          <div className="card card-glow-indigo shadow-2xl p-8 border border-border-default/60 bg-bg-card/70 backdrop-blur-2xl relative">
            {/* Top decorative glow */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-accent/10 rounded-full blur-xl pointer-events-none"></div>

            <div className="space-y-1.5 mb-5">
              <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">
                {isRegister ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                {isRegister
                  ? 'Join Sublytics to track and optimize your expenses'
                  : 'Enter your credentials to access your dashboard'}
              </p>
            </div>

            {/* Sliding Tabs */}
            <div className="flex p-1 rounded-xl bg-slate-950/60 border border-border-default/45 mb-6">
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError('') }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  !isRegister
                    ? 'bg-accent text-white shadow-lg shadow-accent/15'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError('') }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  isRegister
                    ? 'bg-accent text-white shadow-lg shadow-accent/15'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="p-3 mb-5 rounded-xl bg-danger/10 border border-danger/25 text-xs font-semibold text-danger animate-fade-in flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-danger inline-block animate-pulse"></span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary/60">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Shreyas Kumar"
                      className="input pl-10 hover:border-border-default/80"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary/60">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    placeholder="shreyas@company.com"
                    className="input pl-10 hover:border-border-default/80"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    Password
                  </label>
                  {!isRegister && (
                    <span className="text-[10px] font-semibold text-accent hover:text-accent/80 hover:underline cursor-pointer transition-colors">
                      Forgot password?
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary/60">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input pl-10 pr-10 hover:border-border-default/80"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-secondary/60 hover:text-text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full mt-3 font-bold flex items-center justify-center gap-2 group py-3 rounded-xl transition-all shadow-md active:scale-[0.99]"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-default/30" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="bg-bg-card/90 px-3 text-text-secondary font-bold">
                  Or join with
                </span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="btn btn-secondary w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-bold transition-all hover:bg-slate-900 border border-border-default/80 shadow-sm active:scale-[0.99]"
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.62 14.99 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.92-2.75 3.48-4.51 6.76-4.51z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.45c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-1.99 3.42-4.92 3.42-8.55z" />
                <path fill="#FBBC05" d="M5.24 10.55c-.24-.72-.37-1.49-.37-2.28s.13-1.56.37-2.28L1.39 3.01C.5 4.81 0 6.85 0 9s.5 4.19 1.39 5.99l3.85-2.99z" />
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.34 1.1-3.96 1.1-3.28 0-5.84-1.76-6.76-4.51L1.69 16.8C3.67 20.69 7.65 23 12 23z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <p className="text-center text-[10px] text-text-secondary mt-6">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
