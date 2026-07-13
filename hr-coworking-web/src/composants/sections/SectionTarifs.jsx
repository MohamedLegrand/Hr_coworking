import { Check } from '../communs/Icones'
import CarteFormule from '../communs/CarteFormule'
import { useForfaits } from '../../hooks/useReservations'
import { libelleGamme } from '../../utilitaires/tarifs'

export default function SectionTarifs() {
  const { data: forfaits = [], isLoading } = useForfaits()
  const standards = forfaits.filter((f) => f.gamme === 'standard')
  const vip = forfaits.filter((f) => f.gamme === 'vip')

  return (
    <section id="tarifs" className="mx-auto max-w-[1240px] scroll-mt-[74px] px-4 py-20 sm:px-7">

      <div className="mb-3.5 text-center">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-violet">
          <Check width={16} height={16} /> Nos tarifs
        </span>
      </div>
      <h2 className="mx-auto mb-2 max-w-[640px] text-center font-titre text-[clamp(30px,4vw,46px)] font-bold leading-tight tracking-tight">
        Une formule pour chaque façon de travailler
      </h2>
      <p className="mx-auto mb-14 max-w-[520px] text-center text-[15.5px] text-ardoise">
        Tarifs simples et transparents, sans frais cachés. Choisissez votre forfait au moment de réserver.
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-96 animate-pulse rounded-2xl bg-lavande" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {standards.map((f) => (
              <CarteFormule key={`${f.gamme}-${f.forfait}`} forfait={f} />
            ))}
          </div>

          {/* Gamme VIP — n'apparaît que lorsqu'elle sera réintroduite côté backend */}
          {vip.length > 0 && (
            <>
              <div className="mb-6 mt-16">
                <h3 className="font-titre text-lg font-semibold text-encre">Gamme {libelleGamme('vip')}</h3>
                <p className="mt-1 text-sm text-ardoise">
                  Bureau personnel, climatisation et services supplémentaires.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {vip.map((f) => (
                  <CarteFormule key={`${f.gamme}-${f.forfait}`} forfait={f} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </section>
  )
}
