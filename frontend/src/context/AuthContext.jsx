import { createContext, useState, useContext, useEffect, useRef } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
axios.defaults.baseURL = API_URL

const decodeToken = (token) => {
  try {
    const base64 = token.split('.')[1]
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const userRef = useRef(null)

  // Keep ref in sync so initAuth always sees current user
  useEffect(() => {
    userRef.current = user
  }, [user])

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token') || localStorage.getItem('adminToken')

      if (savedToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
        setToken(savedToken)

        // Try localStorage user first
        let hasUser = false
        const savedUser = localStorage.getItem('userData')
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser)
            if (parsed && (parsed._id || parsed.id)) {
              setUser(parsed)
              userRef.current = parsed
              hasUser = true
            }
          } catch (e) {}
        }

        // Fallback: decode token if no user yet
        if (!hasUser) {
          const decoded = decodeToken(savedToken)
          if (decoded) {
            const fallbackUser = {
              _id: decoded.id || decoded._id || decoded.userId,
              email: decoded.email,
              fullName: decoded.fullName || decoded.name || 'User'
            }
            if (fallbackUser._id) {
              setUser(fallbackUser)
              userRef.current = fallbackUser
              localStorage.setItem('userData', JSON.stringify(fallbackUser))
            }
          }
        }

        // Fresh profile fetch (non-blocking, updates if succeeds)
        try {
          const res = await axios.get('/api/user/profile', { timeout: 8000 })
          if (res.data && (res.data._id || res.data.id)) {
            setUser(res.data)
            userRef.current = res.data
            localStorage.setItem('userData', JSON.stringify(res.data))
          }
        } catch (error) {
          console.log('Profile fetch failed (non-critical):', error.message)
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
      userRef.current = userData
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
      userRef.current = newUser
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
    userRef.current = null
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
