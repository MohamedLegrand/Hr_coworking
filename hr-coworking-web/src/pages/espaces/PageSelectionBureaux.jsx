import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AssistantReservation from '../../composants/widgets/AssistantReservation'
import ModaleCguKyc from '../../composants/communs/ModaleCguKyc'
import ImageEspace from '../../composants/communs/ImageEspace'
import { Plus, Croix } from '../../composants/communs/Icones'
import { useCreerReservation, useEspacesReserves } from '../../hooks/useReservations'
import { useProfilComplet } from '../../hooks/useUtilisateurs'
import { useEspaces } from '../../hooks/useEspaces'
import { useToast } from '../../contexte/ToastContext'
import { FILTRES_TYPE, formatPeriodeReservee } from '../../utilitaires/format'
import { getErrorMessage, getErrorTitle } from '../../utilitaires/erreurs'

export default function PageSelectionBureaux() {
  const [reservationEnAttente, setReservationEnAttente] = useState(null)
  const [typeActif, setTypeActif] = useState(null)
  const [panier, setPanier] = useState([]) // Espace[]
  const creerReservation = useCreerReservation()
  const { data: profil } = useProfilComplet()
  const { data: espaces = [], isLoading: espacesLoading } = useEspaces()
  const { data: reservationsActives = [] } = useEspacesReserves()
  const { error: toastError } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (creerReservation.isError) {
      toastError(getErrorTitle(creerReservation.error), getErrorMessage(creerReservation.error))
    }
  }, [creerReservation.isError, creerReservation.error, toastError])

  const reserver = (payload) => {
    creerReservation.mutate(payload, {
      onSuccess: (reservationCreee) => {
        setPanier([])
        setReservationEnAttente(reservationCreee)
      },
    })
  }

  const espacesFiltres = (espaces || []).filter((e) => {
    if (!e.est_disponible) return false
    return typeActif ? e.type_espace === typeActif : true
  })

  const ajouterAuPanier = (espace) => {
    setPanier((p) => (p.some((e) => e.id === espace.id) ? p : [...p, espace]))
  }
  const retirerDuPanier = (espaceId) => setPanier((p) => p.filter((e) => e.id !== espaceId))

  return (
    <div className="pb-16">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet">Espaces</p>
        <h1 className="mt-3 font-titre text-[clamp(24px,3vw,34px)] font-bold tracking-tight text-encre">
          Choisissez vos bureaux
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ardoise">
          Ajoutez un ou plusieurs espaces à votre récapitulatif, choisissez votre forfait et votre
          date, puis confirmez.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-ligne bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet">Réserver</p>
                <h2 className="mt-2 text-2xl font-bold text-encre">Espaces disponibles</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {FILTRES_TYPE.map((f) => (
                  <button
                    key={f.libelle}
                    type="button"
                    onClick={() => setTypeActif(f.valeur)}
                    className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-all ${
                      f.valeur === typeActif
                        ? 'border-violet bg-violet text-white'
                        : 'border-ligne bg-white text-encre hover:border-violet'
                    }`}
                  >
                    {f.libelle}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {espacesLoading ? (
                [1, 2].map((i) => <div key={i} className="h-40 rounded-2xl bg-lavande" />)
              ) : espacesFiltres.length === 0 ? (
                <div className="rounded-2xl border border-ligne bg-slate-50 p-8 text-center text-sm text-slate-600 sm:col-span-2 xl:col-span-4">
                  Aucun espace disponible pour ce filtre.
                </div>
              ) : (
                espacesFiltres.map((espace) => {
                  const dejaChoisi = panier.some((e) => e.id === espace.id)
                  const reservation = reservationsActives
                    .filter((r) => r.espace_id === espace.id)
                    .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut))[0]
                  return (
                    <div key={espace.id} className="overflow-hidden rounded-2xl border border-ligne">
                      <div className="relative h-32">
                        <ImageEspace espace={espace} className="h-full w-full object-cover" />
                        {reservation && (
                          <span className="absolute left-3 top-3 rounded-full bg-amber-500/95 px-3 py-1 text-[10.5px] font-bold text-white">
                            Réservé
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-titre text-[15px] font-semibold text-encre">{espace.nom}</p>
                          <button
                            type="button"
                            onClick={() => ajouterAuPanier(espace)}
                            disabled={dejaChoisi}
                            aria-label={`Ajouter ${espace.nom} au récapitulatif`}
                            className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-violet text-white shadow transition hover:-translate-y-0.5 hover:bg-violet-fonce disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Plus width={16} height={16} />
                          </button>
                        </div>
                        {reservation && (
                          <p className="mt-2 text-[11.5px] leading-snug text-amber-700">
                            Espace réservé — {formatPeriodeReservee(reservation.date_debut, reservation.date_fin)}
                          </p>
                        )}
                        {dejaChoisi && (
                          <p className="mt-3 text-[11.5px] font-semibold text-violet">Ajouté au récapitulatif →</p>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Récapitulatif du panier */}
        <div className="overflow-hidden rounded-2xl border border-ligne bg-white shadow-sm lg:h-fit">
          <div className="flex items-center justify-between p-6 pb-0">
            <span className="font-titre text-lg font-semibold text-encre">Récapitulatif</span>
            <span className="text-xs text-ardoise">{panier.length} espace{panier.length > 1 ? 's' : ''}</span>
          </div>

          {panier.length === 0 ? (
            <p className="m-6 rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-600">
              Ajoutez un espace avec le bouton +.
            </p>
          ) : (
            <>
              <div className="space-y-2 p-6 pb-0">
                {panier.map((espace) => (
                  <div key={espace.id} className="flex items-center justify-between gap-2 rounded-xl border border-ligne p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-encre">{espace.nom}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => retirerDuPanier(espace.id)}
                      aria-label="Retirer"
                      className="grid h-7 w-7 flex-none place-items-center rounded-lg bg-lavande text-violet"
                    >
                      <Croix width={13} height={13} />
                    </button>
                  </div>
                ))}
              </div>
              <AssistantReservation espaces={panier} onReserver={reserver} chargement={creerReservation.isPending} />
            </>
          )}
        </div>
      </div>

      {reservationEnAttente && (
        <ModaleCguKyc
          reservationId={reservationEnAttente.id}
          profil={profil}
          onFermer={() => setReservationEnAttente(null)}
          onValide={() => navigate(`/paiements?reservation=${reservationEnAttente.id}`)}
        />
      )}
    </div>
  )
}
