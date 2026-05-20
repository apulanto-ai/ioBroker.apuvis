export interface IoBrokerState {
  val: string | number | boolean | null
  ack: boolean
  ts: number
  lc: number
  from?: string
  q?: number
}

export interface IoBrokerObject {
  _id: string
  type: 'state' | 'channel' | 'device' | 'folder' | 'enum' | 'adapter' | 'instance' | 'host' | 'user' | 'group' | 'script' | 'config'
  common: {
    name: string | Record<string, string>
    role?: string
    type?: 'number' | 'string' | 'boolean' | 'array' | 'object' | 'mixed' | 'file'
    unit?: string
    min?: number
    max?: number
    step?: number
    read?: boolean
    write?: boolean
    members?: string[]
    color?: string
    icon?: string
    desc?: string | Record<string, string>
    states?: Record<string, string>
    smartName?: string | Record<string, string>
  }
  native?: Record<string, unknown>
  enums?: Record<string, string>
}

export interface IoBrokerSystemConfig {
  language: string
  tempUnit: '°C' | '°F'
  currency: string
  dateFormat: string
  timeFormat: string
  firstDayOfWeek: 'monday' | 'sunday'
  latitude?: number
  longitude?: number
  city?: string
}

export interface IoBrokerEnumObject extends IoBrokerObject {
  type: 'enum'
  common: IoBrokerObject['common'] & {
    members: string[]
  }
}

export interface HistoryOptions {
  start?: number
  end?: number
  count?: number
  aggregate?: 'minmax' | 'max' | 'min' | 'average' | 'total' | 'count' | 'none' | 'percentile' | 'quantile' | 'integral' | 'derivative' | 'trendSlope' | 'simplify' | 'percentile'
  step?: number
  from?: boolean
  ack?: boolean
  q?: boolean
  addID?: boolean
  limit?: number
  sessionId?: string
}

export interface HistoryDataPoint {
  ts: number
  val: number | null
  ack?: boolean
  q?: number
  from?: string
}
