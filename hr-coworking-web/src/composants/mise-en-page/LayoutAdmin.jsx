import { NavLink, Outlet, Link } from 'react-router-dom'
import useAuthStore from '../../contexte/authStore'
import ClocheNotifications from '../communs/ClocheNotifications'
import { Grille, Bureau, Personne, Calendrier, CartePaiement, Cloche, Boucliers } from '../communs/Icones'

const NAV_ADMIN = [
  { to: '/administration', label: "Vue d'ensemble", icon: Grille, fin: true },
  { to: '/administration/espaces', label: 'Bureaux', icon: Bureau, fin: true },
  { to: '/administration/utilisateurs', label: 'Utilisateurs', icon: Personne, fin: true },
  { to: '/administration/reservations', label: 'Réservations', icon: Calendrier, fin: true },
  { to: '/administration/paiements', label: 'Paiements', icon: CartePaiement, fin: true },
  { to: '/administration/notifications', label: 'Notifications', icon: Cloche, fin: true },
]

function initiales(utilisateur) {
  const p = utilisateur?.prenom?.[0] || ''
  const n = utilisateur?.nom?.[0] || ''
  return (p + n).toUpperCase() || '…'
}

export default function LayoutAdmin() {
  const utilisateur = useAuthStore((s) => s.utilisateur)
  const deconnecter = useAuthStore((s) => s.deconnecter)

  return (
    <div className="flex min-h-screen gap-6 bg-lavande/40 p-5 font-corps text-encre lg:p-6">
      {/* ============= SIDEBAR ============= */}
      <aside className="sticky top-6 hidden h-[calc(100vh-48px)] w-[248px] flex-none flex-col rounded-2xl border border-ligne bg-white p-6 shadow-sm lg:flex">
        <Link to="/administration" className="flex items-center gap-2.5 px-1 text-encre">
          <img
            src="/images/logo.jpeg"
            alt="HR-COWORKING"
            className="h-9 w-9 rounded-full object-cover"
          />
          <div>
            <span className="block font-titre text-lg font-bold leading-tight tracking-tight">HR Coworking</span>
            <span className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.16em] text-violet">
              <Boucliers width={11} height={11} />
              Administration
            </span>
          </div>
        </Link>

        <nav className="mt-9 flex flex-col gap-1.5">
          {NAV_ADMIN.map(({ to, label, icon: Icone, fin }) => (
            <NavLink
              key={label}
              to={to}
              end={fin}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-[14.5px] font-medium transition ${
                  isActive
                    ? 'bg-violet font-semibold text-white shadow-sm'
                    : 'text-ardoise hover:bg-lavande hover:text-encre'
                }`
              }
            >
              <Icone width={19} height={19} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="rounded-xl border border-ligne bg-lavande/60 p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-violet text-sm font-bold text-white">
              {initiales(utilisateur)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-encre">
                {utilisateur?.prenom} {utilisateur?.nom}
              </p>
              <p className="truncate text-xs text-ardoise">{utilisateur?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={deconnecter}
            className="mt-4 w-full rounded-md border border-ligne bg-white px-4 py-2.5 text-sm font-semibold text-encre transition hover:border-violet hover:text-violet"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ============= CONTENU ============= */}
      <div className="min-w-0 flex-1">
        <div className="mb-5 hidden justify-end lg:flex">
          <ClocheNotifications lien="/administration/notifications" />
        </div>

        <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
          <Link to="/administration" className="flex items-center gap-2.5 text-encre">
            <img
              src="/images/logo.jpeg"
              alt="HR-COWORKING"
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="font-titre text-base font-bold tracking-tight">HR Coworking · Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <ClocheNotifications lien="/administration/notifications" />
            <span className="grid h-11 w-11 place-items-center rounded-full bg-violet text-sm font-bold text-white">
              {initiales(utilisateur)}
            </span>
          </div>
        </div>

        {/* Nav mobile (sidebar cachée sous lg) */}
        <nav className="mb-5 flex gap-2 overflow-x-auto rounded-2xl border border-ligne bg-white p-2 lg:hidden">
          {NAV_ADMIN.map(({ to, label, icon: Icone, fin }) => (
            <NavLink
              key={to}
              to={to}
              end={fin}
              className={({ isActive }) =>
                `flex flex-none items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-[13px] font-semibold transition ${
                  isActive ? 'bg-violet text-white' : 'text-ardoise hover:bg-lavande hover:text-encre'
                }`
              }
            >
              <Icone width={16} height={16} />
              {label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={deconnecter}
            className="ml-auto flex flex-none items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-[13px] font-semibold text-ardoise transition hover:bg-lavande hover:text-encre"
          >
            Déconnexion
          </button>
        </nav>

        <Outlet />
      </div>
    </div>
  )
}
