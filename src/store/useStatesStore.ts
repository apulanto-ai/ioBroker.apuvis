import { create } from 'zustand'
import { getSocket } from '../lib/ioBroker/socket'
import { subscribeStates, unsubscribeStates, getState } from '../lib/ioBroker/iobroker-api'
import { trackSubscription, untrackSubscription } from '../lib/ioBroker/socket'
import type { IoBrokerState } from '../lib/ioBroker/iobroker-types'

interface StatesState {
  states: Record<string, IoBrokerState | null>
  refCounts: Record<string, number>

  _handleStateChange: (id: string, state: IoBrokerState | null) => void
  subscribe: (id: string) => void
  unsubscribe: (id: string) => void
  setState: (id: string, value: unknown) => void
  getValue: (id: string) => IoBrokerState | null | undefined
}

export const useStatesStore = create<StatesState>((set, get) => ({
  states: {},
  refCounts: {},

  _handleStateChange: (id, state) => {
    set((s) => ({ states: { ...s.states, [id]: state } }))
  },

  subscribe: async (id) => {
    const s = get()
    const count = s.refCounts[id] ?? 0

    set((st) => ({
      refCounts: { ...st.refCounts, [id]: count + 1 },
    }))

    if (count === 0) {
      trackSubscription(id)
      try {
        subscribeStates(id)
        const current = await getState(id)
        set((st) => ({ states: { ...st.states, [id]: current } }))
      } catch {
        // socket might not be ready yet; state will arrive via stateChange
      }
    }
  },

  unsubscribe: (id) => {
    const count = get().refCounts[id] ?? 0
    if (count <= 1) {
      set((s) => {
        const refCounts = { ...s.refCounts }
        delete refCounts[id]
        return { refCounts }
      })
      untrackSubscription(id)
      try {
        unsubscribeStates(id)
      } catch {
        // ignore if socket is gone
      }
    } else {
      set((s) => ({ refCounts: { ...s.refCounts, [id]: count - 1 } }))
    }
  },

  setState: (id, value) => {
    const current = get().states[id]
    // optimistic update
    set((s) => ({
      states: {
        ...s.states,
        [id]: current ? { ...current, val: value as IoBrokerState['val'], ack: false } : null,
      },
    }))

    try {
      const socket = getSocket()
      socket.emit('setState', id, value, (err: string | null) => {
        if (err) {
          // rollback on error
          set((s) => ({ states: { ...s.states, [id]: current ?? null } }))
        }
      })
    } catch {
      set((s) => ({ states: { ...s.states, [id]: current ?? null } }))
    }
  },

  getValue: (id) => get().states[id],
}))
