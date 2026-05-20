import { NavLink } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { useConfigStore } from '../../store/useConfigStore'
import { cn } from '../../lib/utils/cn'

interface SidebarProps {
  collapsed?: boolean
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const rooms = useConfigStore((s) => s.rooms)

  return (
    <aside className={cn(
      'flex flex-col h-full bg-slate-950 border-r border-white/5 transition-all duration-200',
      collapsed ? 'w-14' : 'w-52'
    )}>
      <div className="flex items-center gap-2 p-4 border-b border-white/5">
        <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          a
        </div>
        {!collapsed && <span className="font-semibold text-white text-sm">apuVIS</span>}
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {rooms
          .sort((a, b) => a.order - b.order)
          .map((room) => (
            <NavLink
              key={room.id}
              to={`/dashboard/${room.id}`}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-blue-500/15 text-blue-300'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                )
              }
            >
              <span className="w-4 h-4 flex-shrink-0 text-center text-xs">🏠</span>
              {!collapsed && <span className="truncate">{room.name}</span>}
            </NavLink>
          ))}
      </nav>

      <div className="p-2 border-t border-white/5">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
              isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            )
          }
        >
          <Settings size={16} className="flex-shrink-0" />
          {!collapsed && <span>Einstellungen</span>}
        </NavLink>
      </div>
    </aside>
  )
}
