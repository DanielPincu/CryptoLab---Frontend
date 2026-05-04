import { createContext, useContext, useEffect, useState } from 'react'
import { apiLogin, apiRegister, apiLogout, apiMe } from '../api/auth.api'
import { clearAuthToken, setAuthToken } from '../api/http.api'
import type { IAuthContext } from '../interfaces/auth.interface'
import type { IUser } from '../interfaces/user.interface'

const SessionContext = createContext<IAuthContext | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    apiMe()
      .then((res) => setUser(res.user))
      .catch(() => {
        clearAuthToken()
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const res = await apiLogin({ email, password })
    if (res.token) setAuthToken(res.token)
    const me = await apiMe()
    setUser(me.user)
  }

  async function register(username: string, email: string, password: string) {
    const res = await apiRegister({ username, email, password })
    if (res.token) setAuthToken(res.token)
    const me = await apiMe()
    setUser(me.user)
  }

  async function logout() {
    await apiLogout().catch(() => null)
    clearAuthToken()
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
