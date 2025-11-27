import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { login as apiLogin, getProfile, updateProfile, type UpdateProfileData } from '@/services/api'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isHydrated: boolean
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (data: UpdateProfileData) => Promise<void>
  refreshUser: () => Promise<void>
  setHydrated: () => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,
      isHydrated: false,

      setHydrated: () => {
        set({ isHydrated: true, isLoading: false })
      },

      login: async (email: string, password: string) => {
        const response = await apiLogin(email, password)
        const { token, user } = response.data
        set({ token, user, isLoading: false })
      },

      logout: () => {
        set({ user: null, token: null })
      },

      updateUser: async (data: UpdateProfileData) => {
        const response = await updateProfile(data)
        set({ user: response.data })
      },

      refreshUser: async () => {
        const { token } = get()
        if (!token) {
          set({ isLoading: false })
          return
        }

        try {
          const response = await getProfile()
          set({ user: response.data, isLoading: false })
        } catch {
          // Token is invalid
          set({ user: null, token: null, isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
        // Refresh user data after hydration if we have a token
        if (state?.token) {
          state.refreshUser()
        }
      },
    }
  )
)

// Selector hooks for better performance
export const useUser = () => useAuthStore((state) => state.user)
export const useToken = () => useAuthStore((state) => state.token)
export const useIsAuthenticated = () => useAuthStore((state) => !!state.token)
export const useAuthLoading = () => useAuthStore((state) => state.isLoading || !state.isHydrated)
