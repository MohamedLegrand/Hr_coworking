import { Link, useParams } from 'react-router-dom'
import { useEspace } from '../../hooks/useEspaces'
import { useForfaits } from '../../hooks/useReservations'
import useAuthStore from '../../contexte/authStore'
import ImageEspace from '../../composants/communs/ImageEspace'
import {
  Fleche,
  Lieu,
  Etoile,
  Flocon,
  CameraSecurite,
  Wifi,
  Tasse,
  Ecran,
  Projecteur,
  Imprimante,
} from '../../composants/communs/Icones'
import { libelleType, formatFcfa } from '../../utilitaires/format'
import { libelleForfait, libelleGamme } from '../../utilitaires/tarifs'

const CARACTERISTIQUES = [
  { icone: Wifi, libelle: 'Connexion internet haut débit' },
  { icone: CameraSecurite, libelle: 'Caméra de surveillance' },
  { icone: Ecran, libelle: 'Écran plat 64 pouces pour présentations' },
  { icone: Projecteur, libelle: 'Vidéoprojecteur' },
  { icone: Flocon, libelle: 'Salle climatisée' },
  { icone: Imprimante, libelle: 'Imprimante' },
  { icone: Tasse, libelle: 'Cuisine équipée pour le café' },
]

export default function PageDetailEspace() {
  const { id } = useParams()
  const { data: espace, isLoading, isError } = useEspace(id)
  const { data: forfaits = [] } = useForfaits()
  const token = useAuthStore((s) => s.token)
  const forfaitMoinsCher = forfaits.find((f) => f.gamme === 'standard' && f.forfait === 'heure')

  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-20 pt-8 sm:px-7">

      {/* Fil d'Ariane */}
      <div className="mb-6 flex items-center gap-2 text-[13px] text-ardoise">
        <Link to="/" className="hover:text-violet">Accueil</Link>
        <span>/</span>
        <Link to="/#espaces" className="hover:text-violet">Espaces</Link>
        <span>/</span>
        <span className="font-semibold text-encre">{espace?.nom || '…'}</span>
      </div>

      <Link
        to="/#espaces"
        className="mb-6 inline-flex items-center gap-2 text-[13.5px] font-semibold text-ardoise hover:text-violet"
      >
        <Fleche width={14} height={14} className="rotate-180" />
        Retour aux espaces
      </Link>

      {isLoading && (
        <div className="animate-pulse">
          <div className="aspect-[16/7] w-full rounded-2xl bg-lavande" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          Impossible de charger cet espace. Vérifiez que l'API est démarrée.
        </div>
      )}

      {!isLoading && !isError && espace && (
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">

          <div>
            <figure className="relative m-0 overflow-hidden rounded-2xl">
              <ImageEspace
                espace={espace}
                className="aspect-[16/9] w-full object-cover"
              />
              <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-violet">
                {libelleType(espace.type_espace)}
              </span>
            </figure>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-titre text-[clamp(26px,3.2vw,36px)] font-bold leading-tight tracking-tight">
                {espace.nom}
              </h1>
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                <Etoile className="text-amber-400" />
                {espace.capacite} places
              </span>
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-[14px] text-ardoise">
              <Lieu width={15} height={15} />
              {espace.localisation || 'Yaoundé'}
            </div>

            {espace.description && (
              <p className="mt-6 max-w-[600px] text-[15px] leading-relaxed text-ardoise">
                {espace.description}
              </p>
            )}

            {/* Caractéristiques */}
            <div className="mt-10">
              <h2 className="mb-5 font-titre text-xl font-semibold tracking-tight">
                Caractéristiques
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {CARACTERISTIQUES.map(({ icone: Icone, libelle }) => (
                  <div
                    key={libelle}
                    className="flex items-center gap-3.5 rounded-xl border border-ligne bg-white p-4"
                  >
                    <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-lavande text-violet">
                      <Icone width={20} height={20} />
                    </span>
                    <span className="text-[14.5px] font-medium text-encre">{libelle}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panneau réservation */}
          <aside className="h-fit rounded-2xl border border-ligne bg-white p-7 lg:sticky lg:top-[94px]">
            {forfaitMoinsCher && (
              <div className="flex items-end gap-1.5">
                <span className="text-[13px] text-ardoise">À partir de</span>
                <span className="font-titre text-[28px] font-bold leading-none">
                  {formatFcfa(forfaitMoinsCher.prix)}
                </span>
                <span className="pb-1 text-[13px] text-ardoise">/heure</span>
              </div>
            )}
            <p className="mt-1 text-[12.5px] text-ardoise">
              Gamme (Standard ou VIP) et forfait (heure, jour, semaine, mois) au choix à la réservation.
            </p>

            {/* Grille des tarifs de référence */}
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
              {['standard', 'vip'].map((gamme) => (
                <div key={gamme}>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ardoise">
                    {libelleGamme(gamme)}
                  </p>
                  <div className="space-y-1">
                    {forfaits.filter((f) => f.gamme === gamme).map((f) => (
                      <div key={f.forfait} className="flex items-center justify-between text-[12.5px]">
                        <span className="text-ardoise">{libelleForfait(f.forfait)}</span>
                        <span className="font-semibold text-encre">{formatFcfa(f.prix)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <span
              className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold text-white ${
                espace.est_disponible ? 'bg-green-600' : 'bg-red-600'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {espace.est_disponible ? 'Disponible' : 'Complet'}
            </span>

            <Link
              to={token ? '/espaces' : '/connexion'}
              className="mt-6 flex items-center justify-center gap-2.5 rounded-lg bg-violet px-6 py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-violet-fonce"
            >
              Réserver
              <Fleche width={16} height={16} />
            </Link>
          </aside>
        </div>
      )}
    </div>
  )
}
