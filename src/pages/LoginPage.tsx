import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { NO_ACCOUNT_CODE, REDIRECT_ERROR_KEY, useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { signIn, signUp, signInWithGoogle, configured } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Surface a "no account" result that came back from a mobile redirect.
  useEffect(() => {
    if (sessionStorage.getItem(REDIRECT_ERROR_KEY) === NO_ACCOUNT_CODE) {
      sessionStorage.removeItem(REDIRECT_ERROR_KEY)
      setMode('signup')
      setError("You don't have an account yet — please sign up. You can use email & password or Google.")
    }
  }, [])

  const handleAuthError = (err: unknown) => {
    const code = (err as { code?: string }).code ?? ''
    switch (code) {
      case NO_ACCOUNT_CODE:
        setMode('signup')
        setError("You don't have an account yet — please sign up below. You can use email & password or Google.")
        return
      case 'auth/email-already-in-use':
        setMode('login')
        setError('An account with this email already exists — please log in.')
        return
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        setError('Incorrect email or password. New here? Tap “Sign up” below to create an account.')
        return
      case 'auth/unauthorized-domain':
        setError('This site isn’t authorized for Google sign-in yet. Add this domain under Firebase Authentication → Settings → Authorized domains.')
        return
      case 'auth/operation-not-allowed':
        setError('That sign-in method is disabled. Enable it in Firebase Authentication → Sign-in method.')
        return
      default:
        setError(err instanceof Error ? err.message : 'Authentication failed')
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'signup') await signUp(email, password, name || 'Learner')
      else await signIn(email, password)
    } catch (err) {
      handleAuthError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle(mode === 'signup' ? 'signup' : 'login')
    } catch (err) {
      handleAuthError(err)
    } finally {
      setLoading(false)
    }
  }

  if (!configured) {
    return (
      <div className="auth-page">
        <h1>Setup required</h1>
        <p>Add Firebase web config to your <code>.env</code> file:</p>
        <pre className="setup-notice">{`VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=tiktokwork-e2972
VITE_FIREBASE_APP_ID=...`}</pre>
        <p>Get these from Firebase Console → Project settings → Your apps → Web app.</p>
        <p>
          Then enable <strong>Authentication → Sign-in method → Google</strong> (and
          Email/Password) in Firebase Console.
        </p>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <h1>{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
      <p>Algebra for 9th graders — learn by doing.</p>
      <form className="auth-form" onSubmit={submit}>
        {mode === 'signup' && (
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password (6+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="btn primary full" disabled={loading}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>
      </form>

      <div className="auth-divider">
        <span>or</span>
      </div>

      <button
        type="button"
        className="btn google-btn full"
        onClick={() => void handleGoogle()}
        disabled={loading}
      >
        <span className="google-g" aria-hidden="true">G</span>
        {mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
      </button>

      <button
        type="button"
        className="auth-link"
        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
      >
        {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in'}
      </button>
    </div>
  )
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, configured } = useAuth()
  if (!configured) return <>{children}</>
  if (loading) return <div className="auth-page"><p>Loading…</p></div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}
