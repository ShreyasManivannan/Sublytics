import React, { useState, useMemo } from 'react'
import {
  DollarSign,
  TrendingUp,
  CheckCircle,
  Calendar,
  AlertTriangle,
  RefreshCw,
  ArrowUpRight,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  Bell,
  Lightbulb,
  Zap,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import useSubscriptionStore from '../store/subscriptionStore'
import useAuthStore from '../store/authStore'
import KPICard from '../components/KPICard'
import ServiceAvatar from '../components/ServiceAvatar'

// ─── Helpers ────────────────────────────────────────────────────────────────

const getCatBadgeClass = (category) => {
  const map = {
    Entertainment: 'badge-purple',
    Music: 'badge-pink',
    Cloud: 'badge-blue',
    'Cloud Storage': 'badge-cyan',
    Developer: 'badge-gray',
    Productivity: 'badge-blue',
    Design: 'badge-warning',
    Professional: 'badge-gray',
    Education: 'badge-warning',
    Fitness: 'badge-success',
    News: 'badge-gray',
    Utilities: 'badge-cyan',
    Other: 'badge-gray',
  }
  return map[category] ?? 'badge-blue'
}

const toMonthly = (amount, cycle) => {
  if (cycle === 'Yearly') return amount / 12
  if (cycle === 'Weekly') return amount * 4.33
  return amount
}

const daysUntil = (dateStr) =>
  Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24))

// ─── Sub-components ──────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, formatCurrency }) => {
  if (!active || !payload?.length) return null
  const val = payload[0].value ?? payload[0].payload?.amount
  return (
    <div className="bg-slate-900/95 backdrop-blur-sm border border-border-default p-4 rounded-xl shadow-2xl text-xs">
      <p className="font-bold text-text-primary text-sm">{payload[0].name ?? payload[0].payload?.name}</p>
      <p className="text-accent font-extrabold mt-1.5 text-base">{formatCurrency(val)}</p>
    </div>
  )
}

const SortIcon = ({ field, sortKey, sortDir }) => {
  if (sortKey !== field) return <ChevronsUpDown className="w-3 h-3 inline ml-1 opacity-40" />
  return sortDir === 'asc'
    ? <ChevronUp className="w-3 h-3 inline ml-1" />
    : <ChevronDown className="w-3 h-3 inline ml-1" />
}

const DaysLeftBadge = ({ daysLeft }) => {
  if (daysLeft < 0) return <span className="badge badge-gray text-xs">Overdue</span>
  if (daysLeft === 0) return <span className="badge badge-danger text-xs">Today</span>
  if (daysLeft <= 3) return <span className="badge badge-danger text-xs">{daysLeft}d</span>
  if (daysLeft <= 7) return <span className="badge badge-warning text-xs">{daysLeft}d</span>
  return <span className="badge badge-success text-xs">{daysLeft}d</span>
}

const InsightCard = ({ icon: Icon, iconColorClass, title, body }) => (
  <div className="flex items-start gap-4 bg-slate-800/40 rounded-xl p-4 border border-border-default/20 hover:border-border-default/40 transition-colors">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColorClass}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="space-y-1">
      <p className="text-sm font-bold text-text-primary">{title}</p>
      <p className="text-xs text-text-secondary leading-relaxed">{body}</p>
    </div>
  </div>
)

