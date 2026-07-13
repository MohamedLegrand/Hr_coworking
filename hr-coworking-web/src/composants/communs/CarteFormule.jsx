import { Link } from 'react-router-dom'
import { Check, Fleche } from './Icones'
import { formatFcfa } from '../../utilitaires/format'
import { libelleForfait, descriptionForfait } from '../../utilitaires/tarifs'

/**
 * Carte d'affichage d'un forfait (voir GET /reservations/forfaits, source
 * unique de vérité pour les prix). Réutilisée sur la landing page
 * (SectionTarifs) et dans le dashboard membre.
 */
export default function CarteFormule({ forfait, lien = '/connexion', libelleBouton = 'Choisir cette formule' }) {
  const populaire = forfait.meilleure_valeur
  return (
    <div
      className={`flex flex-col rounded-2xl border p-8 ${
        populaire
          ? 'border-violet bg-violet text-white shadow-[0_22px_48px_rgba(124,58,237,.28)] md:-translate-y-3'
          : 'border-ligne bg-white text-encre'
      }`}
    >
      {populaire && (
        <span className="mb-4 inline-flex w-fit items-center rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide">
          Meilleure valeur
        </span>
      )}

      <h3 className="font-titre text-xl font-semibold">{libelleForfait(forfait.forfait)}</h3>
      <p className={`mt-2 text-sm leading-relaxed ${populaire ? 'text-white/80' : 'text-ardoise'}`}>
        {descriptionForfait(forfait.forfait)}
      </p>

      <div className="mb-6 mt-6 flex items-end gap-1.5">
        <span className="font-titre text-[36px] font-bold leading-none">
          {formatFcfa(forfait.prix)}
        </span>
        <span className={`pb-1 text-[13px] ${populaire ? 'text-white/70' : 'text-ardoise'}`}>
          /{forfait.forfait}
        </span>
      </div>

      <div className={`mb-8 h-px ${populaire ? 'bg-white/20' : 'bg-ligne'}`} />

      <div className="mb-8 flex flex-1 flex-col gap-3">
        {forfait.prestations.map((p) => (
          <div key={p} className="flex items-center gap-2.5 text-sm font-medium">
            <Check width={16} height={16} className="flex-none" />
            {p}
          </div>
        ))}
      </div>

      <Link
        to={lien}
        className={`inline-flex items-center justify-center gap-2.5 rounded-md px-6 py-3.5 text-sm font-semibold transition-all hover:-translate-y-0.5 ${
          populaire
            ? 'bg-white text-violet hover:bg-white/90'
            : 'bg-violet text-white hover:bg-violet-fonce'
        }`}
      >
        {libelleBouton}
        <Fleche width={15} height={15} />
      </Link>
    </div>
  )
}
