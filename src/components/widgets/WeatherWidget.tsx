import { useEffect, useState } from 'react'
import { Cloud } from 'lucide-react'
import type { WeatherWidgetConfig } from '../../types/widget.types'

interface WeatherData {
  temp: number
  description: string
  icon: string
  humidity: number
  windSpeed: number
  forecast: Array<{ day: string; icon: string; high: number; low: number }>
}

const cache: Record<string, { data: WeatherData; ts: number }> = {}

async function fetchWeather(config: WeatherWidgetConfig): Promise<WeatherData> {
  const units = config.units ?? 'metric'
  const location = config.lat && config.lon
    ? `lat=${config.lat}&lon=${config.lon}`
    : `q=${encodeURIComponent(config.city ?? 'Berlin')}`

  const cacheKey = `${location}-${units}`
  const cached = cache[cacheKey]
  if (cached && Date.now() - cached.ts < 10 * 60 * 1000) return cached.data

  const [current, forecast] = await Promise.all([
    fetch(`https://api.openweathermap.org/data/2.5/weather?${location}&appid=${config.apiKey}&units=${units}&lang=de`)
      .then((r) => r.json()),
    fetch(`https://api.openweathermap.org/data/2.5/forecast?${location}&appid=${config.apiKey}&units=${units}&lang=de&cnt=24`)
      .then((r) => r.json()),
  ])

  const days: Record<string, { highs: number[]; lows: number[]; icon: string }> = {}
  for (const item of forecast.list ?? []) {
    const day = new Date(item.dt * 1000).toLocaleDateString('de-DE', { weekday: 'short' })
    if (!days[day]) days[day] = { highs: [], lows: [], icon: item.weather[0].icon }
    days[day].highs.push(item.main.temp_max)
    days[day].lows.push(item.main.temp_min)
  }

  const data: WeatherData = {
    temp: current.main.temp,
    description: current.weather?.[0]?.description ?? '',
    icon: current.weather?.[0]?.icon ?? '',
    humidity: current.main.humidity,
    windSpeed: current.wind?.speed ?? 0,
    forecast: Object.entries(days).slice(0, 3).map(([day, v]) => ({
      day,
      icon: v.icon,
      high: Math.round(Math.max(...v.highs)),
      low: Math.round(Math.min(...v.lows)),
    })),
  }

  cache[cacheKey] = { data, ts: Date.now() }
  return data
}

export default function WeatherWidget({ config }: { config: WeatherWidgetConfig }) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!config.apiKey) { setError(true); return }
    fetchWeather(config).then(setWeather).catch(() => setError(true))
  }, [config.apiKey, config.city, config.lat, config.lon])

  if (error || !config.apiKey) {
    return (
      <div className="flex items-center gap-2 h-full text-slate-500 text-xs">
        <Cloud size={16} />
        {!config.apiKey ? 'API-Key fehlt (Einstellungen)' : 'Wetter nicht verfügbar'}
      </div>
    )
  }

  if (!weather) {
    return <div className="flex items-center justify-center h-full text-slate-500 text-xs">Lade Wetter...</div>
  }

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {weather.icon && (
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
              alt={weather.description}
              className="w-10 h-10"
            />
          )}
          <div>
            <div className="text-2xl font-bold text-white">{Math.round(weather.temp)}°</div>
            <div className="text-xs text-slate-400 capitalize">{weather.description}</div>
          </div>
        </div>
        <div className="text-xs text-slate-500 text-right">
          <div>💧 {weather.humidity}%</div>
          <div>💨 {weather.windSpeed} m/s</div>
        </div>
      </div>

      {weather.forecast.length > 0 && (
        <div className="flex justify-between pt-2 border-t border-white/5">
          {weather.forecast.map((day) => (
            <div key={day.day} className="text-center">
              <div className="text-xs text-slate-500">{day.day}</div>
              <img
                src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                alt=""
                className="w-6 h-6 mx-auto"
              />
              <div className="text-xs text-white">{day.high}°</div>
              <div className="text-xs text-slate-500">{day.low}°</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
