import { Link } from 'react-router-dom'
import { Lieu, Etoile, Fleche } from './Icones'
import ImageEspace from './ImageEspace'
import { libelleType } from '../../utilitaires/format'

export default function CarteEspace({ espace, index = 0 }) {
  const dispo = espace.est_disponible
  const delai = { animationDelay: `${index * 70}ms` }

  return (
    <article
      className="group animate-monter overflow-hidden rounded-2xl border border-ligne bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_48px_rgba(20,16,25,.14)]"
      style={delai}
    >
      <figure className="relative m-0 aspect-[4/3] overflow-hidden">
        <ImageEspace
          espace={espace}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        />
        <span className="absolute left-3.5 top-3.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-violet">
          {libelleType(espace.type_espace)}
        </span>
        <span
          className={`absolute right-3.5 top-3.5 flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold text-white ${
            dispo ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          {dispo ? 'Dispo' : 'Complet'}
        </span>
      </figure>

      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[13px] text-ardoise">
            <Lieu width={13} height={13} />
            {espace.localisation || 'Yaoundé'}
          </div>
          <span className="flex items-center gap-1 text-[13px] font-semibold">
            <Etoile className="text-amber-400" />
            {espace.capacite} pl.
          </span>
        </div>

        <h3 className="mt-3 font-titre text-[19px] font-semibold leading-tight tracking-tight">
          {espace.nom}
        </h3>

        <div className="my-4 h-px bg-ligne" />

        <div className="flex items-center justify-between">
          <p className="text-[12.5px] text-ardoise">
            Standard ou VIP,<br />au choix à la réservation.
          </p>
          <Link
            to={`/espaces/${espace.id}`}
            className="flex flex-none items-center gap-1.5 rounded-md bg-violet px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-fonce"
          >
            Réserver
            <Fleche width={15} height={15} />
          </Link>
        </div>
      </div>
    </article>
  )
}
