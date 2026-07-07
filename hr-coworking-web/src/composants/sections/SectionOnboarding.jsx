import { Check, Fleche, Bureau, Wifi, Canape } from '../communs/Icones'

const ETAPES = [
  {
    titre: 'Choisissez votre espace',
    description: 'Bureau privé, open space ou salle de réunion — sélectionnez l’espace qui correspond à votre activité.',
    icone: Bureau,
  },
  {
    titre: 'Réservez en quelques clics',
    description: 'Ajoutez vos dates, confirmez votre session et recevez instantanément votre confirmation par notification.',
    icone: Wifi,
  },
  {
    titre: 'Travaillez sereinement',
    description: 'Espace prêt à l’emploi avec wifi, café et support sur place pour vos rendez-vous professionnels.',
    icone: Canape,
  },
]

export default function SectionOnboarding() {
  return (
    <section className="mx-auto max-w-[1240px] px-4 py-20 sm:px-7">
      <div className="mb-10 text-center">
        <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-violet">
          <Check width={16} height={16} /> Comment ça marche
        </span>
        <h2 className="mt-4 text-[clamp(30px,4vw,44px)] font-titre font-bold leading-tight text-encre">
          Un onboarding client simple, clair et professionnel.
        </h2>
        <p className="mx-auto mt-4 max-w-[680px] text-[15.5px] leading-relaxed text-ardoise">
          De la première visite à la réservation confirmée, chaque étape est conçue pour rassurer l’utilisateur et garantir une expérience fluide sur mobile comme sur desktop.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {ETAPES.map((etape, index) => {
          const Icone = etape.icone
          return (
            <article key={etape.titre} className="group rounded-[2rem] border border-ligne bg-white p-8 transition hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(20,16,25,.08)]">
              <span className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-violet/10 text-violet">
                <Icone width={26} height={26} />
              </span>
              <h3 className="mb-4 text-xl font-semibold text-encre">{etape.titre}</h3>
              <p className="text-sm leading-relaxed text-ardoise">{etape.description}</p>
              <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-violet">
                <span>{index + 1}</span>
                <Fleche width={16} height={16} />
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
