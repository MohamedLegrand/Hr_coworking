import { Outlet } from 'react-router-dom'
import EnTete from './EnTete'
import PiedDePage from './PiedDePage'

/**
 * Mise en page partagée par toutes les pages "site" (hors authentification).
 * Garantit une navigation cohérente (header + footer) sur chaque page.
 */
export default function LayoutPrincipal() {
  return (
    <div className="min-h-screen animate-apparaitre bg-white font-corps text-encre">
      <EnTete />
      <Outlet />
      <PiedDePage />
    </div>
  )
}
