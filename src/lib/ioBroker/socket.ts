import { io, Socket } from 'socket.io-client'

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting'

type StatusListener = (status: ConnectionStatus) => void
type StateChangeListener = (id: string, state: import('./iobroker-types').IoBrokerState | null) => void

let socket: Socket | null = null
let currentUrl = ''
const statusListeners = new Set<StatusListener>()
const stateChangeListeners = new Set<StateChangeListener>()

export function getSocket(): Socket {
  if (!socket || !socket.connected) {
    throw new Error('Socket not connected. Call connect() first.')
  }
  return socket
}

export function connect(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (socket) {
      socket.removeAllListeners()
      socket.disconnect()
    }

    // Always connect socket.io to the current page's origin.
    // In dev:  Vite proxy forwards /socket.io → ioBroker (no CORS).
    // In prod: app is served by ioBroker itself → same-origin, no CORS.
    const effectiveUrl = window.location.origin
    currentUrl = url
    socket = io(effectiveUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: Infinity,
      timeout: 10000,
    })

    const onConnect = () => {
      emitStatus('connected')
      resubscribeAll()
      resolve()
    }

    const onConnectError = (err: Error) => {
      emitStatus('disconnected')
      reject(err)
    }

    socket.once('connect', onConnect)
    socket.once('connect_error', onConnectError)

    socket.on('connect', () => emitStatus('connected'))
    socket.on('disconnect', () => emitStatus('disconnected'))
    socket.on('reconnect_attempt', () => emitStatus('reconnecting'))
    socket.on('reconnect', () => {
      emitStatus('connected')
      resubscribeAll()
    })

    socket.on('stateChange', (id: string, state: import('./iobroker-types').IoBrokerState | null) => {
      stateChangeListeners.forEach(l => l(id, state))
    })

    emitStatus('connecting')
  })
}

export function disconnect() {
  socket?.disconnect()
  socket = null
  currentUrl = ''
}

export function getCurrentUrl() {
  return currentUrl
}

export function onStatusChange(listener: StatusListener) {
  statusListeners.add(listener)
  return () => statusListeners.delete(listener)
}

export function onStateChange(listener: StateChangeListener) {
  stateChangeListeners.add(listener)
  return () => stateChangeListeners.delete(listener)
}

function emitStatus(status: ConnectionStatus) {
  statusListeners.forEach(l => l(status))
}

// Track all currently subscribed IDs for reconnect
const subscribedIds = new Set<string>()

export function trackSubscription(id: string) {
  subscribedIds.add(id)
}

export function untrackSubscription(id: string) {
  subscribedIds.delete(id)
}

function resubscribeAll() {
  if (!socket || subscribedIds.size === 0) return
  for (const id of subscribedIds) {
    socket.emit('subscribeStates', id)
  }
}
