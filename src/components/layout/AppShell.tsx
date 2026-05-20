import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useConfigStore } from '../../store/useConfigStore'

export default function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const location = useLocation()
  const rooms = useConfigStore((s) => s.rooms)

  const roomId = location.pathname.startsWith('/dashboard/')
    ? location.pathname.replace('/dashboard/', '')
    : null
  const currentRoom = rooms.find((r) => r.id === roomId)

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0e1a]">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar
          title={currentRoom?.name}
          editMode={roomId ? editMode : undefined}
          onToggleEdit={roomId ? () => setEditMode((e) => !e) : undefined}
          onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
        />
        <main className="flex-1 overflow-auto p-4">
          <Outlet context={{ editMode }} />
        </main>
      </div>
    </div>
  )
}
