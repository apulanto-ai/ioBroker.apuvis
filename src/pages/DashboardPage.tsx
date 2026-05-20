import { useParams, useOutletContext } from 'react-router-dom'
import DashboardGrid from '../components/dashboard/DashboardGrid'

interface OutletContext {
  editMode: boolean
}

export default function DashboardPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const { editMode } = useOutletContext<OutletContext>()

  if (!roomId) return null

  return <DashboardGrid roomId={roomId} editMode={editMode} />
}
