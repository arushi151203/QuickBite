import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('quickbite_token')
    if (!token) {
      setLoading(false)
      return
    }

    api.getMe()
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem('quickbite_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const { token, user } = await api.login(email, password)
    localStorage.setItem('quickbite_token', token)
    setUser(user)
    return user
  }

  const register = async (payload) => {
    return api.register(payload)
  }

  const logout = () => {
    localStorage.removeItem('quickbite_token')
    setUser(null)
  }

  const updateUser = (updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : prev)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
