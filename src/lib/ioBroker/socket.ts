import { Connection } from '@iobroker/socket-client'

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting'
type StatusListener = (status: ConnectionStatus) => void

let conn: Connection | null = null
let currentUrl = ''
const statusListeners = new Set<StatusListener>()

export function getConnection(): Connection {
  if (!conn) throw new Error('Not connected. Call connect() first.')
  return conn
}

export function connect(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    conn = null

    const urlObj = new URL(url)
    const protocol = urlObj.protocol as 'http:' | 'https:'
    const host = urlObj.hostname
    const port = parseInt(urlObj.port) || (protocol === 'https:' ? 443 : 8082)

    currentUrl = url

    let settled = false
    const settle = (fn: () => void) => {
      if (!settled) {
        settled = true
        fn()
      }
    }

    conn = new Connection({
      protocol,
      host,
      port,
      doNotLoadAllObjects: true,
      doNotLoadACL: true,
    })

    conn.registerConnectionHandler((connected: boolean) => {
      if (connected) {
        settle(() => {
          emitStatus('connected')
          resolve()
        })
      } else {
        emitStatus('disconnected')
      }
    })

    conn.startSocket().catch((err: Error) => {
      settle(() => {
        emitStatus('disconnected')
        reject(err)
      })
    })

    emitStatus('connecting')

    setTimeout(() => {
      settle(() => {
        emitStatus('disconnected')
        reject(new Error('Connection timeout after 10s'))
      })
    }, 10000)
  })
}

export function disconnect() {
  conn = null
  currentUrl = ''
  emitStatus('disconnected')
}

export function getCurrentUrl() {
  return currentUrl
}

export function onStatusChange(listener: StatusListener) {
  statusListeners.add(listener)
  return () => statusListeners.delete(listener)
}

function emitStatus(status: ConnectionStatus) {
  statusListeners.forEach(l => l(status))
}
