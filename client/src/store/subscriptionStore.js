// store/subscriptionStore.js
// Zustand store — fully self-contained, no backend required

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const SAMPLE_SUBSCRIPTIONS = [
  {
    id: 1,
    name: 'Netflix',
    amount: 15.99,
    cycle: 'Monthly',
    category: 'Entertainment',
    renewalDate: '2026-06-10',
    autopay: true,
    status: 'active',
    currency: 'USD',
    payment_method: 'Visa ending 4832',
    split_count: 1,
    notes: '',
  },
  {
    id: 2,
    name: 'Spotify',
    amount: 9.99,
    cycle: 'Monthly',
    category: 'Music',
    renewalDate: '2026-06-05',
    autopay: true,
    status: 'active',
    currency: 'USD',
    payment_method: 'Mastercard ending 9110',
    split_count: 1,
    notes: '',
  },
  {
    id: 3,
    name: 'GitHub',
    amount: 4.0,
    cycle: 'Monthly',
    category: 'Productivity',
    renewalDate: '2026-06-18',
    autopay: false,
    status: 'active',
    currency: 'USD',
    payment_method: 'Visa ending 4832',
    split_count: 1,
    notes: '',
  },
  {
    id: 4,
    name: 'Adobe Creative Cloud',
    amount: 599.88,
    cycle: 'Yearly',
    category: 'Productivity',
    renewalDate: '2027-01-15',
    autopay: true,
    status: 'active',
    currency: 'USD',
    payment_method: 'Visa ending 4832',
    split_count: 1,
    notes: '',
  },
  {
    id: 5,
    name: 'Notion',
    amount: 96.0,
    cycle: 'Yearly',
    category: 'Productivity',
    renewalDate: '2026-09-01',
    autopay: false,
    status: 'active',
    currency: 'USD',
    payment_method: 'PayPal account',
    split_count: 2,
    notes: 'Shared with team',
  },
  {
    id: 6,
    name: 'iCloud',
    amount: 2.99,
    cycle: 'Monthly',
    category: 'Cloud Storage',
    renewalDate: '2026-06-02',
    autopay: true,
    status: 'active',
    currency: 'USD',
    payment_method: 'Apple Pay',
    split_count: 1,
    notes: '',
  },
]

const CURRENCY_RATES = { USD: 1, INR: 83.5, EUR: 0.92, GBP: 0.79 }
const CURRENCY_SYMBOLS = { USD: '$', INR: '₹', EUR: '€', GBP: '£' }

const useSubscriptionStore = create(
  persist(
    (set, get) => ({
      subscriptions: SAMPLE_SUBSCRIPTIONS,
      currency: 'USD',
      filters: {
        search: '',
        category: 'all',
        cycle: 'all',
        status: 'all',
        sort: 'nearest_renewal',
      },
      notifications: [
        {
          id: 1,
          title: 'iCloud renews in 2 days',
          message: 'iCloud storage plan renews on Jun 2 — $2.99/mo',
          time: 'Just now',
          read: false,
        },
        {
          id: 2,
          title: 'Spotify renews in 5 days',
          message: 'Spotify Premium renews on Jun 5 — $9.99/mo',
          time: '1 hour ago',
          read: false,
        },
      ],

      // ── Currency helpers
      setCurrency: (currency) => set({ currency }),

      formatLocalValue: (amount, subCurrency) => {
        const { currency } = get()
        const displayCurrency = subCurrency || currency
        const rate = CURRENCY_RATES[currency] / (CURRENCY_RATES[displayCurrency] || 1)
        const converted = amount * rate
        const sym = CURRENCY_SYMBOLS[currency] || '$'
        return `${sym}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      },

      formatCurrencyValue: (amount) => {
        const { currency } = get()
        const sym = CURRENCY_SYMBOLS[currency] || '$'
        const rate = CURRENCY_RATES[currency]
        const converted = amount * rate
        return `${sym}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      },

      // ── Filters
      setFilters: (partial) =>
        set((state) => ({ filters: { ...state.filters, ...partial } })),

      getFilteredSubscriptions: () => {
        const { subscriptions, filters } = get()
        const q = filters.search.toLowerCase()

        let result = subscriptions.filter((s) => {
          if (q && !s.name.toLowerCase().includes(q)) return false
          if (filters.category !== 'all' && s.category !== filters.category) return false
          if (filters.cycle !== 'all' && s.cycle.toLowerCase() !== filters.cycle) return false
          if (filters.status !== 'all' && s.status !== filters.status) return false
          return true
        })

        const toMonthly = (s) => {
          if (s.cycle === 'Yearly') return s.amount / 12
          if (s.cycle === 'Weekly') return s.amount * 4.33
          return s.amount
        }

        const daysUntil = (d) =>
          Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24))

        if (filters.sort === 'nearest_renewal') {
          result.sort((a, b) => daysUntil(a.renewalDate) - daysUntil(b.renewalDate))
        } else if (filters.sort === 'highest_cost') {
          result.sort((a, b) => toMonthly(b) - toMonthly(a))
        } else if (filters.sort === 'inactive') {
          result.sort((a) => (a.status !== 'active' ? -1 : 1))
        } else if (filters.sort === 'autopay') {
          result.sort((a) => (a.autopay ? -1 : 1))
        }

        return result
      },

      // ── CRUD
      fetchSubscriptions: () => {
        // Data is already loaded from localStorage via persist middleware
        // This is a no-op kept for compatibility with existing calls
      },

      addSubscription: (subscription) =>
        set((state) => ({
          subscriptions: [
            ...state.subscriptions,
            { id: Date.now(), status: 'active', ...subscription },
          ],
        })),

      updateSubscription: (id, updated) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, ...updated } : sub
          ),
        })),

      deleteSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
        })),

      toggleAutopay: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, autopay: !sub.autopay } : sub
          ),
        })),

      // ── Notifications
      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      clearNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
    }),
    {
      name: 'sublytics-store',
      partialState: (state) => ({
        subscriptions: state.subscriptions,
        currency: state.currency,
      }),
    }
  )
)

export default useSubscriptionStore