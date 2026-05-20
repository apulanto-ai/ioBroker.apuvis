import { create } from 'zustand'
import { getConnection } from '../lib/ioBroker/socket'
import type { IoBrokerState } from '../lib/ioBroker/iobroker-types'

// Per-ID state change handlers for clean unsubscription
const stateHandlers = new Map<string, ioBroker.StateChangeHandler>()

interface StatesState {
  states: Record<string, IoBrokerState | null>
  refCounts: Record<string, number>

  subscribe: (id: string) => void
  unsubscribe: (id: string) => void
  setState: (id: string, value: unknown) => void
  getValue: (id: string) => IoBrokerState | null | undefined
}

export const useStatesStore = create<StatesState>((set, get) => ({
  states: {},
  refCounts: {},

  subscribe: async (id) => {
    const count = get().refCounts[id] ?? 0
    set((s) => ({ refCounts: { ...s.refCounts, [id]: count + 1 } }))

    if (count === 0) {
      const handler: ioBroker.StateChangeHandler = (stateId, state) => {
        set((s) => ({ states: { ...s.states, [stateId ?? id]: state as IoBrokerState | null } }))
      }
      stateHandlers.set(id, handler)
      try {
        // subscribeState calls handler immediately with current value, then on every change
        await getConnection().subscribeState(id, handler)
      } catch {
        // not connected yet; will be subscribed on next connect
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
      const handler = stateHandlers.get(id)
      if (handler) {
        stateHandlers.delete(id)
        try {
          getConnection().unsubscribeState(id, handler)
        } catch {
          // ignore if disconnected
        }
      }
    } else {
      set((s) => ({ refCounts: { ...s.refCounts, [id]: count - 1 } }))
    }
  },

  setState: (id, value) => {
    const current = get().states[id]
    set((s) => ({
      states: {
        ...s.states,
        [id]: current ? { ...current, val: value as IoBrokerState['val'], ack: false } : null,
      },
    }))
    try {
      getConnection().setState(id, value as ioBroker.StateValue).catch(() => {
        set((s) => ({ states: { ...s.states, [id]: current ?? null } }))
      })
    } catch {
      set((s) => ({ states: { ...s.states, [id]: current ?? null } }))
    }
  },

  getValue: (id) => get().states[id],
}))
