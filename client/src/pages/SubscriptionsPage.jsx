import React, { useState, useMemo } from 'react'
import { Plus, Search, Edit2, Trash2, SlidersHorizontal, RefreshCw, Receipt, ArrowUpDown, TrendingUp, Hash } from 'lucide-react'
import useSubscriptionStore from '../store/subscriptionStore'
import SubscriptionModal from '../components/SubscriptionModal'
import ConfirmDialog from '../components/ConfirmDialog'
import ServiceAvatar from '../components/ServiceAvatar'

const CATEGORIES = [
  'Entertainment', 'Music', 'Productivity', 'Cloud Storage',
  'Education', 'Fitness', 'News', 'Utilities', 'Other',
]

export default function SubscriptionsPage() {
  const {
    getFilteredSubscriptions,
    filters,
    setFilters,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    formatLocalValue,
  } = useSubscriptionStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingSub, setEditingSub] = useState(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [subToDelete, setSubToDelete] = useState(null)

  const filteredSubs = getFilteredSubscriptions()

  const summaryStats = useMemo(() => {
    if (filteredSubs.length === 0) return null

    const totalMonthly = filteredSubs.reduce((sum, sub) => {
      const amount = sub.split_count > 1 ? sub.amount / sub.split_count : sub.amount
      if (sub.cycle === 'yearly') return sum + amount / 12
      if (sub.cycle === 'weekly') return sum + amount * 4.33
      return sum + amount
    }, 0)

    const currency = filteredSubs[0]?.currency || 'INR'

    return {
      total: filteredSubs.length,
      activeCount: filteredSubs.filter((s) => s.status === 'active').length,
      totalMonthly,
      currency,
    }
  }, [filteredSubs])

  const handleEditClick = (sub) => { setEditingSub(sub); setModalOpen(true) }
  const handleAddClick = () => { setEditingSub(null); setModalOpen(true) }
  const handleDeleteClick = (sub) => { setSubToDelete(sub); setDeleteConfirmOpen(true) }

  const handleSaveSubscription = (data) => {
    if (editingSub) updateSubscription(editingSub.id, data)
    else addSubscription(data)
  }

  const handleConfirmDelete = () => {
    if (subToDelete) { deleteSubscription(subToDelete.id); setSubToDelete(null) }
  }

  const handleAutopayToggle = (sub) => {
    updateSubscription(sub.id, { autopay: !sub.autopay })
  }

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Subscriptions</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage all your recurring services and billing schedules.
          </p>
        </div>
        <button onClick={handleAddClick} className="btn btn-primary self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Add Subscription
        </button>
      </div>

      {/* Filters */}
      <div className="card p-5 flex flex-col xl:flex-row xl:items-center gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by name…"
            className="input pl-10"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="text-xs font-bold uppercase tracking-wider">Filter:</span>
          </div>

          <select
            className="input py-1.5 text-xs max-w-[140px]"
            value={filters.category}
            onChange={(e) => setFilters({ category: e.target.value })}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            className="input py-1.5 text-xs max-w-[130px]"
            value={filters.cycle}
            onChange={(e) => setFilters({ cycle: e.target.value })}
          >
            <option value="all">All Cycles</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

          <select
            className="input py-1.5 text-xs max-w-[120px]"
            value={filters.status}
            onChange={(e) => setFilters({ status: e.target.value })}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-text-secondary" />
            <select
              className="input py-1.5 text-xs max-w-[155px]"
              value={filters.sort}
              onChange={(e) => setFilters({ sort: e.target.value })}
            >
              <option value="nearest_renewal">Nearest Renewal</option>
              <option value="highest_cost">Highest Cost</option>
              <option value="inactive">Inactive First</option>
              <option value="autopay">Autopay Enabled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats Bar */}
      {summaryStats && (
        <div className="flex items-center gap-6 px-5 py-3.5 rounded-xl bg-slate-900/40 border border-border-default/30">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
              <Hash className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Total</p>
              <p className="text-sm font-extrabold text-text-primary">{summaryStats.total} <span className="text-text-secondary font-medium text-xs">subscriptions</span></p>
            </div>
          </div>

          <div className="w-px h-8 bg-border-default/30" />

          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-success/10 text-success">
              <RefreshCw className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Active</p>
              <p className="text-sm font-extrabold text-text-primary">{summaryStats.activeCount}</p>
            </div>
          </div>

          <div className="w-px h-8 bg-border-default/30" />

          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Monthly Spend</p>
              <p className="text-sm font-extrabold text-text-primary">{formatLocalValue(summaryStats.totalMonthly, summaryStats.currency)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {filteredSubs.length === 0 ? (
          <div className="p-28 text-center flex flex-col items-center justify-center space-y-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-border-default/60 flex items-center justify-center text-text-secondary/25 shadow-lg">
              <Receipt className="w-12 h-12" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-text-primary">No Subscriptions Found</h3>
              <p className="text-sm text-text-secondary max-w-lg mt-3 leading-relaxed">
                Adjust your filters or add a new subscription to get started tracking your recurring expenses and stay on top of your spending.
              </p>
            </div>
            <button onClick={handleAddClick} className="btn btn-primary mt-4 px-8 py-2.5 text-sm">
              <Plus className="w-4 h-4" /> Add your first subscription
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <div className="inline-block min-w-full align-middle px-6">
              <table className="min-w-full divide-y divide-border-default/30">
                <thead>
                  <tr className="text-left text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                    <th className="pb-4 pt-2">Service</th>
                    <th className="pb-4 pt-2">Category</th>
                    <th className="pb-4 pt-2">Cycle</th>
                    <th className="pb-4 pt-2">Renewal</th>
                    <th className="pb-4 pt-2 text-center">Autopay</th>
                    <th className="pb-4 pt-2">Payment</th>
                    <th className="pb-4 pt-2">Status</th>
                    <th className="pb-4 pt-2 text-right">Amount</th>
                    <th className="pb-4 pt-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default/15">
                  {filteredSubs.map((sub) => (
                    <tr key={sub.id} className="text-xs hover:bg-slate-900/30 transition-colors group">
                      {/* Service */}
                      <td className="py-5">
                        <div className="flex items-center gap-3.5">
                          <ServiceAvatar name={sub.name} category={sub.category} size="md" />
                          <div>
                            <p className="font-bold text-sm text-text-primary">{sub.name}</p>
                            {sub.split_count > 1 && (
                              <p className="text-[10px] text-accent mt-0.5 font-medium">
                                Split × {sub.split_count}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-5">
                        <span className={`badge ${
                          sub.category === 'Entertainment' ? 'badge-purple' :
                          sub.category === 'Music' ? 'badge-pink' :
                          sub.category === 'Cloud Storage' ? 'badge-cyan' :
                          sub.category === 'Education' ? 'badge-warning' :
                          'badge-blue'
                        }`}>
                          {sub.category}
                        </span>
                      </td>

                      <td className="py-5 text-text-secondary font-semibold">{sub.cycle}</td>
                      <td className="py-5 text-text-secondary">{sub.renewalDate}</td>

                      {/* Autopay toggle */}
                      <td className="py-5 text-center">
                        <button
                          onClick={() => handleAutopayToggle(sub)}
                          title={sub.autopay ? 'Disable Autopay' : 'Enable Autopay'}
                          className={`p-1.5 rounded-lg transition-all border ${
                            sub.autopay
                              ? 'text-success bg-success/10 border-success/20 hover:bg-success/20'
                              : 'text-text-secondary bg-slate-950/40 border-border-default hover:bg-slate-800'
                          }`}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </td>

                      <td className="py-5 text-text-secondary font-medium">
                        {sub.payment_method || 'Visa ending 4832'}
                      </td>

                      {/* Status */}
                      <td className="py-5">
                        <span className={`badge ${
                          sub.status === 'active' ? 'badge-success' :
                          sub.status === 'expired' ? 'badge-danger' :
                          'badge-gray'
                        }`}>
                          {sub.status}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-5 text-right font-extrabold text-text-primary text-sm">
                        {formatLocalValue(sub.amount, sub.currency)}
                        {sub.split_count > 1 && (
                          <span className="block text-[9px] text-accent font-semibold mt-0.5">
                            ({formatLocalValue(sub.amount / sub.split_count, sub.currency)} share)
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-5 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditClick(sub)}
                            className="p-2 rounded-lg text-text-secondary hover:text-accent hover:bg-accent/10 transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(sub)}
                            className="p-2 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Summary footer */}
      {filteredSubs.length > 0 && (
        <p className="text-xs text-text-secondary text-right">
          Showing {filteredSubs.length} subscription{filteredSubs.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Modals */}
      <SubscriptionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        subscription={editingSub}
        onSave={handleSaveSubscription}
      />
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Subscription"
        message={`Are you sure you want to delete ${subToDelete?.name}? This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}
