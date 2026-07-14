import { useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useEspaces } from '../../hooks/useEspaces'
import { useProfilComplet } from '../../hooks/useUtilisateurs'
import { useMesReservations } from '../../hooks/useReservations'
import { useNotifications, useMarquerNotificationLue } from '../../hooks/useNotifications'
import { usePaiements } from '../../hooks/usePaiements'
import useAuthStore from '../../contexte/authStore'
import { useToast } from '../../contexte/ToastContext'
import { GuideOnboarding } from '../../composants/communs/GuideOnboarding'
import { libelleGamme } from '../../utilitaires/tarifs'
import {
  Cloche,
  Fleche,
  Check,
  Wifi,
  Calendrier,
} from '../../composants/communs/Icones'
import { formatFcfa } from '../../utilitaires/format'
import { getErrorMessage, getErrorTitle } from '../../utilitaires/erreurs'

function StatCard({ titre, valeur, description, icon }) {
  return (
    <div className="rounded-2xl border border-ligne bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-ardoise">{titre}</p>
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lavande text-violet">{icon}</span>
      </div>
      <p className="text-[2rem] font-titre font-bold tracking-tight text-encre">{valeur}</p>
      {description && <p className="mt-3 text-sm leading-relaxed text-ardoise">{description}</p>}
    </div>
  )
}

function BadgeStatut({ statut }) {
  const palette = {
    valide: 'bg-emerald-600 text-white',
    en_attente: 'bg-amber-500 text-white',
    invalide: 'bg-rose-600 text-white',
  }
  return (
    <span className={`inline-flex rounded-full px-3 py-1.5 text-[12px] font-semibold ${palette[statut] || 'bg-slate-400 text-white'}`}>
      {statut === 'valide' ? 'Validé' : statut === 'en_attente' ? 'En attente' : 'Refusé / invalide'}
    </span>
  )
}

