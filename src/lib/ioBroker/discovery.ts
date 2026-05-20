import { getObjects } from './iobroker-api'
import { getConnection } from './socket'

export interface DiscoveredRoom {
  id: string
  name: string
  memberIds: string[]
}

export interface DiscoveredDataPoint {
  id: string
  name: string
  role: string
  type: string
  unit?: string
  min?: number
  max?: number
  read: boolean
  write: boolean
  suggestedWidgetType: string
}

export async function discoverRooms(): Promise<DiscoveredRoom[]> {
  const conn = getConnection()
  const enums = await conn.getEnums('rooms')
  return Object.values(enums)
    .map(obj => ({
      id: obj._id,
      name: getName(obj.common.name),
      memberIds: (obj.common.members as string[]) ?? [],
    }))
    .filter(r => r.memberIds.length > 0)
}

export async function discoverDataPoints(memberIds: string[]): Promise<DiscoveredDataPoint[]> {
  if (memberIds.length === 0) return []

  try {
    const objects = await getObjects('*')
    const results: DiscoveredDataPoint[] = []

    for (const id of memberIds) {
      const obj = objects[id]
      if (!obj || obj.type !== 'state') continue

      const role = obj.common.role ?? ''
      const type = obj.common.type ?? 'mixed'
      const read = obj.common.read !== false
      const write = obj.common.write === true

      results.push({
        id,
        name: getName(obj.common.name),
        role,
        type,
        unit: obj.common.unit,
        min: obj.common.min,
        max: obj.common.max,
        read,
        write,
        suggestedWidgetType: suggestWidget(role, type, write),
      })
    }

    return results
  } catch {
    return []
  }
}

export async function discoverRoomsWithDataPoints(): Promise<
  Array<DiscoveredRoom & { dataPoints: DiscoveredDataPoint[] }>
> {
  const rooms = await discoverRooms()
  const results = []

  for (const room of rooms) {
    const dataPoints = await discoverDataPoints(room.memberIds)
    results.push({ ...room, dataPoints })
  }

  return results
}

function getName(name: string | Record<string, string> | undefined): string {
  if (!name) return 'Unknown'
  if (typeof name === 'string') return name
  return name.en ?? name.de ?? Object.values(name)[0] ?? 'Unknown'
}

function suggestWidget(role: string, type: string, write: boolean): string {
  const r = role.toLowerCase()

  if (r.includes('switch') || r === 'button') return write ? 'switch' : 'sensor'
  if (r.includes('dimmer') || r.includes('level')) return 'light'
  if (r === 'light') return write ? 'light' : 'switch'
  if (r.includes('thermostat') || r.includes('setpoint')) return 'thermostat'
  if (r.includes('temperature') || r.includes('humidity') || r.includes('pressure') ||
      r.includes('co2') || r.includes('brightness') || r.includes('energy') ||
      r.includes('current') || r.includes('voltage') || r.includes('power')) return 'chart'
  if (r.includes('sensor') || r.includes('value')) {
    return type === 'number' ? 'chart' : 'sensor'
  }
  if (type === 'boolean') return write ? 'switch' : 'sensor'
  if (type === 'number') return 'chart'

  return 'sensor'
}

export function getWidgetGroups(dataPoints: DiscoveredDataPoint[]) {
  const groups: Record<string, DiscoveredDataPoint[]> = {
    light: [],
    switch: [],
    thermostat: [],
    chart: [],
    sensor: [],
  }

  for (const dp of dataPoints) {
    const group = dp.suggestedWidgetType
    if (groups[group]) groups[group].push(dp)
    else groups['sensor'].push(dp)
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([type, items]) => ({ type, items }))
}
