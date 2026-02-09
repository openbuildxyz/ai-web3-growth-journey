import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/**
 * Authentication state interface for the Zustand store.
 */
interface AuthState {
  /** JWT authentication token, or null if not authenticated */
  token: string | null
  /** Connected wallet address, or null if not authenticated */
  address: string | null

  /**
   * Sets the authentication token and wallet address.
   *
   * @param {string} token - JWT authentication token
   * @param {string} address - Wallet address
   */
  setAuth: (token: string, address: string) => void

  /**
   * Clears the authentication state (token and address).
   */
  clearAuth: () => void

  /**
   * Checks if the user is currently authenticated.
   *
   * @returns {boolean} True if authenticated (has token), false otherwise
   */
  isAuthenticated: () => boolean

  /**
   * Checks if the user is authenticated for a specific wallet address.
   *
   * @param {string | null | undefined} address - Current connected wallet address
   * @returns {boolean} True if authenticated for the address, false otherwise
   */
  isAuthenticatedFor: (address?: string | null) => boolean
}

/**
 * Zustand store for managing authentication state.
 * Persists authentication data to localStorage.
 *
 * @example
 * ```tsx
 * const { token, isAuthenticated, setAuth, clearAuth } = useAuthStore()
 *
 * if (isAuthenticated()) {
 *   console.log('User is authenticated with token:', token)
 * }
 * ```
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      address: null,

      setAuth: (token, address) => set({ token, address }),
      clearAuth: () => set({ token: null, address: null }),
      isAuthenticated: () => !!get().token,
      isAuthenticatedFor: (address) => {
        const token = get().token
        const storedAddress = get().address
        if (!token || !address || !storedAddress) {
          return false
        }

        return storedAddress.toLowerCase() === address.toLowerCase()
      },
    }),
    {
      name: 'agent-market-auth',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' &&
        typeof localStorage?.getItem === 'function'
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
      ),
    },
  ),
)
