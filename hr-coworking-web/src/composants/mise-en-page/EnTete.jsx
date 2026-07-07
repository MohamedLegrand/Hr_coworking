import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../../contexte/authStore'
import { Menu, Croix } from '../communs/Icones'

const LIENS = [
  { to: '/#accueil', libelle: 'Accueil' },
  { to: '/#espaces', libelle: 'Espaces' },
  { to: '/#tarifs', libelle: 'Tarif' },
]

export default function EnTete() {
  const [menuOuvert, setMenuOuvert] = useState(false)
  const token = useAuthStore((s) => s.token)
  const utilisateur = useAuthStore((s) => s.utilisateur)
  const deconnecter = useAuthStore((s) => s.deconnecter)

  return (
    <nav className="sticky top-0 z-50 border-b border-ligne bg-white">
      <div className="mx-auto flex h-[74px] max-w-[1240px] items-center gap-6 px-4 sm:px-7">

        {/* Logo */}
        <Link to="/#accueil" className="flex items-center gap-2.5 text-encre">
          <img
            src="/images/logo.jpeg"
            alt="HR-COWORKING"
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="font-titre text-[22px] font-bold tracking-tight">HR-COWORKING</span>
        </Link>

        {/* Liens desktop */}
        <div className="hidden flex-1 justify-center gap-8 lg:flex">
          {LIENS.map((l) => (
            <Link
              key={l.libelle}
              to={l.to}
              className="text-[15px] font-medium text-ardoise transition-colors hover:text-encre"
            >
              {l.libelle}
            </Link>
          ))}
        </div>

        <div className="flex flex-1 items-center justify-end gap-4 lg:flex-none">
          {token ? (
            <>
              <Link
                to="/profil"
                className="hidden rounded-md border border-ligne px-5 py-2.5 text-sm font-semibold text-encre transition-colors hover:border-violet hover:text-violet lg:inline-flex"
              >
                Tableau de bord
              </Link>
              <Link
                to="/reservations"
                className="hidden rounded-md border border-ligne px-5 py-2.5 text-sm font-semibold text-encre transition-colors hover:border-violet hover:text-violet lg:inline-flex"
              >
                Réservations
              </Link>
              <button
                type="button"
                onClick={deconnecter}
                className="hidden rounded-md bg-violet px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-violet-fonce lg:inline-flex"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                to="/connexion"
                className="hidden rounded-md border border-ligne px-5 py-2.5 text-sm font-semibold text-encre transition-colors hover:border-violet hover:text-violet lg:inline-flex"
              >
                Se connecter
              </Link>

              <Link
                to="/inscription"
                className="hidden rounded-md bg-violet px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-violet-fonce lg:inline-flex"
              >
                S'inscrire
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setMenuOuvert((etat) => !etat)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ligne text-encre transition hover:border-violet hover:text-violet lg:hidden"
            aria-label={menuOuvert ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {menuOuvert ? <Croix /> : <Menu />}
          </button>
        </div>
      </div>

      {menuOuvert && (
        <div className="absolute inset-x-0 top-[74px] z-40 rounded-b-3xl border-t border-ligne bg-white/95 p-5 shadow-2xl backdrop-blur-sm lg:hidden">
          <div className="space-y-4">
            {LIENS.map((l) => (
              <Link
                key={l.libelle}
                to={l.to}
                onClick={() => setMenuOuvert(false)}
                className="block rounded-2xl border border-ligne bg-white px-4 py-3 text-sm font-semibold text-encre transition hover:border-violet hover:bg-violet/5"
              >
                {l.libelle}
              </Link>
            ))}
            {token ? (
              <>
                <Link
                  to="/profil"
                  onClick={() => setMenuOuvert(false)}
                  className="block rounded-2xl border border-ligne bg-white px-4 py-3 text-sm font-semibold text-encre transition hover:border-violet hover:bg-violet/5"
                >
                  Tableau de bord
                </Link>
                <Link
                  to="/reservations"
                  onClick={() => setMenuOuvert(false)}
                  className="block rounded-2xl border border-ligne bg-white px-4 py-3 text-sm font-semibold text-encre transition hover:border-violet hover:bg-violet/5"
                >
                  Réservations
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOuvert(false)
                    deconnecter()
                  }}
                  className="w-full rounded-2xl bg-violet px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-fonce"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/connexion"
                  onClick={() => setMenuOuvert(false)}
                  className="block rounded-2xl border border-ligne bg-white px-4 py-3 text-sm font-semibold text-encre transition hover:border-violet hover:bg-violet/5"
                >
                  Se connecter
                </Link>
                <Link
                  to="/inscription"
                  onClick={() => setMenuOuvert(false)}
                  className="block rounded-2xl bg-violet px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-fonce"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
