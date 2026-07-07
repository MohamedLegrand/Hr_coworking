import { useMemo, useState } from 'react'
import { useTousPaiements } from '../../hooks/usePaiements'
import { useTousUtilisateurs } from '../../hooks/useUtilisateurs'
import AlerteErreur from '../../composants/communs/AlerteErreur'
import { formatFcfa } from '../../utilitaires/format'

const FILTRES_STATUT = [
  { valeur: null, libelle: 'Tous' },
  { valeur: 'PENDING', libelle: 'En cours' },
  { valeur: 'SUCCESS', libelle: 'Réussis' },
  { valeur: 'FAILED', libelle: 'Échoués' },
  { valeur: 'HOLD', libelle: 'En pause' },
]

function BadgeStatutPaiement({ statut }) {
  const palette = {
    SUCCESS: 'bg-emerald-100 text-emerald-700',
    PENDING: 'bg-amber-100 text-amber-700',
    FAILED: 'bg-red-100 text-red-700',
    HOLD: 'bg-slate-200 text-slate-600',
  }
  const libelle = { SUCCESS: 'Réussi', PENDING: 'En cours', FAILED: 'Échoué', HOLD: 'En pause' }
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${palette[statut] || 'bg-slate-100 text-slate-600'}`}>
      {libelle[statut] || statut || '—'}
    </span>
  )
}

export default function PageAdminPaiements() {
  const [statutActif, setStatutActif] = useState(null)
  const { data: tousPaiements = [], isLoading, error } = useTousPaiements()
  const { data: utilisateurs = [] } = useTousUtilisateurs()

  const utilisateurParId = useMemo(() => Object.fromEntries((utilisateurs || []).map((u) => [u.id, u])), [utilisateurs])

  const paiements = useMemo(
    () => (statutActif ? tousPaiements.filter((p) => p.statut === statutActif) : tousPaiements),
    [tousPaiements, statutActif],
  )

  const totalReussi = tousPaiements
    .filter((p) => p.statut === 'SUCCESS')
    .reduce((s, p) => s + Number(p.montant_net ?? p.montant ?? 0), 0)

  return (
    <div className="pb-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet">Administration</p>
          <h1 className="mt-3 font-titre text-[clamp(24px,3vw,34px)] font-bold tracking-tight text-encre">
            Paiements
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ardoise">
            Suivi des paiements Mobile Money (MTN / Orange). Le statut est mis à jour automatiquement
            par HR-Skills Pay, aucune validation manuelle n'est nécessaire.
          </p>
        </div>
        <div className="rounded-2xl border border-ligne bg-white px-5 py-3.5 text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ardoise">Total réussi</p>
          <p className="mt-1 font-titre text-xl font-bold text-violet">{formatFcfa(totalReussi)}</p>
        </div>
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

      <div className="overflow-hidden rounded-2xl border border-ligne bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-ligne bg-lavande/50 text-[11.5px] font-semibold uppercase tracking-wide text-ardoise">
                <th className="px-5 py-3.5">Client</th>
                <th className="px-5 py-3.5">Référence</th>
                <th className="px-5 py-3.5">Montant</th>
                <th className="px-5 py-3.5">Opérateur</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Statut</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="border-b border-ligne last:border-0">
                    <td colSpan={6} className="px-5 py-4"><div className="h-5 animate-pulse rounded bg-lavande" /></td>
                  </tr>
                ))
              ) : paiements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-ardoise">Aucun paiement pour ce filtre.</td>
                </tr>
              ) : (
                paiements.map((p) => {
                  const client = utilisateurParId[p.utilisateur_id]
                  return (
                    <tr key={p.id} className="border-b border-ligne last:border-0 hover:bg-lavande/30">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-encre">{client ? `${client.prenom} ${client.nom}` : 'Client'}</p>
                        <p className="text-[12px] text-ardoise">{client?.email || '—'}</p>
                      </td>
                      <td className="px-5 py-3.5 text-ardoise">{p.reference}</td>
                      <td className="px-5 py-3.5 font-semibold text-violet">{formatFcfa(p.montant)}</td>
                      <td className="px-5 py-3.5 text-ardoise">
                        {p.operateur || '—'}{p.numero_telephone ? ` · ${p.numero_telephone}` : ''}
                      </td>
                      <td className="px-5 py-3.5 text-ardoise">
                        {p.cree_le ? new Date(p.cree_le).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <BadgeStatutPaiement statut={p.statut} />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
