import type { WidgetType } from '../../types/widget.types'
import SwitchWidget from './SwitchWidget'
import LightWidget from './LightWidget'
import ThermostatWidget from './ThermostatWidget'
import SensorWidget from './SensorWidget'
import ChartWidget from './ChartWidget'
import CameraWidget from './CameraWidget'
import WeatherWidget from './WeatherWidget'
import GrafanaWidget from './GrafanaWidget'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WIDGET_REGISTRY: Record<WidgetType, React.ComponentType<{ config: any }>> = {
  switch: SwitchWidget,
  light: LightWidget,
  thermostat: ThermostatWidget,
  sensor: SensorWidget,
  chart: ChartWidget,
  camera: CameraWidget,
  weather: WeatherWidget,
  grafana: GrafanaWidget,
}

export function getWidgetComponent(type: WidgetType) {
  return WIDGET_REGISTRY[type] ?? null
}
