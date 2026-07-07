import { useMemo, useState } from 'react'
import { useToutesReservations } from '../../hooks/useReservations'
import { useEspaces } from '../../hooks/useEspaces'
import { useTousUtilisateurs } from '../../hooks/useUtilisateurs'
import AlerteErreur from '../../composants/communs/AlerteErreur'
import { formatFcfa } from '../../utilitaires/format'

const FILTRES_STATUT = [
  { valeur: null, libelle: 'Toutes' },
  { valeur: 'en_attente', libelle: 'En attente' },
  { valeur: 'confirmee', libelle: 'Confirmées' },
  { valeur: 'annulee', libelle: 'Annulées' },
]

function BadgeStatut({ statut }) {
  const palette = {
    confirmee: 'bg-emerald-100 text-emerald-700',
    en_attente: 'bg-amber-100 text-amber-700',
    annulee: 'bg-slate-200 text-slate-600',
  }
  const libelle = { confirmee: 'Confirmée', en_attente: 'En attente', annulee: 'Annulée' }
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${palette[statut] || 'bg-slate-100 text-slate-600'}`}>
      {libelle[statut] || statut}
    </span>
  )
}

export default function PageAdminReservations() {
  const [statutActif, setStatutActif] = useState(null)
  const { data: toutesReservations = [], isLoading, error } = useToutesReservations()
  const { data: espaces = [] } = useEspaces()
  const { data: utilisateurs = [] } = useTousUtilisateurs()

  const espaceParId = useMemo(() => Object.fromEntries((espaces || []).map((e) => [e.id, e])), [espaces])
  const utilisateurParId = useMemo(() => Object.fromEntries((utilisateurs || []).map((u) => [u.id, u])), [utilisateurs])

  const reservations = useMemo(
    () => (statutActif ? toutesReservations.filter((r) => r.statut === statutActif) : toutesReservations),
    [toutesReservations, statutActif],
  )

  return (
    <div className="pb-16">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet">Administration</p>
        <h1 className="mt-3 font-titre text-[clamp(24px,3vw,34px)] font-bold tracking-tight text-encre">
          Réservations
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ardoise">
          Vue d'ensemble des réservations de tous les membres. La confirmation se fait automatiquement
          dès que le paiement Mobile Money est validé.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTRES_STATUT.map((f) => (
          <button
            key={f.libelle}
            type="button"
            onClick={() => setStatutActif(f.valeur)}
            className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-all ${
              f.valeur === statutActif
                ? 'border-violet bg-violet text-white'
                : 'border-ligne bg-white text-encre hover:border-violet'
            }`}
          >
            {f.libelle}
          </button>
        ))}
      </div>

      {error && <div className="mb-6"><AlerteErreur erreur={error} /></div>}

      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-lavande" />)
        ) : reservations.length === 0 ? (
          <div className="rounded-2xl border border-ligne bg-white p-10 text-center text-sm text-ardoise">
            Aucune réservation pour ce filtre.
          </div>
        ) : (
          reservations.map((reservation) => {
            const premierEspace = espaceParId[reservation.details?.[0]?.espace_id]
            const client = utilisateurParId[reservation.utilisateur_id]
            return (
              <article key={reservation.id} className="rounded-2xl border border-ligne bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-ardoise">
                      Réservation #{reservation.id.slice(0, 8)}
                    </p>
                    <p className="mt-1.5 font-titre text-[16px] font-bold text-encre">
                      {client ? `${client.prenom} ${client.nom}` : 'Client'}
                      {client?.email && <span className="ml-2 text-[12.5px] font-normal text-ardoise">{client.email}</span>}
                    </p>
                    <p className="mt-1 text-sm text-ardoise">
                      {premierEspace?.nom || 'Espace'} · {formatFcfa(reservation.prix_total)}
                    </p>
                  </div>
                  <BadgeStatut statut={reservation.statut} />
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <p>Début : {new Date(reservation.details?.[0]?.date_debut || reservation.date_creation).toLocaleDateString('fr-FR')}</p>
                  <p>Fin : {new Date(reservation.details?.[0]?.date_fin || reservation.date_creation).toLocaleDateString('fr-FR')}</p>
                </div>
              </article>
            )
          })
        )}
      </div>
    </div>
  )
}
