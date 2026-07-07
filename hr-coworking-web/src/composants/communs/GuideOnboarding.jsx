import { useState, useEffect } from 'react'
import { Info, Croix } from './Icones'

/**
 * Guide d'onboarding - Affiche des étapes pour guider l'utilisateur
 * Ex: PageDashboard => montrer où réserver, comment voir les réservations, etc.
 */
export function GuideOnboarding({ etapes, onTermine }) {
  const [etapeActuelle, setEtapeActuelle] = useState(0)
  const [affiche, setAffiche] = useState(true)

  const etape = etapes[etapeActuelle]

  const suivant = () => {
    if (etapeActuelle < etapes.length - 1) {
      setEtapeActuelle((p) => p + 1)
    } else {
      terminer()
    }
  }

  const terminer = () => {
    setAffiche(false)
    localStorage.setItem(`guide_${etapes[0]?.id}`, 'done')
    onTermine?.()
  }

  useEffect(() => {
    // Vérifier si le guide a déjà été vu
    if (localStorage.getItem(`guide_${etapes[0]?.id}`)) {
      setAffiche(false)
    }
  }, [etapes])

  if (!affiche || !etape) return null

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {/* Overlay semi-transparent */}
      <div
        className="absolute inset-0 bg-black/40 pointer-events-auto"
        onClick={terminer}
        aria-label="Fermer le guide"
      />

      {/* Bulle du guide */}
      <div
        className="absolute z-50 max-w-sm rounded-xl bg-white shadow-xl pointer-events-auto animate-in fade-in zoom-in duration-300"
        style={{
          top: `${etape.y || 50}%`,
          left: `${etape.x || 50}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-violet text-white text-[11px] font-bold">
                {etapeActuelle + 1}
              </div>
              <h3 className="text-[14px] font-semibold text-encre">{etape.titre}</h3>
            </div>
            <button
              type="button"
              onClick={terminer}
              className="flex-none text-slate-400 hover:text-slate-600"
              aria-label="Fermer"
            >
              <Croix width={16} height={16} />
            </button>
          </div>
          
          <p className="text-[13px] leading-relaxed text-slate-700 mb-4">{etape.description}</p>
          
          <div className="flex items-center justify-between gap-2">
            {/* Indicateurs de progression */}
            <div className="flex gap-1">
              {etapes.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === etapeActuelle
                      ? 'w-6 bg-violet'
                      : idx < etapeActuelle
                      ? 'w-1.5 bg-violet/40'
                      : 'w-1.5 bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* Boutons */}
            <div className="flex gap-2">
              {etapeActuelle > 0 && (
                <button
                  type="button"
                  onClick={() => setEtapeActuelle((p) => p - 1)}
                  className="text-[12px] font-semibold text-slate-600 hover:text-encre"
                >
                  Précédent
                </button>
              )}
              <button
                type="button"
                onClick={suivant}
                className="rounded-md bg-violet px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-violet-fonce"
              >
                {etapeActuelle === etapes.length - 1 ? 'Terminer' : 'Suivant'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Composant d'aide flottant - Petit bouton "?" pour obtenir de l'aide
 */
export function BoutonAide({ titre, description, position = 'bottom-right' }) {
  const [affiche, setAffiche] = useState(false)

  const positions = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  }

  return (
    <div className={`fixed z-50 ${positions[position]} pointer-events-auto`}>
      <button
        type="button"
        onClick={() => setAffiche(!affiche)}
        className="grid h-10 w-10 place-items-center rounded-full bg-violet text-white shadow-lg hover:bg-violet-fonce transition-all"
        aria-label="Aide"
      >
        <Info width={18} height={18} />
      </button>

      {affiche && (
        <div className="absolute bottom-full right-0 mb-2 w-72 rounded-lg bg-white shadow-xl border border-ligne p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h4 className="text-[14px] font-semibold text-encre">{titre}</h4>
            <button
              type="button"
              onClick={() => setAffiche(false)}
              className="flex-none text-slate-400 hover:text-slate-600"
            >
              <Croix width={16} height={16} />
            </button>
          </div>
          <p className="text-[13px] leading-relaxed text-slate-700">{description}</p>
        </div>
      )}
    </div>
  )
}