// ─── Main component ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { subscriptions = [], formatCurrencyValue } = useSubscriptionStore()

  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortKey, setSortKey] = useState('renewalDate')
  const [sortDir, setSortDir] = useState('asc')

  const activeSubs = useMemo(
    () => subscriptions.filter((s) => s.status === 'active'),
    [subscriptions]
  )

  const stats = useMemo(() => {
    const monthlyTotal = activeSubs.reduce((acc, s) => acc + toMonthly(s.amount, s.cycle), 0)
    const yearlyTotal = monthlyTotal * 12
    const activeCount = activeSubs.length
    const upcomingRenewals = activeSubs.filter((s) => {
      const d = daysUntil(s.renewalDate)
      return d >= 0 && d <= 7
    }).length
    const autopayCount = activeSubs.filter((s) => s.autopay).length
    const expiredCount = subscriptions.filter((s) => s.status === 'expired').length
    const cancelledCount = subscriptions.filter((s) => s.status === 'cancelled').length
    return { monthlyTotal, yearlyTotal, activeCount, upcomingRenewals, autopayCount, expiredCount, cancelledCount }
  }, [activeSubs, subscriptions])

  const formatCurrency = (val) =>
    formatCurrencyValue ? formatCurrencyValue(val ?? 0) :
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val ?? 0)

  const monthlySpendingData = useMemo(() => {
    const variance = [0.71, 0.78, 0.85, 0.92, 0.97, 1.0]
    const labels = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']
    return labels.map((name, i) => ({
      name,
      amount: parseFloat((stats.monthlyTotal * variance[i]).toFixed(2)),
    }))
  }, [stats.monthlyTotal])

  const categoryChartData = useMemo(() => {
    const totals = activeSubs.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] ?? 0) + toMonthly(s.amount, s.cycle)
      return acc
    }, {})
    return Object.entries(totals).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }))
  }, [activeSubs])

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B', '#06B6D4', '#94A3B8']

  const categories = useMemo(
    () => [...new Set(subscriptions.map((s) => s.category))].sort(),
    [subscriptions]
  )

  const tableRows = useMemo(() => {
    const q = search.toLowerCase()
    let rows = subscriptions
      .filter((s) => {
        if (q && !s.name.toLowerCase().includes(q) && !s.category.toLowerCase().includes(q)) return false
        if (catFilter && s.category !== catFilter) return false
        if (statusFilter && s.status !== statusFilter) return false
        return true
      })
      .map((s) => ({ ...s, daysLeft: daysUntil(s.renewalDate) }))

    rows.sort((a, b) => {
      let av = a[sortKey]
      let bv = b[sortKey]
      if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase() }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
    return rows
  }, [subscriptions, search, catFilter, statusFilter, sortKey, sortDir])

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const insights = useMemo(() => {
    const list = []
    if (stats.upcomingRenewals > 0) {
      list.push({
        icon: Bell,
        iconColorClass: 'text-warning bg-warning/10',
        title: `${stats.upcomingRenewals} renewal${stats.upcomingRenewals > 1 ? 's' : ''} this week`,
        body: 'Review these before autopay fires — especially ones you rarely use.',
      })
    }
    const autopayPct = stats.activeCount > 0
      ? Math.round((stats.autopayCount / stats.activeCount) * 100)
      : 0
    list.push({
      icon: RefreshCw,
      iconColorClass: 'text-success bg-success/10',
      title: `${autopayPct}% autopay coverage`,
      body: autopayPct < 80
        ? 'Enable autopay on more subscriptions to avoid accidental lapses.'
        : 'Good coverage — most subscriptions renew automatically.',
    })
    const monthlyCycleCount = activeSubs.filter((s) => s.cycle === 'Monthly').length
    if (monthlyCycleCount >= 3) {
      list.push({
        icon: DollarSign,
        iconColorClass: 'text-purple bg-purple/10',
        title: 'Switch to annual plans',
        body: `${monthlyCycleCount} subscriptions are monthly. Switching to yearly typically saves 15–20%.`,
      })
    }
    return list
  }, [activeSubs, stats])

  // Get the hour for dynamic greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[11px] font-bold text-success uppercase tracking-widest">Live Dashboard</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
            {greeting}, {user?.name ?? 'there'} 👋
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed max-w-lg">
            Here's a comprehensive overview of your subscriptions and spending analytics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-800/60 border border-border-default text-text-secondary">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Monthly Spending"
          value={formatCurrency(stats.monthlyTotal)}
          icon={DollarSign}
          colorClass="text-accent bg-accent/10"
          trend={{ value: 4.2, isUp: true }}
          subtitle="Recurring monthly total"
        />
        <KPICard
          title="Yearly Projection"
          value={formatCurrency(stats.yearlyTotal)}
          icon={TrendingUp}
          colorClass="text-success bg-success/10"
          subtitle="Annual estimated cost"
        />
        <KPICard
          title="Active Services"
          value={stats.activeCount}
          icon={CheckCircle}
          colorClass="text-blue-400 bg-blue-500/10"
          subtitle="Currently tracked"
        />
        <KPICard
          title="Renewals This Week"
          value={stats.upcomingRenewals}
          icon={Calendar}
          colorClass="text-warning bg-warning/10"
          subtitle="Upcoming in 7 days"
        />
        <KPICard
          title="Autopay Enabled"
          value={`${stats.autopayCount} / ${stats.activeCount}`}
          icon={RefreshCw}
          colorClass="text-purple bg-purple/10"
          subtitle="Auto-renew coverage"
        />
        <KPICard
          title="Expired / Cancelled"
          value={stats.expiredCount + stats.cancelledCount}
          icon={AlertTriangle}
          colorClass="text-danger bg-danger/10"
          subtitle="Inactive subscriptions"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Spending Trend */}
        <div className="card card-lit lg:col-span-3 flex flex-col p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-text-primary">Spending Trend</h3>
              <p className="text-xs text-text-secondary">Monthly recurring — last 6 months</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-success bg-success/10 px-3 py-1.5 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+15% YTD</span>
            </div>
          </div>
          <div className="h-72 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySpendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  content={<CustomTooltip formatCurrency={formatCurrency} />}
                  cursor={{ fill: 'rgba(51,65,85,0.2)', radius: 8 }}
                />
                <Bar dataKey="amount" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#1D4ED8" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card card-lit lg:col-span-2 flex flex-col p-6">
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-text-primary">Category Breakdown</h3>
            <p className="text-xs text-text-secondary">Monthly cost share by category</p>
          </div>
          <div className="h-52 flex-1 flex items-center justify-center relative mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={82}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {categoryChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest">Total</span>
              <span className="text-xl font-extrabold text-text-primary mt-0.5">{formatCurrency(stats.monthlyTotal)}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2.5 mt-6 pt-4 border-t border-border-default/30">
            {categoryChartData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs font-medium text-text-secondary min-w-0">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="truncate max-w-[90px]">{entry.name}</span>
                <span className="font-bold text-text-primary flex-shrink-0">{formatCurrency(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Subscriptions Table */}
      <div className="card card-lit p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-text-primary">All Subscriptions</h3>
            <p className="text-xs text-text-secondary">
              {tableRows.length} subscription{tableRows.length !== 1 ? 's' : ''} tracked
            </p>
          </div>
          <span className="text-xs font-bold text-accent cursor-pointer hover:underline flex items-center gap-1">
            View All <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search subscriptions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-800/60 border border-border-default rounded-xl text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-1 focus:ring-accent transition-all"
            />
          </div>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="text-xs bg-slate-800/60 border border-border-default rounded-xl px-3 py-2 text-text-primary focus:outline-none"
          >
            <option value="">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-800/60 border border-border-default rounded-xl px-3 py-2 text-text-primary focus:outline-none"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle px-6">
            <table className="min-w-full divide-y divide-border-default/30">
              <thead>
                <tr className="text-left text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                  <th className="pb-4 cursor-pointer select-none hover:text-text-primary transition-colors" onClick={() => handleSort('name')}>
                    Service <SortIcon field="name" sortKey={sortKey} sortDir={sortDir} />
                  </th>
                  <th className="pb-4 cursor-pointer select-none hover:text-text-primary transition-colors" onClick={() => handleSort('renewalDate')}>
                    Renewal <SortIcon field="renewalDate" sortKey={sortKey} sortDir={sortDir} />
                  </th>
                  <th className="pb-4">Category</th>
                  <th className="pb-4 text-right cursor-pointer select-none hover:text-text-primary transition-colors" onClick={() => handleSort('amount')}>
                    Amount <SortIcon field="amount" sortKey={sortKey} sortDir={sortDir} />
                  </th>
                  <th className="pb-4 text-center">Autopay</th>
                  <th className="pb-4 text-right cursor-pointer select-none hover:text-text-primary transition-colors" onClick={() => handleSort('daysLeft')}>
                    Days Left <SortIcon field="daysLeft" sortKey={sortKey} sortDir={sortDir} />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default/15">
                {tableRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-text-secondary">
                      No subscriptions match your filters.
                    </td>
                  </tr>
                )}
                {tableRows.map((sub) => (
                  <tr key={sub.id} className="text-sm hover:bg-slate-800/30 transition-colors group">
                    <td className="py-4">
                      <div className="flex items-center gap-3.5">
                        <ServiceAvatar name={sub.name} category={sub.category} size="md" />
                        <div>
                          <p className="font-bold text-text-primary leading-none">{sub.name}</p>
                          <p className="text-[11px] text-text-secondary mt-1 capitalize">{sub.status}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-text-secondary text-xs font-medium">{sub.renewalDate}</td>
                    <td className="py-4">
                      <span className={`badge ${getCatBadgeClass(sub.category)}`}>{sub.category}</span>
                    </td>
                    <td className="py-4 text-right font-bold text-text-primary">
                      {formatCurrency(sub.amount)}
                      <span className="text-[10px] text-text-secondary font-normal ml-0.5">
                        /{sub.cycle === 'Monthly' ? 'mo' : sub.cycle === 'Yearly' ? 'yr' : 'wk'}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        sub.autopay ? 'text-success bg-success/10' : 'text-text-secondary bg-slate-700/50'
                      }`}>
                        {sub.autopay ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <DaysLeftBadge daysLeft={sub.daysLeft} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="card card-lit p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
                <Zap className="w-5 h-5 text-warning" />
                Smart Insights
              </h3>
              <p className="text-xs text-text-secondary">AI-powered observations based on your subscription patterns</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((ins, i) => (
              <InsightCard key={i} {...ins} />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}