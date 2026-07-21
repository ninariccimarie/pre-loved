import { Link } from '@tanstack/react-router'
import type { ListingStatus } from '#/lib/types'

export const statusLinkClass = (status: ListingStatus) => {
  if (status === 'available') return 'font-semibold text-emerald-700 no-underline hover:underline'
  if (status === 'reserved') return 'font-semibold text-orange-600 no-underline hover:underline'
  return 'font-semibold text-zinc-500 no-underline hover:underline'
}

type AdminNavProps = {
  onLogout: () => void
}

const AdminNav = ({ onLogout }: AdminNavProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Link to="/admin" className="demo-button demo-button-secondary no-underline px-3 py-1.5 text-xs">
        Listings
      </Link>
      <Link
        to="/admin/requests"
        className="demo-button demo-button-secondary no-underline px-3 py-1.5 text-xs"
      >
        Requests
      </Link>
      <Link
        to="/admin/waitlist"
        className="demo-button demo-button-secondary no-underline px-3 py-1.5 text-xs"
      >
        Waitlist
      </Link>
      <Link
        to="/admin/listings/new"
        className="demo-button no-underline px-3 py-1.5 text-xs"
      >
        New listing
      </Link>
      <button
        type="button"
        className="demo-button demo-button-secondary px-3 py-1.5 text-xs"
        onClick={onLogout}
      >
        Log out
      </button>
    </div>
  )
}

export default AdminNav
