import type { Socket } from 'socket.io-client'

// socket.io is loaded via <script src="/socket.io/socket.io.js"> in index.html
// This ensures we use the exact same client version as the ioBroker server
declare const io: (url: string, opts?: Record<string, unknown>) => Socket

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

    // Always connect to current origin:
    // In dev:  Vite proxy forwards /socket.io → ioBroker
    // In prod: app is served by ioBroker itself (same-origin)
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
