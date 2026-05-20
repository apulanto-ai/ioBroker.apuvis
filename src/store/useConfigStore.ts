import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RoomConfig } from '../types/room.types'
import type { WidgetConfig, GridPosition } from '../types/widget.types'

interface ConfigState {
  rooms: RoomConfig[]
  widgets: Record<string, WidgetConfig[]>
  version: number

  setRooms: (rooms: RoomConfig[]) => void
  addRoom: (room: RoomConfig) => void
  removeRoom: (id: string) => void
  updateRoom: (id: string, patch: Partial<RoomConfig>) => void
  reorderRooms: (ids: string[]) => void

  setWidgets: (roomId: string, widgets: WidgetConfig[]) => void
  addWidget: (roomId: string, widget: WidgetConfig) => void
  removeWidget: (roomId: string, widgetId: string) => void
  updateWidget: (roomId: string, widgetId: string, patch: Partial<WidgetConfig>) => void
  updateWidgetGrid: (roomId: string, widgetId: string, grid: GridPosition) => void
  clearWidgets: (roomId: string) => void
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      rooms: [],
      widgets: {},
      version: 1,

      setRooms: (rooms) => set({ rooms }),
      addRoom: (room) => set((s) => ({ rooms: [...s.rooms, room] })),
      removeRoom: (id) =>
        set((s) => {
          const widgets = { ...s.widgets }
          delete widgets[id]
          return { rooms: s.rooms.filter((r) => r.id !== id), widgets }
        }),
      updateRoom: (id, patch) =>
        set((s) => ({ rooms: s.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      reorderRooms: (ids) =>
        set((s) => ({
          rooms: ids.map((id, i) => {
            const room = s.rooms.find((r) => r.id === id)!
            return { ...room, order: i }
          }),
        })),

      setWidgets: (roomId, widgets) =>
        set((s) => ({ widgets: { ...s.widgets, [roomId]: widgets } })),
      addWidget: (roomId, widget) =>
        set((s) => ({
          widgets: { ...s.widgets, [roomId]: [...(s.widgets[roomId] ?? []), widget] },
        })),
      removeWidget: (roomId, widgetId) =>
        set((s) => ({
          widgets: {
            ...s.widgets,
            [roomId]: (s.widgets[roomId] ?? []).filter((w) => w.id !== widgetId),
          },
        })),
      updateWidget: (roomId, widgetId, patch) =>
        set((s) => ({
          widgets: {
            ...s.widgets,
            [roomId]: (s.widgets[roomId] ?? []).map((w) =>
              w.id === widgetId ? ({ ...w, ...patch } as WidgetConfig) : w
            ),
          },
        })),
      updateWidgetGrid: (roomId, widgetId, grid) =>
        set((s) => ({
          widgets: {
            ...s.widgets,
            [roomId]: (s.widgets[roomId] ?? []).map((w) =>
              w.id === widgetId ? { ...w, grid } : w
            ),
          },
        })),
      clearWidgets: (roomId) =>
        set((s) => ({ widgets: { ...s.widgets, [roomId]: [] } })),
    }),
    {
      name: 'apuvis-config',
    }
  )
)
