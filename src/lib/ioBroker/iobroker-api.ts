import { getSocket } from './socket'
import type { IoBrokerState, IoBrokerObject, IoBrokerSystemConfig, HistoryOptions, HistoryDataPoint } from './iobroker-types'

function emit<T>(event: string, ...args: unknown[]): Promise<T> {
  return new Promise((resolve, reject) => {
    const socket = getSocket()
    socket.emit(event, ...args, (err: string | null, result: T) => {
      if (err) reject(new Error(err))
      else resolve(result)
    })
  })
}

export async function getSystemConfig(): Promise<IoBrokerSystemConfig> {
  const result = await emit<{ common: IoBrokerSystemConfig }>('getObject', 'system.config')
  return result.common
}

export async function getObject(id: string): Promise<IoBrokerObject | null> {
  return emit<IoBrokerObject | null>('getObject', id)
}

export async function getObjects(pattern: string): Promise<Record<string, IoBrokerObject>> {
  return emit<Record<string, IoBrokerObject>>('getObjects', pattern)
}

export async function getObjectView(
  design: string,
  search: string,
  params: { startkey?: string; endkey?: string }
): Promise<{ rows: Array<{ id: string; value: IoBrokerObject }> }> {
  return emit('getObjectView', design, search, params)
}

export async function getState(id: string): Promise<IoBrokerState | null> {
  return emit<IoBrokerState | null>('getState', id)
}

export async function getStates(ids: string[]): Promise<Record<string, IoBrokerState>> {
  return emit<Record<string, IoBrokerState>>('getStates', ids)
}

export async function setState(id: string, value: unknown): Promise<void> {
  return emit('setState', id, value)
}

export function subscribeStates(id: string): void {
  getSocket().emit('subscribeStates', id)
}

export function unsubscribeStates(id: string): void {
  getSocket().emit('unsubscribeStates', id)
}

export async function getAdapterInstances(adapterName: string): Promise<IoBrokerObject[]> {
  try {
    const result = await getObjectView('system', 'instance', {
      startkey: `system.adapter.${adapterName}.`,
      endkey: `system.adapter.${adapterName}.香`,
    })
    return result.rows.map(r => r.value)
  } catch {
    return []
  }
}

export async function getHistory(
  id: string,
  options: HistoryOptions,
  adapterInstance?: string
): Promise<HistoryDataPoint[]> {
  const target = adapterInstance ?? (await detectHistoryAdapter())
  if (!target) return []

  return new Promise((resolve, reject) => {
    const socket = getSocket()
    socket.emit(
      'sendTo',
      target,
      'getHistory',
      { id, options },
      (result: { error?: string; result?: HistoryDataPoint[] }) => {
        if (result?.error) reject(new Error(result.error))
        else resolve(result?.result ?? [])
      }
    )
  })
}

let _cachedHistoryAdapter: string | null | undefined = undefined

async function detectHistoryAdapter(): Promise<string | null> {
  if (_cachedHistoryAdapter !== undefined) return _cachedHistoryAdapter

  for (const adapter of ['influxdb', 'sql', 'history']) {
    const instances = await getAdapterInstances(adapter)
    if (instances.length > 0) {
      _cachedHistoryAdapter = `${adapter}.${instances[0]._id.split('.').pop()}`
      return _cachedHistoryAdapter
    }
  }

  _cachedHistoryAdapter = null
  return null
}
