import { createContext, useContext } from 'react'
import type { User } from 'firebase/auth'
import type { UserProfile } from '../types/lesson'

export type AuthIntent = 'login' | 'signup'

/** Error code thrown when someone tries to log in without having signed up. */
export const NO_ACCOUNT_CODE = 'app/no-account'
/** sessionStorage key used to carry a failed-redirect state across a full-page auth redirect. */
export const REDIRECT_ERROR_KEY = 'auth:redirectError'

export interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  configured: boolean
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: (intent?: AuthIntent) => Promise<void>
  logOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  changeUsername: (displayName: string) => Promise<void>
  changeEmail: (newEmail: string, currentPassword: string) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