function BadgeReservation({ statut }) {
  const palette = {
    confirmee: 'bg-emerald-600 text-white',
    en_attente: 'bg-amber-500 text-white',
    annulee: 'bg-slate-400 text-white',
  }
  const libelle = { confirmee: 'Confirmée', en_attente: 'En attente', annulee: 'Annulée' }
  return (
    <span className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${palette[statut] || 'bg-slate-400 text-white'}`}>
      {libelle[statut] || statut}
    </span>
  )
}

export default function PageDashboard() {
  const utilisateur = useAuthStore((s) => s.utilisateur)
  const { success: toastSuccess, error: toastError } = useToast()

  const { data: profil, isLoading: profilLoading, error: profilErreur } = useProfilComplet()
  const { data: reservations = [], isLoading: reservationsLoading, error: reservationsErreur } = useMesReservations()
  const { data: notifications = [], isLoading: notificationsLoading, error: notificationsErreur } = useNotifications(true)
  const { data: espaces = [], isLoading: espacesLoading, error: espacesErreur } = useEspaces()
  const { data: paiements = [], isLoading: paiementsLoading, error: paiementsErreur } = usePaiements()
  const marquerLue = useMarquerNotificationLue()

  const anyError = profilErreur || reservationsErreur || notificationsErreur || espacesErreur || paiementsErreur

  useEffect(() => {
    if (anyError) {
      toastError(getErrorTitle(anyError), getErrorMessage(anyError))
    }
  }, [anyError, toastError])

  const espaceParId = useMemo(() => Object.fromEntries((espaces || []).map((e) => [e.id, e])), [espaces])

  const espacesFiltres = useMemo(() => (espaces || []).filter((e) => e.est_disponible), [espaces])

  const reservationsRecentes = useMemo(() => {
    return [...(reservations || [])]
      .sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation))
      .slice(0, 3)
  }, [reservations])

  // "Active" = pas annulée : une réservation créée depuis le catalogue
  // compte dès sa création, même avant confirmation du paiement.
  const actifs = useMemo(
    () => (reservations || []).filter((r) => r.statut !== 'annulee').length,
    [reservations],
  )
  const notificationsNonLues = notifications?.length ?? 0
  const dernierPaiement = (paiements || [])[0]

  return (
    <div className="pb-16">
      {/* BANNIÈRE */}
      <div className="relative mb-8 overflow-hidden rounded-2xl shadow-sm">
        <img
          src="/images/hero/hero-section.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(15,10,25,.88)] via-[rgba(15,10,25,.68)] to-[rgba(15,10,25,.3)]" />
        <div className="relative flex flex-col gap-4 p-8 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">Tableau de bord</p>
            <h1 className="mt-3 max-w-2xl font-titre text-[clamp(26px,3.2vw,40px)] font-bold leading-tight">
              Bonjour {utilisateur?.prenom || 'cher membre'}, bienvenue sur votre espace.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80">
              Retrouvez vos prochaines réservations, l'état de votre compte et les espaces disponibles à réserver.
            </p>
          </div>
          <Link
            to="/espaces"
            className="inline-flex flex-none items-center gap-2 self-start rounded-md bg-violet px-6 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-violet-fonce"
          >
            Réserver un espace
            <Fleche width={16} height={16} />
          </Link>
        </div>
      </div>

      {/* STATS */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          titre="Réservations actives"
          valeur={reservationsLoading ? '…' : actifs}
          description="Bureaux réservés, en attente de paiement ou confirmés."
          icon={<Calendrier width={18} height={18} />}
        />
        <StatCard
          titre="Notifications à lire"
          valeur={notificationsLoading ? '…' : notificationsNonLues}
          description="Restez informé des confirmations et rappels."
          icon={<Cloche width={18} height={18} />}
        />
        <StatCard
          titre="Espaces disponibles"
          valeur={espacesLoading ? '…' : espacesFiltres.length}
          description="Bureaux, réunions et open spaces prêts à réserver."
          icon={<Wifi width={18} height={18} />}
        />
        <StatCard
          titre="Dernier paiement"
          valeur={paiementsLoading ? '…' : dernierPaiement ? formatFcfa(dernierPaiement.montant) : 'Aucun'}
          description="Suivez vos transactions en un coup d'œil."
          icon={<Check width={18} height={18} />}
        />
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[1.5fr_0.9fr]">
        {/* ===== COLONNE CENTRALE ===== */}
        <section className="space-y-8">
          {/* RÉSERVATIONS RÉCENTES */}
          <div className="rounded-2xl border border-ligne bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet">Historique</p>
                <h2 className="mt-2 text-2xl font-bold text-encre">Réservations récentes</h2>
              </div>
              <Link to="/reservations" className="text-sm font-semibold text-violet transition hover:text-violet-fonce">
                Voir toutes
              </Link>
            </div>

            <div className="mt-8 space-y-4">
              {reservationsLoading ? (
                [1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-lavande" />)
              ) : reservationsRecentes.length === 0 ? (
                <div className="rounded-2xl border border-ligne bg-slate-50 p-8 text-center text-sm text-slate-600">
                  Aucune réservation pour l'instant.
                </div>
              ) : (
                reservationsRecentes.map((reservation) => {
                  const premierEspace = espaceParId[reservation.details?.[0]?.espace_id]
                  return (
                    <article key={reservation.id} className="rounded-2xl border border-ligne p-5 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ardoise">
                            Réservation #{reservation.id.slice(0, 8)}
                          </p>
                          <p className="mt-2 text-lg font-bold text-encre">
                            {premierEspace?.nom || 'Espace'} • {formatFcfa(reservation.prix_total)}
                          </p>
                          <p className="mt-1 text-[12.5px] text-ardoise">
                            {libelleGamme(reservation.gamme)} · {reservation.forfait}
                          </p>
                        </div>
                        <BadgeReservation statut={reservation.statut} />
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
        </section>

        {/* ===== COLONNE LATÉRALE ===== */}
        <aside className="space-y-6">
          {/* STATUT DU COMPTE */}
          <div className="rounded-2xl border border-ligne bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet">Statut du compte</p>
            {profilLoading ? (
              <div className="mt-4 h-16 rounded-2xl bg-lavande" />
            ) : (
              <>
                <div className="mt-4"><BadgeStatut statut={profil?.document_statut} /></div>
                <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <p><span className="font-semibold text-encre">Nom :</span> {profil?.nom} {profil?.prenom}</p>
                  <p><span className="font-semibold text-encre">Entreprise :</span> {profil?.nom_entreprise || 'Non renseigné'}</p>
                  <p><span className="font-semibold text-encre">Téléphone :</span> {profil?.telephone || 'Non renseigné'}</p>
                </div>
              </>
            )}
          </div>

          {/* NOTIFICATIONS */}
          <div className="rounded-2xl border border-ligne bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet">Notifications</p>
              <Link to="/notifications" className="text-xs font-semibold text-violet hover:text-violet-fonce">Voir tout</Link>
            </div>
            <div className="mt-4 space-y-3">
              {notificationsLoading ? (
                <div className="h-16 rounded-2xl bg-lavande" />
              ) : notificationsNonLues === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Aucune notification non lue.</p>
              ) : (
                notifications.slice(0, 3).map((n) => (
                  <Link
                    key={n.id}
                    to="/notifications"
                    onClick={() => marquerLue.mutate(n.id)}
                    className="block rounded-2xl bg-slate-50 p-3.5 transition hover:bg-lavande"
                  >
                    <p className="text-sm font-semibold leading-relaxed text-encre">{n.titre}</p>
                    <p className="mt-1.5 text-xs text-slate-400">{new Date(n.date_envoi).toLocaleDateString('fr-FR')}</p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Guide d'onboarding pour les nouveaux utilisateurs */}
      <GuideOnboarding
        etapes={[
          {
            id: 'dashboard_intro',
            titre: '📊 Bienvenue sur votre dashboard',
            description: 'Ici, vous pouvez suivre vos réservations actives, vos notifications et votre solde de paiement.',
            x: 50,
            y: 15,
          },
          {
            id: 'dashboard_espaces',
            titre: '🏢 Réserver des espaces',
            description: 'Cliquez sur « Réserver un espace » pour accéder au catalogue : choisissez vos bureaux, votre forfait et votre date.',
            x: 50,
            y: 20,
          },
          {
            id: 'dashboard_account',
            titre: '👤 Gérer votre compte',
            description: 'Vérifiez votre statut de compte et maintenez vos informations à jour.',
            x: 85,
            y: 60,
          },
        ]}
        onTermine={() => {
          toastSuccess('✨ Guide terminé', 'Vous pouvez explorer librement maintenant !')
        }}
      />
    </div>
  )
}
