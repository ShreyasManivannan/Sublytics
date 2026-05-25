import React, { useState, useEffect } from 'react'
import { X, Calendar, RefreshCw, DollarSign, Users } from 'lucide-react'
import useSubscriptionStore from '../store/subscriptionStore'

const CATEGORIES = [
  'Entertainment',
  'Music',
  'Productivity',
  'Cloud Storage',
  'Education',
  'Fitness',
  'News',
  'Utilities',
  'Other',
]

export default function SubscriptionModal({ isOpen, onClose, subscription, onSave }) {
  const { currency: globalCurrency } = useSubscriptionStore()

  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [cycle, setCycle] = useState('Monthly')
  const [category, setCategory] = useState('Entertainment')
  const [renewalDate, setRenewalDate] = useState('')
  const [autopay, setAutopay] = useState(false)
  const [notes, setNotes] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [paymentMethod, setPaymentMethod] = useState('Visa ending 4832')
  const [splitCount, setSplitCount] = useState(1)
  const [status, setStatus] = useState('active')

  useEffect(() => {
    if (subscription) {
      setName(subscription.name)
      setAmount(subscription.amount.toString())
      setCycle(subscription.cycle)
      setCategory(subscription.category)
      setRenewalDate(subscription.renewalDate || '')
      setAutopay(!!subscription.autopay)
      setNotes(subscription.notes || '')
      setCurrency(subscription.currency || 'USD')
      setPaymentMethod(subscription.payment_method || 'Visa ending 4832')
      setSplitCount(subscription.split_count || 1)
      setStatus(subscription.status || 'active')
    } else {
      setName('')
      setAmount('')
      setCycle('Monthly')
      setCategory('Entertainment')
      setRenewalDate(new Date().toISOString().split('T')[0])
      setAutopay(false)
      setNotes('')
      setCurrency(globalCurrency || 'USD')
      setPaymentMethod('Visa ending 4832')
      setSplitCount(1)
      setStatus('active')
    }
  }, [subscription, isOpen, globalCurrency])

  if (!isOpen) return null

  const individualShare =
    splitCount > 1 && amount
      ? (parseFloat(amount) / splitCount).toFixed(2)
      : amount

  const currencySymbol = { USD: '$', INR: '₹', EUR: '€', GBP: '£' }[currency] || '$'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name || !amount || !renewalDate) return
    onSave({
      name,
      amount: parseFloat(amount),
      cycle,
      category,
      renewalDate,
      autopay,
      notes,
      currency,
      payment_method: paymentMethod,
      split_count: parseInt(splitCount || 1),
      status,
    })
    onClose()
  }

  return (
    <div className="overlay animate-fade-in">
      <div className="card w-full max-w-xl animate-slide-up relative bg-bg-sidebar p-6 border border-border-default/80 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-extrabold text-text-primary mb-5">
          {subscription ? 'Edit Subscription' : 'Add Subscription'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name + Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5">
                Service Name
              </label>
              <input
                type="text"
                placeholder="e.g. Netflix, Spotify"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5">
                Category
              </label>
              <select
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Currency + Amount + Cycle */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5">
                Currency
              </label>
              <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5">
                Billing Cycle
              </label>
              <select className="input" value={cycle} onChange={(e) => setCycle(e.target.value)}>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>

          {/* Renewal Date + Payment Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Renewal Date
              </label>
              <input
                type="date"
                className="input"
                value={renewalDate}
                onChange={(e) => setRenewalDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5">
                Payment Method
              </label>
              <select className="input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option>Visa ending 4832</option>
                <option>Mastercard ending 9110</option>
                <option>PayPal account</option>
                <option>UPI payment</option>
                <option>Apple Pay</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5">
              Status
            </label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Shared Splitting */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-border-default/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
                <Users className="w-4 h-4 text-accent" /> Split Between
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-text-secondary">Participants:</span>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={splitCount}
                  onChange={(e) => setSplitCount(Math.max(1, parseInt(e.target.value || '1')))}
                  className="input py-0.5 px-2 w-14 text-center text-xs"
                />
              </div>
            </div>
            {splitCount > 1 && (
              <div className="flex justify-between items-center text-[10px] font-semibold text-accent">
                <span>Each person pays:</span>
                <span>{currencySymbol}{individualShare} / {cycle === 'Yearly' ? 'yr' : cycle === 'Weekly' ? 'wk' : 'mo'}</span>
              </div>
            )}
          </div>

          {/* Autopay toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-border-default/50">
            <div>
              <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-accent" /> Autopay
              </h4>
              <p className="text-[10px] text-text-secondary">Auto-charge on renewal date</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={autopay}
                onChange={(e) => setAutopay(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5">
              Notes <span className="normal-case font-normal">(optional)</span>
            </label>
            <textarea
              placeholder="Any additional notes..."
              className="input min-h-[70px] resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border-default">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary px-6">
              {subscription ? 'Save Changes' : 'Add Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
