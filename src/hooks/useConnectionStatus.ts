import { useEffect } from 'react'
import { onStatusChange } from '../lib/ioBroker/socket'
import { onStateChange } from '../lib/ioBroker/socket'
import { useAppStore } from '../store/useAppStore'
import { useStatesStore } from '../store/useStatesStore'

export function useConnectionWatcher() {
  const setStatus = useAppStore((s) => s.setConnectionStatus)
  const handleStateChange = useStatesStore((s) => s._handleStateChange)

  useEffect(() => {
    const unsubStatus = onStatusChange(setStatus)
    const unsubState = onStateChange(handleStateChange)
    return () => {
      unsubStatus()
      unsubState()
    }
  }, [setStatus, handleStateChange])
}
