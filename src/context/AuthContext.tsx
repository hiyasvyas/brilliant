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
  deleteUser,
  EmailAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile,
  type User,
  type UserCredential,
} from 'firebase/auth'
import { getFirebaseAuth, getGoogleProvider, isFirebaseConfigured } from '../lib/firebase'
import {
  getUserProfile,
  updateProfileDisplayName,
  upsertUserProfile,
} from '../services/progressService'
import type { UserProfile } from '../types/lesson'

export type AuthIntent = 'login' | 'signup'

/** Error code thrown when someone tries to log in without having signed up. */
export const NO_ACCOUNT_CODE = 'app/no-account'
/** sessionStorage keys used to carry state across a full-page auth redirect. */
const GOOGLE_INTENT_KEY = 'auth:googleIntent'
export const REDIRECT_ERROR_KEY = 'auth:redirectError'

interface AuthContextValue {
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

const AuthContext = createContext<AuthContextValue | null>(null)

function noAccountError(): Error & { code: string } {
  const err = new Error('No account yet — please sign up first.') as Error & { code: string }
  err.code = NO_ACCOUNT_CODE
  return err
}

/**
 * Mobile browsers (especially iOS Safari and in-app webviews) routinely block
 * auth popups, so we use a full-page redirect there and a popup on desktop.
 */
function prefersRedirectAuth(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile|Silk|Kindle/i.test(navigator.userAgent)
}

function displayNameFor(user: User): string {
  return user.displayName ?? user.email?.split('@')[0] ?? 'Learner'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isFirebaseConfigured()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  // Start "loading" only when Firebase is configured; otherwise there is no
  // auth state to wait for, so we can render immediately.
  const [loading, setLoading] = useState(configured)

  // An account counts as "signed up" only once it has a profile document. On a
  // login attempt with no profile, we undo the just-created Google credential
  // and ask the person to sign up; a signup intent creates the profile.
  const finalizeGoogleUser = useCallback(
    async (cred: UserCredential, intent: AuthIntent) => {
      const auth = getFirebaseAuth()
      const existing = await getUserProfile(cred.user.uid)
      if (intent === 'login' && !existing) {
        try {
          await deleteUser(cred.user)
        } catch {
          await signOut(auth)
        }
        throw noAccountError()
      }
      const p = existing ?? (await upsertUserProfile(cred.user.uid, displayNameFor(cred.user)))
      setProfile(p)
    },
    [],
  )

  useEffect(() => {
    if (!configured) return

    const auth = getFirebaseAuth()

    // Completes any in-flight mobile redirect sign-in, applying the same
    // signup-first gate the popup path uses. A "no account" rejection is
    // stashed so the login page can show it after the redirect reload.
    getRedirectResult(auth)
      .then((cred) => {
        if (!cred) return
        const intent =
          (sessionStorage.getItem(GOOGLE_INTENT_KEY) as AuthIntent | null) ?? 'login'
        sessionStorage.removeItem(GOOGLE_INTENT_KEY)
        return finalizeGoogleUser(cred, intent)
      })
      .catch((err) => {
        if ((err as { code?: string }).code === NO_ACCOUNT_CODE) {
          sessionStorage.setItem(REDIRECT_ERROR_KEY, NO_ACCOUNT_CODE)
        }
      })

    return onAuthStateChanged(auth, async (u: User | null) => {
      setUser(u)
      setProfile(u ? await getUserProfile(u.uid) : null)
      setLoading(false)
    })
  }, [configured, finalizeGoogleUser])

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

  const signInWithGoogle = useCallback(
    async (intent: AuthIntent = 'login') => {
      const auth = getFirebaseAuth()
      const provider = getGoogleProvider()
      if (prefersRedirectAuth()) {
        sessionStorage.setItem(GOOGLE_INTENT_KEY, intent)
        // Navigates away; getRedirectResult + onAuthStateChanged finish the job.
        await signInWithRedirect(auth, provider)
        return
      }
      let cred: UserCredential
      try {
        cred = await signInWithPopup(auth, provider)
      } catch (err) {
        // When the popup is blocked or can't run here, fall back to a full-page
        // redirect instead of silently failing.
        const code = (err as { code?: string }).code ?? ''
        if (
          code === 'auth/popup-blocked' ||
          code === 'auth/popup-closed-by-user' ||
          code === 'auth/cancelled-popup-request' ||
          code === 'auth/operation-not-supported-in-this-environment'
        ) {
          sessionStorage.setItem(GOOGLE_INTENT_KEY, intent)
          await signInWithRedirect(auth, provider)
          return
        }
        throw err
      }
      await finalizeGoogleUser(cred, intent)
    },
    [finalizeGoogleUser],
  )

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
