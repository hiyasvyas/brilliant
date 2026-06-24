import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile,
  type User,
} from 'firebase/auth'
import { getFirebaseAuth, getGoogleProvider, isFirebaseConfigured } from '../lib/firebase'
import {
  getUserProfile,
  updateProfileDisplayName,
  upsertUserProfile,
} from '../services/progressService'
import type { UserProfile } from '../types/lesson'

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  configured: boolean
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  changeUsername: (displayName: string) => Promise<void>
  changeEmail: (newEmail: string, currentPassword: string) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const configured = isFirebaseConfigured()

  useEffect(() => {
    if (!configured) {
      setLoading(false)
      return
    }

    const auth = getFirebaseAuth()
    return onAuthStateChanged(auth, async (u: User | null) => {
      setUser(u)
      if (u) {
        const p = await getUserProfile(u.uid)
        setProfile(p)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
  }, [configured])

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      const auth = getFirebaseAuth()
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName })
      const p = await upsertUserProfile(cred.user.uid, displayName)
      setProfile(p)
    },
    [],
  )

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth()
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const name = cred.user.displayName ?? email.split('@')[0] ?? 'Learner'
    const p = await upsertUserProfile(cred.user.uid, name)
    setProfile(p)
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth()
    const cred = await signInWithPopup(auth, getGoogleProvider())
    const name =
      cred.user.displayName ?? cred.user.email?.split('@')[0] ?? 'Learner'
    const p = await upsertUserProfile(cred.user.uid, name)
    setProfile(p)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    const p = await getUserProfile(user.uid)
    setProfile(p)
  }, [user])

  const changeUsername = useCallback(
    async (displayName: string) => {
      const auth = getFirebaseAuth()
      if (!auth.currentUser) throw new Error('Not signed in')
      await updateProfile(auth.currentUser, { displayName })
      const p = await updateProfileDisplayName(auth.currentUser.uid, displayName)
      setProfile(p)
    },
    [],
  )

  const changeEmail = useCallback(
    async (newEmail: string, currentPassword: string) => {
      const auth = getFirebaseAuth()
      const current = auth.currentUser
      if (!current || !current.email) throw new Error('Not signed in with email')
      const credential = EmailAuthProvider.credential(current.email, currentPassword)
      await reauthenticateWithCredential(current, credential)
      await updateEmail(current, newEmail)
    },
    [],
  )

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const auth = getFirebaseAuth()
      const current = auth.currentUser
      if (!current || !current.email) throw new Error('Not signed in with email')
      const credential = EmailAuthProvider.credential(current.email, currentPassword)
      await reauthenticateWithCredential(current, credential)
      await updatePassword(current, newPassword)
    },
    [],
  )

  const logOut = useCallback(async () => {
    await signOut(getFirebaseAuth())
    setProfile(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      configured,
      signUp,
      signIn,
      signInWithGoogle,
      logOut,
      refreshProfile,
      changeUsername,
      changeEmail,
      changePassword,
    }),
    [
      user,
      profile,
      loading,
      configured,
      signUp,
      signIn,
      signInWithGoogle,
      logOut,
      refreshProfile,
      changeUsername,
      changeEmail,
      changePassword,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
