import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  CreditCard,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Globe,
  Check,
  Wallet,
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import useSubscriptionStore from '../store/subscriptionStore'

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false)

  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const {
    currency,
    setCurrency,
    notifications,
    markAllNotificationsRead,
    clearNotification,
    fetchSubscriptions,
  } = useSubscriptionStore()

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Subscriptions', path: '/subscriptions', icon: CreditCard },
  ]

  const getPageTitle = () => {
    const current = menuItems.find((item) => item.path === location.pathname)
    return current ? current.name : 'Sublytics'
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="flex min-h-screen bg-bg-primary text-text-primary bg-grid relative overflow-hidden">
      {/* Background Nebulas */}
      <div className="cyber-bg">
        <div className="nebula-indigo"></div>
        <div className="nebula-rose"></div>
        <div className="nebula-cyan"></div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 glass-sidebar flex flex-col z-50 transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full'}`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-5 border-b border-border-default flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-xl bg-accent/10 border border-accent/20 text-accent flex-shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-lg font-bold tracking-tight text-text-primary gradient-text uppercase">
                Sublytics
              </span>
            )}
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-accent/15 text-accent border-l-4 border-accent rounded-l-none'
                      : 'text-text-secondary hover:text-text-primary hover:bg-slate-900/60'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                {(!sidebarCollapsed || mobileOpen) && (
                  <span className="truncate">{item.name}</span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Collapse button */}
        <div className="hidden lg:block p-3 border-t border-border-default">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center p-2.5 rounded-xl bg-slate-950/40 border border-border-default/60 hover:border-accent/40 text-text-secondary hover:text-text-primary transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Profile card */}
        <div className="p-4 border-t border-border-default bg-slate-950/20">
          <div className="flex items-center gap-3 px-2 py-1.5 mb-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-bold uppercase select-none flex-shrink-0">
              {user?.name ? user.name[0] : 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate text-text-primary">
                  {user?.name || 'User'}
                </p>
                <p className="text-[10px] text-text-secondary truncate">
                  {user?.email || 'user@sublytics.com'}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-2.5 rounded-xl text-xs font-semibold text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors`}
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden z-10">
        {/* Header */}
        <header className="h-16 border-b border-border-default bg-bg-primary/80 backdrop-blur-md px-6 flex items-center justify-between flex-shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-slate-900"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold tracking-tight text-text-primary">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency Switcher */}
            <div className="relative">
              <button
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/40 border border-border-default/60 hover:border-accent/40 text-xs font-semibold text-text-secondary hover:text-text-primary transition-all"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{currency}</span>
              </button>

              {currencyDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setCurrencyDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-32 card p-2 border border-border-default/80 z-50 animate-slide-down bg-bg-sidebar">
                    {['USD', 'INR', 'EUR', 'GBP'].map((curr) => (
                      <button
                        key={curr}
                        onClick={() => {
                          setCurrency(curr)
                          setCurrencyDropdownOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg hover:bg-slate-900 transition-colors ${
                          currency === curr
                            ? 'text-accent font-bold bg-accent/10'
                            : 'text-text-secondary'
                        }`}
                      >
                        <span>{curr}</span>
                        {currency === curr && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-slate-900 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-danger text-[9px] font-bold text-white flex items-center justify-center border border-bg-primary animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 card shadow-2xl p-4 border border-border-default/80 z-50 animate-slide-down bg-bg-sidebar">
                    <div className="flex items-center justify-between pb-3 border-b border-border-default/50 mb-3">
                      <span className="text-xs font-bold text-text-primary">
                        Notifications
                      </span>
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[10px] text-accent font-semibold hover:underline"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="space-y-2.5 max-h-64 overflow-y-auto">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl border transition-all ${
                            n.read
                              ? 'bg-slate-950/20 border-border-default/20'
                              : 'bg-accent/5 border-accent/20'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-bold text-text-primary">
                              {n.title}
                            </h4>
                            <button
                              onClick={() => clearNotification(n.id)}
                              className="text-[9px] text-text-secondary hover:text-danger"
                            >
                              ✕
                            </button>
                          </div>
                          <p className="text-[10px] text-text-secondary mt-1">
                            {n.message}
                          </p>
                          <span className="text-[8px] text-accent mt-2 block">
                            {n.time}
                          </span>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <p className="text-xs text-text-secondary text-center py-4">
                          No notifications yet.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div
            key={location.pathname}
            className="max-w-7xl mx-auto space-y-6 animate-page-enter"
          >
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-bg-sidebar border-t border-border-default/80 flex items-center justify-around z-40 lg:hidden backdrop-blur-md">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 text-[9px] font-bold ${
                  isActive ? 'text-accent' : 'text-text-secondary'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.name.split(' ')[0]}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
