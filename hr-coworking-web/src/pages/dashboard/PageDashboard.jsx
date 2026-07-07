import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useEspaces } from '../../hooks/useEspaces'
import { useProfilComplet } from '../../hooks/useUtilisateurs'
import { useMesReservations, useCreerReservation } from '../../hooks/useReservations'
import { useNotifications } from '../../hooks/useNotifications'
import { usePaiements } from '../../hooks/usePaiements'
import useAuthStore from '../../contexte/authStore'
import { useToast } from '../../contexte/ToastContext'
import { GuideOnboarding } from '../../composants/communs/GuideOnboarding'
import ImageEspace from '../../composants/communs/ImageEspace'
import AlerteSucces from '../../composants/communs/AlerteSucces'
import AlerteErreur from '../../composants/communs/AlerteErreur'
import {
  Cloche,
  Fleche,
  Check,
  Lieu,
  Wifi,
  Plus,
  Croix,
  Calendrier,
} from '../../composants/communs/Icones'
import { formatFcfa, libelleType, prixAffichage, FILTRES_TYPE } from '../../utilitaires/format'
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

function demainISO() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

export default function PageDashboard() {
  const utilisateur = useAuthStore((s) => s.utilisateur)
  const { success: toastSuccess, error: toastError } = useToast()
  const navigate = useNavigate()

  const { data: profil, isLoading: profilLoading, error: profilErreur } = useProfilComplet()
  const { data: reservations = [], isLoading: reservationsLoading, error: reservationsErreur } = useMesReservations()
  const { data: notifications = [], isLoading: notificationsLoading, error: notificationsErreur } = useNotifications(true)
  const { data: espaces = [], isLoading: espacesLoading, error: espacesErreur } = useEspaces()
  const { data: paiements = [], isLoading: paiementsLoading, error: paiementsErreur } = usePaiements()
  const creerReservation = useCreerReservation()

  const [typeActif, setTypeActif] = useState(null)
  const [panier, setPanier] = useState([]) // { id, espaceId, dateDebut, quantite }

  const anyError = profilErreur || reservationsErreur || notificationsErreur || espacesErreur || paiementsErreur

  // Afficher les erreurs en toast
  useEffect(() => {
    if (anyError) {
      toastError(getErrorTitle(anyError), getErrorMessage(anyError))
    }
  }, [anyError, toastError])

  // Afficher les erreurs de réservation
  useEffect(() => {
    if (creerReservation.isError) {
      toastError(getErrorTitle(creerReservation.error), getErrorMessage(creerReservation.error))
    }
  }, [creerReservation.isError, creerReservation.error, toastError])

  const espaceParId = useMemo(() => Object.fromEntries((espaces || []).map((e) => [e.id, e])), [espaces])

  const espacesFiltres = useMemo(() => {
    const dispo = (espaces || []).filter((e) => e.est_disponible)
    return typeActif ? dispo.filter((e) => e.type_espace === typeActif) : dispo
  }, [espaces, typeActif])

  const reservationsRecentes = useMemo(() => {
    return [...(reservations || [])]
      .sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation))
      .slice(0, 3)
  }, [reservations])

  const actifs = useMemo(
    () => (reservations || []).filter((r) => r.statut === 'confirmee').length,
    [reservations],
  )
  const notificationsNonLues = notifications?.length ?? 0
  const dernierPaiement = (paiements || [])[0]

  const ajouterAuPanier = (espace) => {
    setPanier((p) => [
      ...p,
      { id: crypto.randomUUID(), espaceId: espace.id, dateDebut: demainISO(), quantite: 1 },
    ])
  }
  const retirerDuPanier = (id) => setPanier((p) => p.filter((l) => l.id !== id))
  const modifierLigne = (id, patch) => setPanier((p) => p.map((l) => (l.id === id ? { ...l, ...patch } : l)))

  const lignesPanier = useMemo(() => {
    return panier
      .map((ligne) => {
        const espace = espaceParId[ligne.espaceId]
        if (!espace) return null
        const { montant, unite } = prixAffichage(espace)
        const prixUnitaire = montant || 0
        return { ...ligne, espace, prixUnitaire, unite, total: prixUnitaire * ligne.quantite }
      })
      .filter(Boolean)
  }, [panier, espaceParId])

  const sousTotal = lignesPanier.reduce((s, l) => s + l.total, 0)

  const validerPanier = () => {
    const details = lignesPanier.map((l) => {
      const debut = new Date(`${l.dateDebut}T09:00:00`)
      const fin = new Date(debut)
      if (l.unite === 'heure') fin.setHours(fin.getHours() + l.quantite)
      else fin.setDate(fin.getDate() + l.quantite)
      return { espace_id: l.espace.id, date_debut: debut.toISOString(), date_fin: fin.toISOString() }
    })
    creerReservation.mutate(details, {
      onSuccess: (reservationCreee) => {
        setPanier([])
        navigate(`/paiements?reservation=${reservationCreee.id}`)
      },
    })
  }

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
          <a
            href="#catalogue"
            className="inline-flex flex-none items-center gap-2 self-start rounded-md bg-violet px-6 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-violet-fonce"
          >
            Réserver un espace
            <Fleche width={16} height={16} />
          </a>
        </div>
      </div>

      {/* STATS */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          titre="Réservations actives"
          valeur={reservationsLoading ? '…' : actifs}
          description="Espaces réservés et confirmés."
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
          {/* CATÉGORIES + ESPACES POPULAIRES */}
          <div id="catalogue" className="scroll-mt-8 rounded-2xl border border-ligne bg-white p-8 shadow-sm">
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

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {espacesLoading ? (
                [1, 2].map((i) => <div key={i} className="h-40 rounded-2xl bg-lavande" />)
              ) : espacesFiltres.length === 0 ? (
                <div className="rounded-2xl border border-ligne bg-slate-50 p-8 text-center text-sm text-slate-600 sm:col-span-2">
                  Aucun espace disponible pour ce filtre.
                </div>
              ) : (
                espacesFiltres.map((espace) => (
                  <div key={espace.id} className="overflow-hidden rounded-2xl border border-ligne">
                    <div className="relative h-32">
                      <ImageEspace espace={espace} className="h-full w-full object-cover" />
                      <span className="absolute left-3 top-3 rounded-full bg-violet/90 px-3 py-1 text-[10.5px] font-bold text-white">
                        {libelleType(espace.type_espace)}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-titre text-[15px] font-semibold text-encre">{espace.nom}</p>
                        <button
                          type="button"
                          onClick={() => ajouterAuPanier(espace)}
                          aria-label={`Ajouter ${espace.nom} au récapitulatif`}
                          className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-violet text-white shadow transition hover:-translate-y-0.5 hover:bg-violet-fonce"
                        >
                          <Plus width={16} height={16} />
                        </button>
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-ardoise">
                        <Lieu width={13} height={13} />
                        {espace.localisation || 'Yaoundé'}
                      </div>
                      <div className="mt-3">
                        <span className="font-titre text-[17px] font-bold text-violet">
                          {formatFcfa(prixAffichage(espace).montant)}
                        </span>
                        <span className="text-[11.5px] text-ardoise"> /{prixAffichage(espace).unite}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

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
          {/* RÉCAPITULATIF / PANIER */}
          <div className="rounded-2xl border border-ligne bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-titre text-lg font-semibold text-encre">Récapitulatif</span>
              <span className="text-xs text-ardoise">{lignesPanier.length} espace{lignesPanier.length > 1 ? 's' : ''}</span>
            </div>

            {creerReservation.isSuccess && (
              <div className="mt-4"><AlerteSucces message="Réservation créée avec succès." /></div>
            )}
            {creerReservation.isError && (
              <div className="mt-4"><AlerteErreur erreur={creerReservation.error} /></div>
            )}

            {lignesPanier.length === 0 ? (
              <p className="mt-6 rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-600">
                Ajoutez un espace avec le bouton +.
              </p>
            ) : (
              <div className="mt-5 space-y-4">
                {lignesPanier.map((ligne) => (
                  <div key={ligne.id} className="rounded-2xl border border-ligne p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-encre">{ligne.espace.nom}</p>
                        <p className="mt-0.5 text-xs text-ardoise">{libelleType(ligne.espace.type_espace)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => retirerDuPanier(ligne.id)}
                        aria-label="Retirer"
                        className="grid h-7 w-7 flex-none place-items-center rounded-lg bg-lavande text-violet"
                      >
                        <Croix width={13} height={13} />
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <input
                        type="date"
                        value={ligne.dateDebut}
                        min={demainISO()}
                        onChange={(e) => modifierLigne(ligne.id, { dateDebut: e.target.value })}
                        className="rounded-lg border border-ligne px-2 py-1.5 text-xs text-encre outline-none focus:border-violet"
                      />
                      <div className="flex items-center gap-1.5 rounded-lg border border-ligne px-2 py-1">
                        <button
                          type="button"
                          onClick={() => modifierLigne(ligne.id, { quantite: Math.max(1, ligne.quantite - 1) })}
                          className="grid h-5 w-5 place-items-center text-violet"
                        >
                          −
                        </button>
                        <span className="w-14 text-center text-xs font-semibold">
                          {ligne.quantite} {ligne.unite === 'heure' ? 'h' : 'j'}
                        </span>
                        <button
                          type="button"
                          onClick={() => modifierLigne(ligne.id, { quantite: ligne.quantite + 1 })}
                          className="grid h-5 w-5 place-items-center text-violet"
                        >
                          +
                        </button>
                      </div>
                      <span className="ml-auto text-sm font-bold text-violet">{formatFcfa(ligne.total)}</span>
                    </div>
                  </div>
                ))}

                <div className="border-t border-dashed border-ligne pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-titre text-base font-semibold text-encre">Total</span>
                    <span className="font-titre text-xl font-bold text-violet">{formatFcfa(sousTotal)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={validerPanier}
                  disabled={creerReservation.isPending}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-violet to-violet-fonce px-5 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creerReservation.isPending ? 'Envoi…' : 'Valider ma réservation'}
                  <Fleche width={16} height={16} />
                </button>
              </div>
            )}
          </div>

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
                  <div key={n.id} className="rounded-2xl bg-slate-50 p-3.5">
                    <p className="text-sm leading-relaxed text-encre">{n.contenu}</p>
                    <p className="mt-1.5 text-xs text-slate-400">{new Date(n.date_envoi).toLocaleDateString('fr-FR')}</p>
                  </div>
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
            description: 'Explorez nos bureaux disponibles, filtrez par type et sélectionnez ceux qui vous intéressent.',
            x: 50,
            y: 40,
          },
          {
            id: 'dashboard_panier',
            titre: '🛒 Vérifier votre sélection',
            description: 'Consultez les espaces choisis et valider votre réservation. Le paiement se fera ensuite.',
            x: 50,
            y: 75,
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
