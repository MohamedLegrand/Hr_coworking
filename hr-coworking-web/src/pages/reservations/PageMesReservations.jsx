import { useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useMesReservations, useAnnulerReservation } from '../../hooks/useReservations'
import { useEspaces } from '../../hooks/useEspaces'
import { useToast } from '../../contexte/ToastContext'
import { Calendrier, CartePaiement, Croix } from '../../composants/communs/Icones'
import { formatFcfa } from '../../utilitaires/format'
import { getErrorMessage, getErrorTitle } from '../../utilitaires/erreurs'

function BadgeReservation({ statut }) {
  const palette = {
    confirmee: 'bg-emerald-600 text-white',
    en_attente: 'bg-amber-500 text-white',
    annulee: 'bg-slate-400 text-white',
  }
  const libelle = { confirmee: 'Confirmée', en_attente: 'En attente de paiement', annulee: 'Annulée' }
  return (
    <span className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${palette[statut] || 'bg-slate-400 text-white'}`}>
      {libelle[statut] || statut}
    </span>
  )
}

export default function PageMesReservations() {
  const { data: reservations = [], isLoading, error } = useMesReservations()
  const { data: espaces = [] } = useEspaces()
  const annuler = useAnnulerReservation()
  const { success: toastSuccess, error: toastError } = useToast()

  useEffect(() => {
    if (error) {
      toastError(getErrorTitle(error), getErrorMessage(error))
    }
  }, [error, toastError])

  useEffect(() => {
    if (annuler.isSuccess) {
      toastSuccess('✅ Réservation annulée', 'La réservation a été annulée avec succès.')
    }
  }, [annuler.isSuccess, toastSuccess])

  useEffect(() => {
    if (annuler.isError) {
      toastError(getErrorTitle(annuler.error), getErrorMessage(annuler.error))
    }
  }, [annuler.isError, annuler.error, toastError])

  const espaceParId = useMemo(() => Object.fromEntries((espaces || []).map((e) => [e.id, e])), [espaces])

  const reservationsTriees = useMemo(
    () => [...reservations].sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation)),
    [reservations],
  )

  const annulerAvecConfirmation = (reservation) => {
    if (window.confirm('Annuler cette réservation ?')) {
      annuler.mutate(reservation.id)
    }
  }

  return (
    <div className="pb-16">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet">Mon espace</p>
        <h1 className="mt-3 font-titre text-[clamp(24px,3vw,34px)] font-bold tracking-tight text-encre">
          Mes réservations
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ardoise">
          Retrouvez l'historique de vos réservations, payez celles en attente ou annulez-les.
        </p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-lavande" />)
        ) : reservationsTriees.length === 0 ? (
          <div className="rounded-2xl border border-ligne bg-white p-10 text-center text-sm text-ardoise">
            Vous n'avez encore aucune réservation.{' '}
            <Link to="/profil" className="font-semibold text-violet hover:text-violet-fonce">
              Réserver un espace
            </Link>
          </div>
        ) : (
          reservationsTriees.map((reservation) => {
            const premierEspace = espaceParId[reservation.details?.[0]?.espace_id]
            return (
              <article key={reservation.id} className="rounded-2xl border border-ligne bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-ardoise">
                      Réservation #{reservation.id.slice(0, 8)}
                    </p>
                    <p className="mt-1.5 font-titre text-[17px] font-bold text-encre">
                      {premierEspace?.nom || 'Espace'} · {formatFcfa(reservation.prix_total)}
                    </p>
                  </div>
                  <BadgeReservation statut={reservation.statut} />
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <p className="flex items-center gap-1.5">
                    <Calendrier width={14} height={14} />
                    Début : {new Date(reservation.details?.[0]?.date_debut || reservation.date_creation).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Calendrier width={14} height={14} />
                    Fin : {new Date(reservation.details?.[0]?.date_fin || reservation.date_creation).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                {reservation.statut === 'en_attente' && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-ligne pt-4">
                    <Link
                      to={`/paiements?reservation=${reservation.id}`}
                      className="inline-flex items-center gap-1.5 rounded-md bg-violet px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-violet-fonce"
                    >
                      <CartePaiement width={13} height={13} />
                      Payer maintenant
                    </Link>
                    <button
                      type="button"
                      onClick={() => annulerAvecConfirmation(reservation)}
                      disabled={annuler.isPending}
                      className="inline-flex items-center gap-1.5 rounded-md border border-ligne px-3.5 py-2 text-[12.5px] font-semibold text-red-600 transition hover:border-red-400 hover:bg-red-50 disabled:opacity-60"
                    >
                      <Croix width={13} height={13} />
                      Annuler
                    </button>
                  </div>
                )}
              </article>
            )
          })
        )}
      </div>
    </div>
  )
}
