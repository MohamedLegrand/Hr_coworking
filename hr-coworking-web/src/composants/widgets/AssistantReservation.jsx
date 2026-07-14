import { useState, useMemo } from 'react'
import { useForfaits, useIndisponibilites } from '../../hooks/useReservations'
import { formatFcfa, formatPeriodeReservee } from '../../utilitaires/format'
import { libelleForfait, libelleGamme } from '../../utilitaires/tarifs'
import { Fleche } from '../communs/Icones'

const ORDRE_FORFAITS = ['heure', 'jour', 'semaine', 'mois']

function ajouterHeures(date, heures) {
  return new Date(date.getTime() + heures * 3600 * 1000)
}

const DUREE_PAR_FORFAIT_HEURES = { heure: 1, jour: 24, semaine: 24 * 7, mois: 24 * 30 }

const HEURES_OUVERTURE = Array.from({ length: 13 }, (_, i) => `${String(7 + i).padStart(2, '0')}:00`)

// Une seule gamme disponible pour le moment (standard) — le choix de gamme
// est donc masqué. Quand la gamme VIP sera réintroduite (voir forfaits.py
// et schemas.py côté backend), il suffira de retirer cette constante et de
// réactiver le <select> de gamme ci-dessous.
const GAMME_UNIQUE = 'standard'

/**
 * Assistant de réservation, une fois un ou plusieurs bureaux choisis :
 * forfait (prix fixe) → date de début → récapitulatif. La réservation
 * n'est créée qu'à la confirmation du récapitulatif — ni le KYC ni les
 * CGU ne sont vérifiés ici (voir ModaleCguKyc, affichée par la page
 * appelante juste après).
 */
