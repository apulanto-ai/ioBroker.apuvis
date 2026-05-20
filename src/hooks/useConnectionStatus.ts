import { useEffect } from 'react'
import { onStatusChange } from '../lib/ioBroker/socket'
import { useAppStore } from '../store/useAppStore'

export function useConnectionWatcher() {
  const setStatus = useAppStore((s) => s.setConnectionStatus)

  useEffect(() => {
    const unsub = onStatusChange(setStatus)
    return () => { unsub() }
  }, [setStatus])
}
