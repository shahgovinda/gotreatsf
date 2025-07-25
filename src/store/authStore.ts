import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from 'firebase/auth'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../config/firebaseConfig'
import { getUserFromDb } from '../services/authService'

export interface UserDetails {
  uid: string
  email: string | null
  displayName: string | null
  phoneNumber: string | null
  address: string | null | { [key: string]: any }
  profileImage: string | null
  role?: string | null
}

interface AuthStore {
  user: User | null
  userDetails: UserDetails | null
  loading: boolean
  setUser: (user: User | null) => void
  setUserDetails: (details: UserDetails | null) => void
  setLoading: (loading: boolean) => void
  updateUserProfile: (updates: Partial<UserDetails>) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
  user: null,
  userDetails: null,
  loading: true,
  setUser: (user) => set({ user }),
  setUserDetails: (details) => set({ userDetails: details }),
      setLoading: (loading) => set({ loading }),
      updateUserProfile: (updates) => 
        set((state) => ({
          userDetails: state.userDetails 
            ? { ...state.userDetails, ...updates }
            : null
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
)

onAuthStateChanged(auth, async (user) => {
  useAuthStore.getState().setUser(user)
  if (user) {
    const userDetails = await getUserFromDb(user.uid)
    useAuthStore.getState().setUserDetails(userDetails)
  } else {
    useAuthStore.getState().setUserDetails(null)
  }
  useAuthStore.getState().setLoading(false)
})