export default function AssistantReservation({ espaces, onReserver, chargement, onReinitialiser }) {
  const { data: forfaits = [] } = useForfaits()
  const gamme = GAMME_UNIQUE
  const [etape, setEtape] = useState('forfait')
  const [forfait, setForfait] = useState('jour')
  const aujourdHui = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(aujourdHui)
  const [heureDebut, setHeureDebut] = useState('09:00')

  const forfaitsGamme = useMemo(
    () => ORDRE_FORFAITS
      .map((f) => forfaits.find((x) => x.gamme === gamme && x.forfait === f))
      .filter(Boolean),
    [forfaits, gamme]
  )
  const forfaitChoisi = forfaits.find((f) => f.gamme === gamme && f.forfait === forfait)

  const debut = useMemo(() => new Date(`${date}T${heureDebut}:00`), [date, heureDebut])
  const fin = useMemo(
    () => ajouterHeures(debut, DUREE_PAR_FORFAIT_HEURES[forfait] || 0),
    [debut, forfait]
  )

  const { data: indisponibles = [] } = useIndisponibilites(
    etape === 'date' || etape === 'recap' ? debut : null,
    etape === 'date' || etape === 'recap' ? fin : null,
  )
  const bureauxEnConflit = espaces
    .map((e) => ({ espace: e, conflit: indisponibles.find((i) => i.espace_id === e.id) }))
    .filter((x) => x.conflit)

  const total = (forfaitChoisi?.prix || 0) * espaces.length

  const confirmer = () => {
    onReserver({ espaceIds: espaces.map((e) => e.id), gamme, forfait, dateDebut: debut })
  }

  if (espaces.length === 0) return null

  return (
    <div className="border-t border-ligne bg-lavande px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13.5px] font-semibold text-encre">
          {espaces.length} bureau{espaces.length > 1 ? 'x' : ''} sélectionné{espaces.length > 1 ? 's' : ''}
          <span className="ml-2 font-normal text-ardoise">
            ({espaces.map((e) => e.nom).join(', ')})
          </span>
        </p>
        {onReinitialiser && (
          <button type="button" onClick={onReinitialiser} className="text-[12.5px] font-semibold text-violet hover:text-violet-fonce">
            Réinitialiser
          </button>
        )}
      </div>

      {/* Étape 1 : forfait */}
      <div className="rounded-xl border border-ligne bg-white p-5">
        <p className="mb-3 text-[13px] font-semibold text-ardoise">1. Choisissez votre forfait</p>
        <div className="grid grid-cols-2 gap-3">
          {forfaitsGamme.map((f) => (
            <button
              key={f.forfait}
              type="button"
              onClick={() => { setForfait(f.forfait); setEtape('date') }}
              className={`relative flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-all ${
                forfait === f.forfait ? 'border-violet bg-lavande' : 'border-ligne hover:border-violet/40'
              }`}
            >
              {f.meilleure_valeur && (
                <span className="absolute -top-2 right-3 whitespace-nowrap rounded-full bg-violet px-2 py-0.5 text-[9px] font-bold text-white">
                  Meilleure valeur
                </span>
              )}
              <span className="text-[12.5px] font-semibold text-encre">{libelleForfait(f.forfait)}</span>
              <span className="whitespace-nowrap text-[14px] font-bold text-violet">{formatFcfa(f.prix)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Étape 2 : date de début */}
      {(etape === 'date' || etape === 'recap') && (
        <div className="mt-4 rounded-xl border border-ligne bg-white p-5">
          <p className="mb-3 text-[13px] font-semibold text-ardoise">2. Choisissez la date de début</p>
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-encre">Date</label>
              <input
                type="date"
                value={date}
                min={aujourdHui}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 rounded-lg border border-ligne bg-white px-3 text-[13.5px] text-encre outline-none focus:border-violet focus:ring-2 focus:ring-violet/15"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-encre">Heure de début</label>
              <select
                value={heureDebut}
                onChange={(e) => setHeureDebut(e.target.value)}
                className="h-10 rounded-lg border border-ligne bg-white px-3 text-[13.5px] text-encre outline-none focus:border-violet focus:ring-2 focus:ring-violet/15"
              >
                {HEURES_OUVERTURE.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
          <p className="mt-3 text-[12.5px] text-ardoise">
            Fin calculée automatiquement : <span className="font-semibold text-encre">{fin.toLocaleString('fr-FR')}</span>
          </p>

          {bureauxEnConflit.length > 0 && (
            <div className="mt-3 space-y-1.5 rounded-lg bg-red-50 px-3 py-2">
              {bureauxEnConflit.map(({ espace, conflit }) => (
                <p key={espace.id} className="text-[12.5px] font-medium text-red-700">
                  {espace.nom} — {formatPeriodeReservee(conflit.date_debut, conflit.date_fin)} Choisissez une autre date.
                </p>
              ))}
            </div>
          )}

          {etape === 'date' && (
            <button
              type="button"
              onClick={() => setEtape('recap')}
              disabled={bureauxEnConflit.length > 0}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-violet px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-violet-fonce disabled:cursor-not-allowed disabled:opacity-60"
            >
              Voir le récapitulatif
              <Fleche width={14} height={14} />
            </button>
          )}
        </div>
      )}

      {/* Étape 3 : récapitulatif */}
      {etape === 'recap' && forfaitChoisi && (
        <div className="mt-4 rounded-xl border border-violet bg-white p-5">
          <p className="mb-3 text-[13px] font-semibold text-ardoise">3. Récapitulatif</p>
          <dl className="grid grid-cols-2 gap-2 text-[13px]">
            <dt className="text-ardoise">Bureau(x)</dt>
            <dd className="text-right font-semibold text-encre">{espaces.map((e) => e.nom).join(', ')}</dd>
            <dt className="text-ardoise">Gamme</dt>
            <dd className="text-right font-semibold text-encre">{libelleGamme(gamme)}</dd>
            <dt className="text-ardoise">Forfait</dt>
            <dd className="text-right font-semibold text-encre">{libelleForfait(forfait)}</dd>
            <dt className="text-ardoise">Début</dt>
            <dd className="text-right font-semibold text-encre">{debut.toLocaleString('fr-FR')}</dd>
            <dt className="text-ardoise">Fin</dt>
            <dd className="text-right font-semibold text-encre">{fin.toLocaleString('fr-FR')}</dd>
          </dl>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {forfaitChoisi.prestations.map((p) => (
              <span key={p} className="rounded-full bg-lavande px-2.5 py-1 text-[11px] font-medium text-violet">
                {p}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-dashed border-ligne pt-3">
            <span className="text-[13.5px] font-semibold text-encre">Total ({espaces.length} × {formatFcfa(forfaitChoisi.prix)})</span>
            <span className="font-titre text-xl font-bold text-violet">{formatFcfa(total)}</span>
          </div>
          <p className="mt-1 text-[11.5px] text-ardoise">Aucun frais caché.</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setEtape('forfait')}
              className="rounded-md border border-ligne px-5 py-2.5 text-[13px] font-semibold text-ardoise transition hover:border-violet hover:text-violet"
            >
              Modifier
            </button>
            <button
              type="button"
              onClick={confirmer}
              disabled={chargement || bureauxEnConflit.length > 0}
              className="inline-flex items-center gap-2 rounded-md bg-violet px-6 py-2.5 text-[13px] font-semibold text-white transition hover:bg-violet-fonce disabled:cursor-not-allowed disabled:opacity-60"
            >
              {chargement ? 'Envoi…' : 'Confirmer la réservation'}
              <Fleche width={14} height={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
