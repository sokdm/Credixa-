import { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

axios.defaults.baseURL = 'http://localhost:5000'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token') || localStorage.getItem('adminToken')
      if (savedToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
        try {
          const res = await axios.get('/api/user/profile')
          setUser(res.data)
          setToken(savedToken)
        } catch (error) {
          console.error('Auth init failed:', error.response?.data || error.message)
          localStorage.removeItem('token')
          localStorage.removeItem('adminToken')
          delete axios.defaults.headers.common['Authorization']
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
