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

// ioBroker serves socket.io.js (or @iobroker/ws compat script) at /socket.io/socket.io.js.
// This sets window.io (socket.io) or window.iob (@iobroker/ws), which @iobroker/socket-client needs.
function loadSocketLibrary(baseUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById('iobroker-socket-lib')
    if (existing) existing.remove()
    ;(globalThis as any).io = undefined
    ;(globalThis as any).iob = undefined

    const script = document.createElement('script')
    script.id = 'iobroker-socket-lib'
    script.src = `${baseUrl}/socket.io/socket.io.js`
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Socket-Library nicht ladbar von ${baseUrl}`))
    document.head.appendChild(script)
  })
}

export function connect(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    conn = null

    const urlObj = new URL(url)
    const protocol = urlObj.protocol as 'http:' | 'https:'
    const host = urlObj.hostname
    const port = parseInt(urlObj.port) || (protocol === 'https:' ? 443 : 8082)
    const baseUrl = `${urlObj.protocol}//${urlObj.hostname}${urlObj.port ? ':' + urlObj.port : ''}`

    currentUrl = url

    let settled = false
    const settle = (fn: () => void) => {
      if (!settled) {
        settled = true
        fn()
      }
    }

    loadSocketLibrary(baseUrl)
      .then(() => {
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
            reject(new Error('Verbindungs-Timeout nach 10s'))
          })
        }, 10000)
      })
      .catch(err => {
        settle(() => {
          emitStatus('disconnected')
          reject(err)
        })
      })
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
