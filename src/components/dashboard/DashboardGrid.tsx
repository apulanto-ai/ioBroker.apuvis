import { useMemo, useCallback } from 'react'
import { GridLayout } from 'react-grid-layout'
import type { LayoutItem } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { useConfigStore } from '../../store/useConfigStore'
import { WidgetFrame } from './WidgetFrame'
import { getWidgetComponent } from '../widgets'

interface DashboardGridProps {
  roomId: string
  editMode: boolean
}

export default function DashboardGrid({ roomId, editMode }: DashboardGridProps) {
  const widgets = useConfigStore((s) => s.widgets[roomId] ?? [])
  const updateWidgetGrid = useConfigStore((s) => s.updateWidgetGrid)
  const removeWidget = useConfigStore((s) => s.removeWidget)

  const layout: LayoutItem[] = useMemo(
    () =>
      widgets.map((w) => ({
        i: w.id,
        x: w.grid.x,
        y: w.grid.y,
        w: w.grid.w,
        h: w.grid.h,
        minW: w.grid.minW ?? 1,
        minH: w.grid.minH ?? 1,
      })),
    [widgets]
  )

  const onLayoutChange = useCallback(
    (newLayout: readonly LayoutItem[]) => {
      if (!editMode) return
      newLayout.forEach((item) => {
        updateWidgetGrid(roomId, item.i, {
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
        })
      })
    },
    [editMode, roomId, updateWidgetGrid]
  )

  if (widgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <p className="text-lg mb-1">Keine Widgets</p>
        <p className="text-sm">Gehe zu Einstellungen um Widgets hinzuzufügen.</p>
      </div>
    )
  }

  return (
    <GridLayout
      layout={layout}
      width={window.innerWidth - 240}
      gridConfig={{ cols: 4, rowHeight: 120, margin: [8, 8], containerPadding: [0, 0], maxRows: Infinity }}
      dragConfig={{ enabled: editMode, handle: '.drag-handle', bounded: false, threshold: 3 }}
      resizeConfig={{ enabled: editMode, handles: ['se'] }}
      onLayoutChange={onLayoutChange}
    >
      {widgets.map((widget) => {
        const WidgetComponent = getWidgetComponent(widget.type)
        return (
          <div key={widget.id}>
            <WidgetFrame
              widget={widget}
              editMode={editMode}
              onRemove={() => removeWidget(roomId, widget.id)}
            >
              {WidgetComponent ? (
                <WidgetComponent config={widget as never} />
              ) : (
                <div className="text-xs text-slate-500">Unbekannter Widget-Typ: {widget.type}</div>
              )}
            </WidgetFrame>
          </div>
        )
      })}
    </GridLayout>
  )
}
