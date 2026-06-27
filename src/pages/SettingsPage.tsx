import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context'
import {
  getAiHintOverride,
  isAiHintFlagEnabled,
  setAiHintOverride,
} from '../services/aiHint'
import { isFirebaseConfigured } from '../lib/firebase'

type Status = { kind: 'idle' | 'ok' | 'error'; message: string }

export function SettingsPage() {
  const { user, profile, changeUsername, changeEmail, changePassword, logOut } = useAuth()
  const navigate = useNavigate()

  const isGoogleUser = user?.providerData.some((p) => p.providerId === 'google.com') ?? false

  const [username, setUsername] = useState(profile?.displayName ?? user?.displayName ?? '')
  const [usernameStatus, setUsernameStatus] = useState<Status>({ kind: 'idle', message: '' })
  const [savingUsername, setSavingUsername] = useState(false)

  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [emailStatus, setEmailStatus] = useState<Status>({ kind: 'idle', message: '' })
  const [savingEmail, setSavingEmail] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState<Status>({ kind: 'idle', message: '' })
  const [savingPassword, setSavingPassword] = useState(false)

  // AI hints can be flipped on/off live (stored in localStorage). null override
  // means "follow the build-time default". We track the resolved on/off state.
  const firebaseReady = isFirebaseConfigured()
  const [aiHintsOn, setAiHintsOn] = useState(isAiHintFlagEnabled())
  const aiOverridden = getAiHintOverride() !== null

  const toggleAiHints = () => {
    const next = !aiHintsOn
    setAiHintOverride(next)
    setAiHintsOn(next)
  }

  const saveUsername = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingUsername(true)
    setUsernameStatus({ kind: 'idle', message: '' })
    try {
      await changeUsername(username.trim() || 'Learner')
      setUsernameStatus({ kind: 'ok', message: 'Username updated.' })
    } catch (err) {
      setUsernameStatus({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Could not update username.',
      })
    } finally {
      setSavingUsername(false)
    }
  }

  const saveEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingEmail(true)
    setEmailStatus({ kind: 'idle', message: '' })
    try {
      await changeEmail(newEmail.trim(), emailPassword)
      setEmailStatus({ kind: 'ok', message: 'Email updated. You may need to sign in again.' })
      setNewEmail('')
      setEmailPassword('')
    } catch (err) {
      setEmailStatus({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Could not update email.',
      })
    } finally {
      setSavingEmail(false)
    }
  }

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPassword(true)
    setPasswordStatus({ kind: 'idle', message: '' })
    try {
      await changePassword(currentPassword, newPassword)
      setPasswordStatus({ kind: 'ok', message: 'Password updated.' })
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setPasswordStatus({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Could not update password.',
      })
    } finally {
      setSavingPassword(false)
    }
  }

  const statusClass = (s: Status) =>
    s.kind === 'ok' ? 'settings-status ok' : s.kind === 'error' ? 'settings-status error' : 'settings-status'

  return (
    <div className="app-shell settings-page">
      <header className="settings-header">
        <button type="button" className="back-btn" onClick={() => navigate('/')}>
          ←
        </button>
        <h1>Settings</h1>
      </header>

      <section className="settings-section">
        <h2>Account</h2>
        <p className="settings-meta">Signed in as {user?.email ?? 'Google account'}</p>
        {profile && (
          <p className="settings-meta">
            {profile.totalXp} total XP · {profile.lessonsCompleted.length} lessons completed
          </p>
        )}
      </section>

      <section className="settings-section">
        <h2>AI smart hints</h2>
        <p className="settings-meta">
          AI hints are an optional enhancement. Turn them off and the lessons still
          teach fully — the hint ladder falls back to hand-written, math-checked hints.
        </p>
        <div className="settings-toggle-row">
          <span className="settings-toggle-label">
            Smart hints {aiHintsOn ? 'on' : 'off'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={aiHintsOn}
            aria-label="Toggle AI smart hints"
            className={`settings-switch${aiHintsOn ? ' on' : ''}`}
            onClick={toggleAiHints}
          >
            <span className="settings-switch-knob" />
          </button>
        </div>
        {!firebaseReady && (
          <p className="settings-status">
            AI also needs Firebase configured — it's currently unavailable, so the
            app runs on fallback hints regardless of this toggle.
          </p>
        )}
        {aiOverridden && (
          <p className="settings-meta">
            Overriding the build default. This choice is remembered on this device.
          </p>
        )}
      </section>

      <form className="settings-section" onSubmit={(e) => void saveUsername(e)}>
        <h2>Username</h2>
        <label className="settings-label">
          Display name
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name"
          />
        </label>
        {usernameStatus.message && (
          <p className={statusClass(usernameStatus)}>{usernameStatus.message}</p>
        )}
        <button type="submit" className="btn primary full" disabled={savingUsername}>
          {savingUsername ? 'Saving…' : 'Save username'}
        </button>
      </form>

      {!isGoogleUser && (
        <form className="settings-section" onSubmit={(e) => void saveEmail(e)}>
          <h2>Change email</h2>
          <label className="settings-label">
            New email
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new@email.com"
              required
            />
          </label>
          <label className="settings-label">
            Current password
            <input
              type="password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              placeholder="Current password"
              required
            />
          </label>
          {emailStatus.message && <p className={statusClass(emailStatus)}>{emailStatus.message}</p>}
          <button type="submit" className="btn primary full" disabled={savingEmail}>
            {savingEmail ? 'Saving…' : 'Update email'}
          </button>
        </form>
      )}

      {!isGoogleUser && (
        <form className="settings-section" onSubmit={(e) => void savePassword(e)}>
          <h2>Change password</h2>
          <label className="settings-label">
            Current password
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              required
            />
          </label>
          <label className="settings-label">
            New password (6+ characters)
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              minLength={6}
              required
            />
          </label>
          {passwordStatus.message && (
            <p className={statusClass(passwordStatus)}>{passwordStatus.message}</p>
          )}
          <button type="submit" className="btn primary full" disabled={savingPassword}>
            {savingPassword ? 'Saving…' : 'Update password'}
          </button>
        </form>
      )}

      {isGoogleUser && (
        <section className="settings-section">
          <p className="settings-meta">
            You signed in with Google. Manage your email and password in your Google account.
          </p>
        </section>
      )}

      <section className="settings-section">
        <button type="button" className="btn secondary full" onClick={() => void logOut()}>
          Log out
        </button>
      </section>
    </div>
  )
}
