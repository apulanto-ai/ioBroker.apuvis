import { getConnection } from './socket'
import type { IoBrokerState, IoBrokerObject, IoBrokerSystemConfig, HistoryOptions, HistoryDataPoint } from './iobroker-types'

let _objectsCache: Record<string, ioBroker.Object> | null = null

export function clearObjectsCache() {
  _objectsCache = null
}

async function getAllObjects(): Promise<Record<string, IoBrokerObject>> {
  const conn = getConnection()
  if (!_objectsCache) {
    _objectsCache = await conn.getObjects(true, true)
  }
  return _objectsCache as Record<string, IoBrokerObject>
}

export async function getSystemConfig(): Promise<IoBrokerSystemConfig> {
  const conn = getConnection()
  const obj = await conn.getObject('system.config')
  return (obj as unknown as { common: IoBrokerSystemConfig }).common
}

export async function getObject(id: string): Promise<IoBrokerObject | null> {
  const conn = getConnection()
  return conn.getObject(id) as Promise<IoBrokerObject | null>
}

export async function getObjects(pattern: string): Promise<Record<string, IoBrokerObject>> {
  const all = await getAllObjects()
  if (pattern === '*' || !pattern.includes('*')) return all

  const prefix = pattern.replace(/\*.*$/, '')
  const filtered: Record<string, IoBrokerObject> = {}
  for (const [id, obj] of Object.entries(all)) {
    if (id.startsWith(prefix)) filtered[id] = obj
  }
  return filtered
}

export async function getObjectView(
  _design: string,
  _search: string,
  params: { startkey?: string; endkey?: string }
): Promise<{ rows: Array<{ id: string; value: IoBrokerObject }> }> {
  const all = await getAllObjects()
  const start = params.startkey ?? ''
  const end = params.endkey ?? '￿'
  const rows = Object.entries(all)
    .filter(([id]) => id >= start && id <= end)
    .map(([id, value]) => ({ id, value }))
  return { rows }
}

export async function getState(id: string): Promise<IoBrokerState | null> {
  const conn = getConnection()
  return conn.getState(id) as Promise<IoBrokerState | null>
}

export async function getStates(ids: string[]): Promise<Record<string, IoBrokerState>> {
  const conn = getConnection()
  const pattern = ids.length === 1 ? ids[0] : ids.join(',')
  return conn.getStates(pattern) as Promise<Record<string, IoBrokerState>>
}

export async function setState(id: string, value: unknown): Promise<void> {
  const conn = getConnection()
  return conn.setState(id, value as ioBroker.StateValue)
}

export async function getAdapterInstances(adapterName: string): Promise<IoBrokerObject[]> {
  try {
    const all = await getAllObjects()
    return Object.values(all).filter(
      obj => obj?._id?.startsWith(`system.adapter.${adapterName}.`) && obj?.type === 'instance'
    ) as IoBrokerObject[]
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

  const conn = getConnection()
  const result = await conn.sendTo<{ error?: string; result?: HistoryDataPoint[] }>(
    target,
    'getHistory',
    { id, options }
  )
  if (result?.error) throw new Error(result.error)
  return result?.result ?? []
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
