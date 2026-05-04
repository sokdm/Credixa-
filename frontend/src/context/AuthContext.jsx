import { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
axios.defaults.baseURL = API_URL

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token') || localStorage.getItem('adminToken')
      
      if (savedToken) {
        // Set token on axios FIRST
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
        setToken(savedToken)
        
        // Try to get user from localStorage first (instant)
        const savedUser = localStorage.getItem('userData')
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser)
            setUser(parsed)
          } catch (e) {}
        }
        
        // Then fetch fresh profile from server
        try {
          const res = await axios.get('/api/user/profile')
          const userData = res.data
          setUser(userData)
          localStorage.setItem('userData', JSON.stringify(userData))
        } catch (error) {
          console.error('Profile fetch failed:', error.response?.data || error.message)
          // DON'T clear token here — user might just be offline or server busy
          // Only clear if it's a 401 (truly invalid token)
          if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('adminToken')
            localStorage.removeItem('userData')
            delete axios.defaults.headers.common['Authorization']
            setToken(null)
            setUser(null)
          }
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password })
      const { token: newToken, user: userData } = res.data
      
      localStorage.setItem('token', newToken)
      localStorage.setItem('userData', JSON.stringify(userData))
      if (userData.isAdmin) {
        localStorage.setItem('adminToken', newToken)
      }
      
      setToken(newToken)
      setUser(userData)
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      return { success: true, user: userData }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      }
    }
  }

  const register = async (userData) => {
    try {
      const res = await axios.post('/api/auth/register', userData)
      const { token: newToken, user: newUser } = res.data
      
      localStorage.setItem('token', newToken)
      localStorage.setItem('userData', JSON.stringify(newUser))
      setToken(newToken)
      setUser(newUser)
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      return { success: true, user: newUser }
    } catch (error) {
      console.error('Register error:', error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('userData')
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      loading,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
