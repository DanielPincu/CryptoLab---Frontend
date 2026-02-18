import { createContext, useContext, useEffect, useState } from 'react'
import { apiLogin, apiMe, apiRegister } from '../api/auth.api'
import type { IAuthContext } from '../interfaces/auth.interface'
import type { IUser } from '../interfaces/user.interface'

const SessionContext = createContext<IAuthContext | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(() => !!localStorage.getItem('token'))

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    apiMe()
      .then((res) => setUser(res.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setIsLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const res = await apiLogin({ email, password })
    localStorage.setItem('token', res.token)
    setUser(res.user)
  }

  async function register(username: string, email: string, password: string) {
    const res = await apiRegister({ username, email, password })
    localStorage.setItem('token', res.token)
    setUser(res.user)
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <SessionContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </SessionContext.Provider>
  )
}


//I need to sort this out... Or not.

// eslint-disable-next-line react-refresh/only-export-components
export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside AuthProvider')
  return ctx
}