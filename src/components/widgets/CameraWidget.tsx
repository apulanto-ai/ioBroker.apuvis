import { useState, useEffect, useRef } from 'react'
import { Camera, RefreshCw } from 'lucide-react'
import type { CameraWidgetConfig } from '../../types/widget.types'

export default function CameraWidget({ config }: { config: CameraWidgetConfig }) {
  const [error, setError] = useState(false)
  const [retries, setRetries] = useState(0)
  const imgRef = useRef<HTMLImageElement>(null)

  const src = config.refreshInterval
    ? `${config.streamUrl}${config.streamUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`
    : config.streamUrl

  useEffect(() => {
    if (!config.refreshInterval) return
    const interval = setInterval(() => {
      if (imgRef.current) {
        imgRef.current.src = `${config.streamUrl}${config.streamUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`
      }
    }, config.refreshInterval * 1000)
    return () => clearInterval(interval)
  }, [config.streamUrl, config.refreshInterval])

  const handleRetry = () => {
    setError(false)
    setRetries((r) => r + 1)
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-500">
        <Camera size={24} />
        <span className="text-xs">Kein Signal</span>
        <button onClick={handleRetry} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
          <RefreshCw size={12} />
          Neu laden
        </button>
      </div>
    )
  }

  return (
    <div className="h-full overflow-hidden rounded-lg bg-black">
      <img
        key={retries}
        ref={imgRef}
        src={src}
        onError={() => setError(true)}
        className="w-full h-full object-cover"
        alt={config.title}
      />
    </div>
  )
}
