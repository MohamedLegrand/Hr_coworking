import { Fleche, Bureau, Canape } from '../communs/Icones'

const IMG_LOUNGE = '/images/hero/coworking.jpg'

export default function SectionPourquoi() {
  return (
    <section className="mx-auto max-w-[1240px] px-4 py-14 sm:px-7">
      <div className="grid items-center gap-16 md:grid-cols-2">

        <div className="relative">
          <img
            src={IMG_LOUNGE}
            alt="Espace lounge"
            className="aspect-[5/4] w-full rounded-xl object-cover"
          />
          <div className="absolute -left-3.5 bottom-8 rounded-xl bg-violet px-6 py-5 text-white shadow-[0_16px_36px_rgba(124,58,237,.4)]">
            <div className="font-titre text-2xl font-bold leading-none">50+</div>
            <div className="mt-1.5 max-w-[110px] text-[12.5px] text-white/85">espaces à travers la ville</div>
          </div>
        </div>

        <div>
          <h2 className="font-titre text-[clamp(28px,3.6vw,40px)] font-bold leading-tight tracking-tight">
            Un espace à la mesure de votre impact.
          </h2>
          <p className="mb-6 mt-5 text-[15.5px] leading-relaxed text-ardoise">
            Que vous soyez freelance, startup ou grande équipe, nos formules
            s'adaptent. Réservez à la volée, invitez vos collaborateurs et
            domiciliez votre entreprise en quelques clics.
          </p>
          <div className="mb-8 flex flex-wrap gap-9">
            <div className="flex items-center gap-3.5">
              <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-lavande text-violet">
                <Bureau width={24} height={24} />
              </span>
              <div className="font-titre text-[15px] font-semibold leading-tight">Bureaux privés<br />flexibles</div>
            </div>
            <div className="flex items-center gap-3.5">
              <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-lavande text-violet">
                <Canape width={24} height={24} />
              </span>
              <div className="font-titre text-[15px] font-semibold leading-tight">Espaces 100%<br />personnalisables</div>
            </div>
          </div>
          <a
            href="#espaces"
            className="inline-flex items-center gap-2.5 rounded-md bg-violet px-7 py-4 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-violet-fonce"
          >
            Voir les espaces
            <Fleche width={16} height={16} />
          </a>
        </div>
      </div>
    </section>
  )
}
