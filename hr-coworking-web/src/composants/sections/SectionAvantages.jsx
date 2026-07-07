import { Check, Ecran } from '../communs/Icones'

const PERKS = [
  'Internet fibre haut débit',
  'Salles climatisées',
  'Caméra de surveillance',
  'Cuisine équipée',
  'Vidéoprojecteur disponible',
  'Disponible 5 jours sur 7',
]

export default function SectionAvantages() {
  return (
    <section className="mx-auto max-w-[1240px] px-4 pb-10 pt-24 sm:px-7">
      <div className="grid items-stretch gap-0 md:grid-cols-2">
        <div className="rounded-t-xl bg-lavande p-12 md:rounded-l-xl md:rounded-tr-none">
          <h2 className="font-titre text-[clamp(28px,3.4vw,38px)] font-bold leading-tight tracking-tight">
            Des environnements de travail qui font avancer votre business.
          </h2>
          <p className="mt-5 text-[15.5px] leading-relaxed text-ardoise">
            Des espaces pensés pour la concentration et la collaboration :
            mobilier ergonomique, connexion fibre, salles insonorisées et
            services à la carte. Vous vous installez, on gère le reste.
          </p>
        </div>

        <div className="rounded-b-xl bg-violet p-11 text-white md:rounded-r-xl md:rounded-bl-none">
          <div className="flex items-center gap-4 border-b border-white/20 pb-6">
            <span className="grid h-14 w-14 flex-none place-items-center rounded-xl bg-white/15">
              <Ecran width={28} height={28} />
            </span>
            <div>
              <div className="font-titre text-[38px] font-bold leading-none">37 400</div>
              <div className="mt-0.5 text-[13px] text-white/80">heures de travail réservées</div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3.5">
            {PERKS.map((p) => (
              <div key={p} className="flex items-center gap-2.5 text-sm font-medium">
                <Check width={16} height={16} className="flex-none" />
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
