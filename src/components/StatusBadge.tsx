import type { ListingStatus } from '#/lib/types'
import { STATUS_LABELS } from '#/lib/types'

const STATUS_STYLES: Record<ListingStatus, string> = {
  available: 'border-emerald-300/40 bg-emerald-500/10 text-emerald-700',
  reserved: 'border-amber-300/40 bg-amber-500/10 text-amber-700',
  sold: 'border-slate-300/40 bg-slate-500/10 text-slate-600',
}

type StatusBadgeProps = {
  status: ListingStatus
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

export default StatusBadge
