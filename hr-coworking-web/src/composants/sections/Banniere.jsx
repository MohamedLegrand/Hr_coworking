import { Link } from 'react-router-dom'
import { Fleche } from '../communs/Icones'

const IMG_BANNIERE = '/images/hero/coworking.jpg'

export default function Banniere() {
  return (
    <section className="relative mt-6">
      <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden text-center">
        <img src={IMG_BANNIERE} alt="Salle de réunion" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[rgba(15,10,25,.72)]" />
        <div className="relative px-4 py-14 sm:px-7">
          <h2 className="mx-auto max-w-[720px] font-titre text-[clamp(28px,4vw,48px)] font-bold leading-tight tracking-tight text-white">
            Un espace de confiance pour les esprits créatifs.
          </h2>
          <Link
            to="/connexion"
            className="mt-7 inline-flex items-center gap-2.5 rounded-md bg-violet px-7 py-4 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-violet-fonce"
          >
            Réserver une visite
            <Fleche width={16} height={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
