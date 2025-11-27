import { createContext, useContext, type ReactNode } from 'react'
import { useAuthStore, useUser, useIsAuthenticated, useAuthLoading } from '@/store/authStore'
import type { User } from '@/types'
import type { UpdateProfileData } from '@/services/api'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (data: UpdateProfileData) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const store = useAuthStore()
  const user = useUser()
  const isAuthenticated = useIsAuthenticated()
  const isLoading = useAuthLoading()

  return (
    <AuthContext.Provider
      value={{
        user,
        token: store.token,
        isAuthenticated,
        isLoading,
        login: store.login,
        logout: store.logout,
        updateUser: store.updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
