import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AuthGuard, GuestGuard, LoginPage } from './pages/LoginPage'
import { ErrorBoundary } from './components/ErrorBoundary'
import './App.css'

// Route-split the heavier authenticated screens (lesson engine, graph
// renderers, lesson content) so the initial load only ships the login shell.
const HomePage = lazy(() =>
  import('./pages/HomePage').then((m) => ({ default: m.HomePage })),
)
const LessonPage = lazy(() =>
  import('./pages/LessonPage').then((m) => ({ default: m.LessonPage })),
)
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)

function RouteFallback() {
  return (
    <div className="auth-page lesson-loading">
      <p>Loading…</p>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
            <Route
              path="/login"
              element={
                <GuestGuard>
                  <LoginPage />
                </GuestGuard>
              }
            />
            <Route
              path="/"
              element={
                <AuthGuard>
                  <HomePage />
                </AuthGuard>
              }
            />
            <Route
              path="/lesson/:lessonId"
              element={
                <AuthGuard>
                  <LessonPage />
                </AuthGuard>
              }
            />
            <Route
              path="/settings"
              element={
                <AuthGuard>
                  <SettingsPage />
                </AuthGuard>
              }
            />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
