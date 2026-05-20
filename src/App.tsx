import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from './store/useAppStore'
import { useConfigStore } from './store/useConfigStore'
import { useConnectionWatcher } from './hooks/useConnectionStatus'
import { connect } from './lib/ioBroker/socket'
import AppShell from './components/layout/AppShell'
import WizardPage from './pages/WizardPage'
import DashboardPage from './pages/DashboardPage'
import SettingsPage from './pages/SettingsPage'

function AppRouter() {
  useConnectionWatcher()

  const hasCompletedWizard = useAppStore((s) => s.hasCompletedWizard)
  const serverUrl = useAppStore((s) => s.serverUrl)
  const setConnectionStatus = useAppStore((s) => s.setConnectionStatus)
  const firstRoomId = useConfigStore((s) => s.rooms[0]?.id)

  useEffect(() => {
    if (!hasCompletedWizard || !serverUrl) return
    setConnectionStatus('connecting')
    connect(serverUrl).catch(() => setConnectionStatus('disconnected'))
  }, [hasCompletedWizard, serverUrl, setConnectionStatus])

  if (!hasCompletedWizard) {
    return (
      <Routes>
        <Route path="/wizard" element={<WizardPage />} />
        <Route path="*" element={<Navigate to="/wizard" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route
          path="/"
          element={<Navigate to={firstRoomId ? `/dashboard/${firstRoomId}` : '/settings'} replace />}
        />
        <Route path="/dashboard/:roomId" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="*"
          element={<Navigate to={firstRoomId ? `/dashboard/${firstRoomId}` : '/settings'} replace />}
        />
      </Route>
    </Routes>
  )
}

export default function App() {
  const basename = import.meta.env.BASE_URL ?? '/'
  return (
    <BrowserRouter basename={basename}>
      <AppRouter />
    </BrowserRouter>
  )
}
