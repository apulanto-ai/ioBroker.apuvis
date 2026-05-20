export type WidgetType = 'switch' | 'light' | 'thermostat' | 'chart' | 'camera' | 'weather' | 'grafana' | 'sensor'

export interface GridPosition {
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
}

export interface BaseWidgetConfig {
  id: string
  type: WidgetType
  title: string
  grid: GridPosition
}

export interface SwitchWidgetConfig extends BaseWidgetConfig {
  type: 'switch'
  stateId: string
}

export interface LightWidgetConfig extends BaseWidgetConfig {
  type: 'light'
  stateId: string
  brightnessId?: string
  colorTempId?: string
}

export interface ThermostatWidgetConfig extends BaseWidgetConfig {
  type: 'thermostat'
  setpointId: string
  actualTempId?: string
  step?: number
}

export interface ChartWidgetConfig extends BaseWidgetConfig {
  type: 'chart'
  stateId: string
  unit?: string
  color?: string
  defaultRange?: '1h' | '6h' | '24h' | '7d' | '30d'
}

export interface SensorWidgetConfig extends BaseWidgetConfig {
  type: 'sensor'
  stateId: string
  unit?: string
  icon?: string
}

export interface CameraWidgetConfig extends BaseWidgetConfig {
  type: 'camera'
  streamUrl: string
  refreshInterval?: number
}

export interface WeatherWidgetConfig extends BaseWidgetConfig {
  type: 'weather'
  apiKey: string
  lat?: number
  lon?: number
  city?: string
  units?: 'metric' | 'imperial'
}

export interface GrafanaWidgetConfig extends BaseWidgetConfig {
  type: 'grafana'
  grafanaUrl: string
  orgId?: number
  dashboardUid: string
  panelId: number
  theme?: 'light' | 'dark'
  from?: string
  to?: string
}

export type WidgetConfig =
  | SwitchWidgetConfig
  | LightWidgetConfig
  | ThermostatWidgetConfig
  | ChartWidgetConfig
  | SensorWidgetConfig
  | CameraWidgetConfig
  | WeatherWidgetConfig
  | GrafanaWidgetConfig
