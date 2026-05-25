import { create } from 'zustand'

const getLocalUser = () => {
  try {
    const val = localStorage.getItem('subguard_user');
    if (!val) return null;
    return JSON.parse(val);
  } catch (e) {
    console.error('Error parsing subguard_user from localStorage:', e);
    return null;
  }
};

const useAuthStore = create((set) => ({
  user: getLocalUser(),
  token: localStorage.getItem('subguard_token') || null,
  isAuthenticated: !!localStorage.getItem('subguard_token'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true })
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800))
    const user = {
      id: 1,
      name: 'Shreyas',
      email: email || 'shreyas@subguard.com',
      avatar: null,
    }
    const token = 'demo_jwt_token_' + Date.now()
    localStorage.setItem('subguard_token', token)
    localStorage.setItem('subguard_user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true, isLoading: false })
    return { success: true }
  },

  register: async (name, email, password) => {
    set({ isLoading: true })
    await new Promise((r) => setTimeout(r, 800))
    const user = {
      id: 1,
      name: name || 'Shreyas',
      email: email || 'shreyas@subguard.com',
      avatar: null,
    }
    const token = 'demo_jwt_token_' + Date.now()
    localStorage.setItem('subguard_token', token)
    localStorage.setItem('subguard_user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true, isLoading: false })
    return { success: true }
  },

  googleLogin: async () => {
    set({ isLoading: true })
    await new Promise((r) => setTimeout(r, 1000))
    const user = {
      id: 1,
      name: 'Shreyas',
      email: 'shreyas@subguard.com',
      avatar: null,
    }
    const token = 'demo_google_token_' + Date.now()
    localStorage.setItem('subguard_token', token)
    localStorage.setItem('subguard_user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true, isLoading: false })
    return { success: true }
  },

  logout: () => {
    localStorage.removeItem('subguard_token')
    localStorage.removeItem('subguard_user')
    set({ user: null, token: null, isAuthenticated: false })
  },

  setUser: (user) => {
    localStorage.setItem('subguard_user', JSON.stringify(user))
    set({ user })
  },
}))

export default useAuthStore
