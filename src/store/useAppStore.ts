import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting'
type Theme = 'dark' | 'light' | 'system'
type AccentColor = 'blue' | 'green' | 'amber' | 'rose' | 'purple'
type LayoutDensity = 'compact' | 'comfortable' | 'spacious'

interface AppState {
  serverUrl: string
  hasCompletedWizard: boolean
  connectionStatus: ConnectionStatus
  theme: Theme
  accentColor: AccentColor
  layoutDensity: LayoutDensity
  weatherApiKey: string
  version: number

  setServerUrl: (url: string) => void
  setHasCompletedWizard: (v: boolean) => void
  setConnectionStatus: (s: ConnectionStatus) => void
  setTheme: (t: Theme) => void
  setAccentColor: (c: AccentColor) => void
  setLayoutDensity: (d: LayoutDensity) => void
  setWeatherApiKey: (key: string) => void
  resetWizard: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      serverUrl: 'http://localhost:8082',
      hasCompletedWizard: false,
      connectionStatus: 'disconnected',
      theme: 'dark',
      accentColor: 'blue',
      layoutDensity: 'comfortable',
      weatherApiKey: '',
      version: 1,

      setServerUrl: (url) => set({ serverUrl: url }),
      setHasCompletedWizard: (v) => set({ hasCompletedWizard: v }),
      setConnectionStatus: (s) => set({ connectionStatus: s }),
      setTheme: (t) => set({ theme: t }),
      setAccentColor: (c) => set({ accentColor: c }),
      setLayoutDensity: (d) => set({ layoutDensity: d }),
      setWeatherApiKey: (key) => set({ weatherApiKey: key }),
      resetWizard: () => set({ hasCompletedWizard: false }),
    }),
    {
      name: 'apuvis-app',
      partialize: (s) => ({
        serverUrl: s.serverUrl,
        hasCompletedWizard: s.hasCompletedWizard,
        theme: s.theme,
        accentColor: s.accentColor,
        layoutDensity: s.layoutDensity,
        weatherApiKey: s.weatherApiKey,
        version: s.version,
      }),
    }
  )
)
