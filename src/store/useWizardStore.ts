import { create } from 'zustand'
import type { DiscoveredRoom, DiscoveredDataPoint } from '../lib/ioBroker/discovery'
import type { WidgetConfig } from '../types/widget.types'

interface WizardRoom {
  id: string
  ioBrokerId: string
  name: string
  selected: boolean
  dataPoints: DiscoveredDataPoint[]
  selectedDataPointIds: string[]
}

interface WizardState {
  step: number
  serverUrl: string
  rooms: WizardRoom[]
  theme: 'dark' | 'light' | 'system'
  accentColor: 'blue' | 'green' | 'amber' | 'rose' | 'purple'
  layoutDensity: 'compact' | 'comfortable' | 'spacious'

  setStep: (step: number) => void
  setServerUrl: (url: string) => void
  setDiscoveredRooms: (rooms: DiscoveredRoom[]) => void
  toggleRoom: (id: string) => void
  renameRoom: (id: string, name: string) => void
  setRoomDataPoints: (roomId: string, dataPoints: DiscoveredDataPoint[]) => void
  toggleDataPoint: (roomId: string, dpId: string) => void
  selectAllDataPoints: (roomId: string) => void
  setTheme: (t: 'dark' | 'light' | 'system') => void
  setAccentColor: (c: 'blue' | 'green' | 'amber' | 'rose' | 'purple') => void
  setLayoutDensity: (d: 'compact' | 'comfortable' | 'spacious') => void
  reset: () => void

  getSelectedRooms: () => WizardRoom[]
  buildWidgetConfigs: () => Record<string, WidgetConfig[]>
}

let _widgetIdCounter = 0
function newId() {
  return `widget-${++_widgetIdCounter}-${Date.now()}`
}

const initialState = {
  step: 1,
  serverUrl: 'http://localhost:8082',
  rooms: [] as WizardRoom[],
  theme: 'dark' as const,
  accentColor: 'blue' as const,
  layoutDensity: 'comfortable' as const,
}

export const useWizardStore = create<WizardState>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setServerUrl: (url) => set({ serverUrl: url }),

  setDiscoveredRooms: (discoveredRooms) =>
    set({
      rooms: discoveredRooms.map((r, i) => ({
        id: r.id,
        ioBrokerId: r.id,
        name: r.name,
        selected: i < 6,
        dataPoints: [],
        selectedDataPointIds: [],
      })),
    }),

  toggleRoom: (id) =>
    set((s) => ({
      rooms: s.rooms.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)),
    })),

  renameRoom: (id, name) =>
    set((s) => ({
      rooms: s.rooms.map((r) => (r.id === id ? { ...r, name } : r)),
    })),

  setRoomDataPoints: (roomId, dataPoints) =>
    set((s) => ({
      rooms: s.rooms.map((r) =>
        r.id === roomId
          ? { ...r, dataPoints, selectedDataPointIds: dataPoints.map((dp) => dp.id) }
          : r
      ),
    })),

  toggleDataPoint: (roomId, dpId) =>
    set((s) => ({
      rooms: s.rooms.map((r) => {
        if (r.id !== roomId) return r
        const has = r.selectedDataPointIds.includes(dpId)
        return {
          ...r,
          selectedDataPointIds: has
            ? r.selectedDataPointIds.filter((id) => id !== dpId)
            : [...r.selectedDataPointIds, dpId],
        }
      }),
    })),

  selectAllDataPoints: (roomId) =>
    set((s) => ({
      rooms: s.rooms.map((r) =>
        r.id === roomId ? { ...r, selectedDataPointIds: r.dataPoints.map((dp) => dp.id) } : r
      ),
    })),

  setTheme: (t) => set({ theme: t }),
  setAccentColor: (c) => set({ accentColor: c }),
  setLayoutDensity: (d) => set({ layoutDensity: d }),
  reset: () => set(initialState),

  getSelectedRooms: () => get().rooms.filter((r) => r.selected),

  buildWidgetConfigs: () => {
    const result: Record<string, WidgetConfig[]> = {}
    const selectedRooms = get().rooms.filter((r) => r.selected)
    const cols = get().layoutDensity === 'compact' ? 3 : get().layoutDensity === 'spacious' ? 5 : 4

    for (const room of selectedRooms) {
      const widgets: WidgetConfig[] = []
      let col = 0
      let row = 0

      for (const dp of room.dataPoints) {
        if (!room.selectedDataPointIds.includes(dp.id)) continue

        const w = dp.suggestedWidgetType === 'chart' ? 2 : 1
        if (col + w > cols) { col = 0; row++ }

        const grid = { x: col, y: row, w, h: dp.suggestedWidgetType === 'chart' ? 2 : 1, minW: 1, minH: 1 }
        col += w

        switch (dp.suggestedWidgetType) {
          case 'switch':
            widgets.push({ id: newId(), type: 'switch', title: dp.name, grid, stateId: dp.id })
            break
          case 'light':
            widgets.push({ id: newId(), type: 'light', title: dp.name, grid, stateId: dp.id })
            break
          case 'thermostat':
            widgets.push({ id: newId(), type: 'thermostat', title: dp.name, grid, setpointId: dp.id, step: 0.5 })
            break
          case 'chart':
            widgets.push({ id: newId(), type: 'chart', title: dp.name, grid, stateId: dp.id, unit: dp.unit, defaultRange: '24h' })
            break
          default:
            widgets.push({ id: newId(), type: 'sensor', title: dp.name, grid, stateId: dp.id, unit: dp.unit })
        }
      }

      result[room.id] = widgets
    }

    return result
  },
}))
