import { Link } from 'react-router-dom'
import { Enveloppe, Telephone, Lieu } from '../communs/Icones'

export default function PiedDePage() {
  return (
    <footer className="mt-20 bg-encre text-white">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-14 sm:px-7 md:grid-cols-[1.4fr_1fr_1fr]">

        <div>
          <div className="mb-4 flex items-center gap-2.5">
            <img
              src="/images/logo.jpeg"
              alt="HR-COWORKING"
              className="h-[30px] w-[30px] rounded-full object-cover"
            />
            <span className="font-titre text-xl font-bold">HR-COWORKING</span>
          </div>
          <p className="max-w-[300px] text-sm leading-relaxed text-white/60">
            Espace de coworking premium à Yaoundé Tropicana, après Eneo.
            Réservez et travaillez tranquillement.
          </p>
        </div>

        <div>
          <div className="mb-4 font-titre text-sm font-semibold">Navigation</div>
          <div className="flex flex-col gap-2.5 text-sm text-white/60">
            <Link to="/#accueil" className="hover:text-white">Accueil</Link>
            <Link to="/#espaces" className="hover:text-white">Espaces</Link>
            <Link to="/#tarifs" className="hover:text-white">Tarif</Link>
            <Link to="/reservations" className="hover:text-white">Réservations</Link>
            <Link to="/profil" className="hover:text-white">Mon compte</Link>
          </div>
        </div>

        <div>
          <div className="mb-4 font-titre text-sm font-semibold">Contact</div>
          <div className="flex flex-col gap-2.5 text-sm text-white/60">
            <span className="flex items-center gap-2">
              <Enveloppe width={14} height={14} className="text-violet" />
              contact@hrcoworking.cm
            </span>
            <span className="flex items-center gap-2">
              <Telephone width={14} height={14} className="text-violet" />
              +237 6 00 00 00 00
            </span>
            <span className="flex items-center gap-2">
              <Lieu width={14} height={14} className="text-violet" />
              Situé à Yaoundé, Tropicana, après Eneo
            </span>
          </div>

          <div className="mt-5 flex gap-3.5">
            {['Facebook', 'Twitter', 'Instagram'].map((r) => (
              <a
                key={r}
                href="#"
                aria-label={r}
                className="text-white/60 transition-colors hover:text-violet"
              >
                <span className="block h-3.5 w-3.5 rounded-full border border-current" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1240px] px-4 py-5 text-[12.5px] text-white/45 sm:px-7">
          © 2026 HR-COWORKING® — Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
