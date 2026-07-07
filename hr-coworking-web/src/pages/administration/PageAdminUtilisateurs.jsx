import { useState } from 'react'
import {
  useTousUtilisateurs,
  useValiderDocument,
  useDesactiverUtilisateur,
  useReactiverUtilisateur,
} from '../../hooks/useUtilisateurs'
import AlerteErreur from '../../composants/communs/AlerteErreur'
import { Personne, Check, Croix, Boucliers } from '../../composants/communs/Icones'

const FILTRES_STATUT = [
  { valeur: null, libelle: 'Tous' },
  { valeur: 'en_attente', libelle: 'En attente' },
  { valeur: 'valide', libelle: 'Validés' },
  { valeur: 'invalide', libelle: 'Refusés' },
]

function BadgeStatutDocument({ statut }) {
  const palette = {
    valide: 'bg-emerald-100 text-emerald-700',
    en_attente: 'bg-amber-100 text-amber-700',
    invalide: 'bg-red-100 text-red-700',
  }
  const libelle = { valide: 'Validé', en_attente: 'En attente', invalide: 'Refusé' }
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${palette[statut] || 'bg-slate-100 text-slate-600'}`}>
      {libelle[statut] || statut || '—'}
    </span>
  )
}

function BadgeRole({ role }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
      role === 'admin' ? 'bg-violet text-white' : 'bg-lavande text-violet'
    }`}>
      {role === 'admin' && <Boucliers width={11} height={11} />}
      {role === 'admin' ? 'Admin' : 'Membre'}
    </span>
  )
}

export default function PageAdminUtilisateurs() {
  const [statutActif, setStatutActif] = useState(null)
  const { data: utilisateurs = [], isLoading, error } = useTousUtilisateurs(
    statutActif ? { document_statut: statutActif } : {},
  )
  const validerDocument = useValiderDocument()
  const desactiver = useDesactiverUtilisateur()
  const reactiver = useReactiverUtilisateur()

  return (
    <div className="pb-16">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet">Administration</p>
        <h1 className="mt-3 font-titre text-[clamp(24px,3vw,34px)] font-bold tracking-tight text-encre">
          Gérer les utilisateurs
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ardoise">
          Validez les pièces d'identité et gérez l'accès des comptes.
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
      {(validerDocument.isError || desactiver.isError || reactiver.isError) && (
        <div className="mb-6">
          <AlerteErreur erreur={validerDocument.error || desactiver.error || reactiver.error} />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-ligne bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-ligne bg-lavande/50 text-[11.5px] font-semibold uppercase tracking-wide text-ardoise">
                <th className="px-5 py-3.5">Utilisateur</th>
                <th className="px-5 py-3.5">Contact</th>
                <th className="px-5 py-3.5">Compte</th>
                <th className="px-5 py-3.5">Documents</th>
                <th className="px-5 py-3.5">Rôle</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1, 2, 3, 4].map((i) => (
                  <tr key={i} className="border-b border-ligne last:border-0">
                    <td colSpan={6} className="px-5 py-4"><div className="h-5 animate-pulse rounded bg-lavande" /></td>
                  </tr>
                ))
              ) : utilisateurs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-ardoise">Aucun utilisateur pour ce filtre.</td>
                </tr>
              ) : (
                utilisateurs.map((u) => (
                  <tr key={u.id} className="border-b border-ligne last:border-0 hover:bg-lavande/30">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-lavande text-violet">
                          <Personne width={16} height={16} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-encre">{u.prenom} {u.nom}</p>
                          <p className="truncate text-[12px] text-ardoise">{u.nom_entreprise || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="truncate text-encre">{u.email}</p>
                      <p className="text-[12px] text-ardoise">{u.telephone || '—'}</p>
                    </td>
                    <td className="px-5 py-3.5 text-ardoise">
                      {u.type_compte === 'entreprise' ? 'Entreprise' : 'Freelance'}
                    </td>
                    <td className="px-5 py-3.5">
                      <BadgeStatutDocument statut={u.document_statut} />
                    </td>
                    <td className="px-5 py-3.5">
                      <BadgeRole role={u.role} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {u.document_statut === 'en_attente' && (
                          <>
                            <button
                              type="button"
                              onClick={() => validerDocument.mutate({ utilisateurId: u.id, statut: 'valide' })}
                              aria-label="Valider les documents"
                              className="grid h-8 w-8 place-items-center rounded-lg border border-ligne text-emerald-600 transition hover:border-emerald-500 hover:bg-emerald-50"
                            >
                              <Check width={14} height={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => validerDocument.mutate({ utilisateurId: u.id, statut: 'invalide' })}
                              aria-label="Refuser les documents"
                              className="grid h-8 w-8 place-items-center rounded-lg border border-ligne text-red-600 transition hover:border-red-400 hover:bg-red-50"
                            >
                              <Croix width={14} height={14} />
                            </button>
                          </>
                        )}
                        {u.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => (u.est_actif ? desactiver.mutate(u.id) : reactiver.mutate(u.id))}
                            className={`rounded-lg border px-2.5 py-1.5 text-[11.5px] font-semibold transition ${
                              u.est_actif
                                ? 'border-ligne text-red-600 hover:border-red-400'
                                : 'border-ligne text-emerald-600 hover:border-emerald-500'
                            }`}
                          >
                            {u.est_actif ? 'Désactiver' : 'Réactiver'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
