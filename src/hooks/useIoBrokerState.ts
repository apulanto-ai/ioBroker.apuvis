import { useEffect } from 'react'
import { useStatesStore } from '../store/useStatesStore'
import type { IoBrokerState } from '../lib/ioBroker/iobroker-types'

export function useIoBrokerState(id: string | undefined): [IoBrokerState | null | undefined, (value: unknown) => void] {
  const state = useStatesStore((s) => id ? s.states[id] : undefined)
  const subscribe = useStatesStore((s) => s.subscribe)
  const unsubscribe = useStatesStore((s) => s.unsubscribe)
  const setStateAction = useStatesStore((s) => s.setState)

  useEffect(() => {
    if (!id) return
    subscribe(id)
    return () => unsubscribe(id)
  }, [id, subscribe, unsubscribe])

  const setter = (value: unknown) => {
    if (id) setStateAction(id, value)
  }

  return [state, setter]
}
