import { Link } from 'react-router-dom'
import { useStatistiquesAdmin } from '../../hooks/useUtilisateurs'
import { useEspacesAdmin } from '../../hooks/useEspaces'
import { useEspacesOccupesMaintenant } from '../../hooks/useReservations'
import AlerteErreur from '../../composants/communs/AlerteErreur'
import ImageEspace from '../../composants/communs/ImageEspace'
import { Bureau, Personne, Calendrier, CartePaiement, Fleche } from '../../composants/communs/Icones'
import { formatFcfa, formatPeriodeReservee } from '../../utilitaires/format'

function StatCard({ titre, valeur, description, icon, lien }) {
  return (
    <Link
      to={lien}
      className="group rounded-2xl border border-ligne bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-violet/40"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-ardoise">{titre}</p>
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lavande text-violet transition group-hover:bg-violet group-hover:text-white">
          {icon}
        </span>
      </div>
      <p className="text-[2rem] font-titre font-bold tracking-tight text-encre">{valeur}</p>
      {description && <p className="mt-3 text-sm leading-relaxed text-ardoise">{description}</p>}
    </Link>
  )
}

export default function PageAdminAccueil() {
  const { data: stats, isLoading, error } = useStatistiquesAdmin()
  const { data: espaces = [], isLoading: espacesLoading } = useEspacesAdmin()
  const { data: occupesMaintenant = [] } = useEspacesOccupesMaintenant()

  return (
    <div className="pb-16">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet">Administration</p>
        <h1 className="mt-3 font-titre text-[clamp(24px,3vw,34px)] font-bold tracking-tight text-encre">
          Vue d'ensemble
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ardoise">
          Pilotez les bureaux, les comptes membres, les réservations et les paiements de HR-COWORKING.
        </p>
      </div>

      {error && <div className="mb-6"><AlerteErreur erreur={error} /></div>}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          titre="Utilisateurs"
          valeur={isLoading ? '…' : stats.total_utilisateurs}
          description={
            isLoading
              ? ''
              : `${stats.total_freelances} freelance${stats.total_freelances > 1 ? 's' : ''} · ${stats.total_entreprises} entreprise${stats.total_entreprises > 1 ? 's' : ''} · ${stats.documents_en_attente} document${stats.documents_en_attente > 1 ? 's' : ''} en attente.`
          }
          icon={<Personne width={18} height={18} />}
          lien="/administration/utilisateurs"
        />
        <StatCard
          titre="Bureaux"
          valeur={isLoading ? '…' : stats.total_espaces}
          description={isLoading ? '' : `${stats.espaces_actifs} actuellement disponible${stats.espaces_actifs > 1 ? 's' : ''}.`}
          icon={<Bureau width={18} height={18} />}
          lien="/administration/espaces"
        />
        <StatCard
          titre="Réservations"
          valeur={isLoading ? '…' : stats.total_reservations}
          description={
            isLoading
              ? ''
              : `${stats.reservations_en_attente} en attente · ${stats.reservations_confirmees} confirmées · ${stats.reservations_annulees} annulées.`
          }
          icon={<Calendrier width={18} height={18} />}
          lien="/administration/reservations"
        />
        <StatCard
          titre="Revenu encaissé"
          valeur={isLoading ? '…' : formatFcfa(stats.revenus_total)}
          description={isLoading ? '' : `${stats.total_paiements_success} paiement${stats.total_paiements_success > 1 ? 's' : ''} réussi${stats.total_paiements_success > 1 ? 's' : ''}.`}
          icon={<CartePaiement width={18} height={18} />}
          lien="/administration/paiements"
        />
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-titre text-lg font-semibold tracking-tight text-encre">Bureaux</h2>
          <Link to="/administration/espaces" className="text-[13px] font-semibold text-violet hover:text-violet-fonce">
            Gérer les bureaux →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {espacesLoading ? (
            [1, 2, 3, 4].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-lavande" />)
          ) : (
            espaces.map((espace) => {
              const occupation = occupesMaintenant.find((o) => o.espace_id === espace.id)
              return (
                <div key={espace.id} className="flex items-start gap-3 rounded-2xl border border-ligne bg-white p-3">
                  <div className="h-14 w-14 flex-none overflow-hidden rounded-xl bg-lavande">
                    <ImageEspace espace={espace} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold text-encre">{espace.nom}</p>
                    <span
                      className={`mt-1 inline-block rounded-full px-2.5 py-1 text-[10.5px] font-bold ${
                        !espace.est_disponible
                          ? 'bg-red-100 text-red-700'
                          : occupation
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {!espace.est_disponible ? 'Indisponible' : occupation ? 'Occupé' : 'Disponible'}
                    </span>
                    {occupation && (
                      <p className="mt-1.5 text-[11px] leading-snug text-amber-700">
                        {formatPeriodeReservee(occupation.date_debut, occupation.date_fin)}
                      </p>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {[
          { titre: 'Gérer les bureaux', desc: 'Créer, modifier, retirer ou basculer la disponibilité des espaces.', lien: '/administration/espaces' },
          { titre: 'Gérer les utilisateurs', desc: 'Valider les documents, activer ou désactiver les comptes.', lien: '/administration/utilisateurs' },
          { titre: 'Suivre les réservations', desc: 'Consulter les réservations de tous les membres et leur statut.', lien: '/administration/reservations' },
          { titre: 'Suivre les paiements', desc: 'Consulter les paiements Mobile Money reçus et leur statut.', lien: '/administration/paiements' },
        ].map((raccourci) => (
          <Link
            key={raccourci.lien}
            to={raccourci.lien}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-ligne bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-violet/40"
          >
            <div>
              <p className="font-titre text-[16px] font-semibold text-encre">{raccourci.titre}</p>
              <p className="mt-1.5 text-sm text-ardoise">{raccourci.desc}</p>
            </div>
            <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-lavande text-violet transition group-hover:bg-violet group-hover:text-white">
              <Fleche width={15} height={15} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
