import { useMemo, useState } from 'react'
import CarteEspace from '../communs/CarteEspace'
import SqueletteCarteEspace from '../communs/SqueletteCarteEspace'
import { Check } from '../communs/Icones'
import { useEspaces } from '../../hooks/useEspaces'
import { FILTRES_TYPE, prixAffichage } from '../../utilitaires/format'

export default function SectionEspaces() {
  const [type, setType] = useState(null)
  const [tri, setTri] = useState('recommande')

  const filtres = type ? { type_espace: type } : {}
  const { data: espaces = [], isLoading, isError } = useEspaces(filtres)

  const espacesTries = useMemo(() => {
    const copie = [...espaces]
    const prix = (e) => Number(prixAffichage(e).montant ?? 0)
    if (tri === 'prix-asc') copie.sort((a, b) => prix(a) - prix(b))
    if (tri === 'prix-desc') copie.sort((a, b) => prix(b) - prix(a))
    return copie
  }, [espaces, tri])

  return (
    <section id="espaces" className="mx-auto max-w-[1240px] scroll-mt-[74px] px-4 pb-10 pt-20 sm:px-7">

      {/* En-tête section */}
      <div className="mb-3.5 text-center">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-violet">
          <Check width={16} height={16} /> Nos espaces
        </span>
      </div>
      <h2 className="mx-auto mb-2 max-w-[640px] text-center font-titre text-[clamp(30px,4vw,46px)] font-bold leading-tight tracking-tight">
        Choisissez votre espace de travail idéal
      </h2>
      <p className="mb-9 text-center text-[15.5px] text-ardoise">
        {isLoading
          ? 'Chargement des espaces…'
          : `${espacesTries.length} espace${espacesTries.length > 1 ? 's' : ''} disponible${espacesTries.length > 1 ? 's' : ''}`}
      </p>

      {/* Contrôles filtres + tri */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-5">
        <div className="flex flex-wrap gap-2.5">
          {FILTRES_TYPE.map((f) => {
            const actif = f.valeur === type
            return (
              <button
                key={f.libelle}
                onClick={() => setType(f.valeur)}
                className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-all ${
                  actif
                    ? 'border-violet bg-violet text-white'
                    : 'border-ligne bg-white text-encre hover:border-violet'
                }`}
              >
                {f.libelle}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-ligne px-3 py-2.5">
          <span className="text-[13px] text-ardoise">Trier</span>
          <select
            value={tri}
            onChange={(e) => setTri(e.target.value)}
            className="cursor-pointer border-none bg-transparent text-[13px] font-semibold text-encre outline-none"
          >
            <option value="recommande">Recommandés</option>
            <option value="prix-asc">Prix croissant</option>
            <option value="prix-desc">Prix décroissant</option>
          </select>
        </div>
      </div>

      {/* Erreur */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          Impossible de charger les espaces. Vérifiez que l'API est démarrée.
        </div>
      )}

      {/* Grille cartes */}
      {!isError && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <SqueletteCarteEspace key={i} />)
            : espacesTries.map((espace, i) => (
                <CarteEspace key={espace.id} espace={espace} index={i} />
              ))}
        </div>
      )}

      {/* État vide */}
      {!isLoading && !isError && espacesTries.length === 0 && (
        <div className="rounded-xl border border-ligne bg-lavande p-12 text-center text-ardoise">
          Aucun espace ne correspond à ce filtre pour le moment.
        </div>
      )}
    </section>
  )
}
