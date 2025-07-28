import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { getUserFromDb } from '../services/authService';

interface UserDetails {
  name: string;
  email: string;
  phone: string;
  isAdmin?: boolean;
  [key: string]: any; // for additional dynamic fields
}

interface AuthStore {
  user: User | null;
  userDetails: UserDetails | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setUserDetails: (details: UserDetails | null) => void;
  setLoading: (loading: boolean) => void;
  updateUserProfile: (updates: Partial<UserDetails>) => void;
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
            : null,
        })),
    }),
    {
      name: 'auth-storage', // localStorage key
    }
  )
);

// Firebase auth state listener
onAuthStateChanged(auth, async (user) => {
  const { setUser, setUserDetails, setLoading } = useAuthStore.getState();
  setUser(user);

  if (user) {
    try {
      const userDetails = await getUserFromDb(user.uid);
      setUserDetails(userDetails);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      setUserDetails(null);
    }
  } else {
    setUserDetails(null);
  }

  setLoading(false);
});
