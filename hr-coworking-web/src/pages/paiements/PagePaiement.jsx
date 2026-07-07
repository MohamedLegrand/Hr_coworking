import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMesReservations, useReservation } from '../../hooks/useReservations'
import { useEspaces } from '../../hooks/useEspaces'
import { useInitierPaiement } from '../../hooks/usePaiements'
import { useToast } from '../../contexte/ToastContext'
import useAuthStore from '../../contexte/authStore'
import { Telephone, CartePaiement, Check, Fleche, Calendrier } from '../../composants/communs/Icones'
import { formatFcfa } from '../../utilitaires/format'
import { getErrorMessage, getErrorTitle } from '../../utilitaires/erreurs'

const METHODES = [
  {
    id: 'ORANGE',
    nom: 'Orange Money',
    description: 'Paiement via votre compte Orange Money.',
    logo: '🟠',
    actif: 'border-orange-500 bg-orange-50',
    bandeau: 'bg-orange-500',
    bouton: 'bg-orange-500 hover:bg-orange-600',
    placeholder: '690 000 000',
  },
  {
    id: 'MTN',
    nom: 'MTN Mobile Money',
    description: 'Paiement via votre compte MTN MoMo.',
    logo: '🟡',
    actif: 'border-yellow-500 bg-yellow-50',
    bandeau: 'bg-yellow-400',
    bouton: 'bg-yellow-400 hover:bg-yellow-500 text-encre',
    placeholder: '670 000 000',
  },
  {
    id: 'CARTE',
    nom: 'Carte bancaire',
    description: 'Visa, Mastercard — paiement sécurisé.',
    logo: '💳',
    actif: 'border-violet bg-lavande',
    bandeau: 'bg-violet',
    bouton: 'bg-violet hover:bg-violet-fonce',
    placeholder: null,
  },
]

export default function PagePaiement() {
  const [searchParams] = useSearchParams()
  const reservationId = searchParams.get('reservation')

  const estAdmin = useAuthStore((s) => s.utilisateur?.role === 'admin')
  const cheminPaiement = estAdmin ? '/administration/checkout' : '/paiements'
  const cheminRetour = estAdmin ? '/administration/espaces' : '/reservations'
  const libelleRetour = estAdmin ? 'Retour aux bureaux' : 'Voir mes réservations'

  const { data: reservation, isLoading: reservationLoading, isError: reservationErreur } = useReservation(reservationId)
  const { data: reservations = [] } = useMesReservations()
  const { data: espaces = [] } = useEspaces()
  const initierPaiement = useInitierPaiement()
  const { success: toastSuccess, error: toastError } = useToast()

  const [methode, setMethode] = useState('ORANGE')
  const [numeroTelephone, setNumeroTelephone] = useState('')
  const [erreurNumero, setErreurNumero] = useState('')
  const [paiementConfirme, setPaiementConfirme] = useState(null)

  const espaceParId = useMemo(() => Object.fromEntries((espaces || []).map((e) => [e.id, e])), [espaces])
  const reservationsEnAttente = useMemo(
    () => reservations.filter((r) => r.statut === 'en_attente'),
    [reservations]
  )

  const config = METHODES.find((m) => m.id === methode)

  const onSubmit = (e) => {
    e.preventDefault()
    setErreurNumero('')

    if (methode !== 'CARTE' && !/^[0-9]{9}$/.test(numeroTelephone)) {
      setErreurNumero('Entrez un numéro valide à 9 chiffres.')
      return
    }

    initierPaiement.mutate(
      {
        reservation_id: reservationId,
        operateur: methode,
        numero_telephone: methode === 'CARTE' ? undefined : numeroTelephone,
        description: `Paiement réservation #${reservationId.slice(0, 8)}`,
      },
      {
        onSuccess: (data) => {
          setPaiementConfirme(data)
          toastSuccess('✅ Paiement initié', `Référence ${data.reference} — en attente de confirmation.`)
        },
        onError: (err) => toastError(getErrorTitle(err), getErrorMessage(err)),
      }
    )
  }

  return (
    <div className="pb-16">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet">Paiement</p>
        <h1 className="mt-3 font-titre text-[clamp(24px,3vw,34px)] font-bold tracking-tight text-encre">
          Finaliser votre paiement
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ardoise">
          Choisissez votre moyen de paiement préféré pour confirmer votre réservation.
        </p>
      </div>

      {/* Aucune réservation sélectionnée */}
      {!reservationId && (
        <div className="rounded-2xl border border-ligne bg-white p-8">
          <h2 className="font-titre text-lg font-semibold text-encre">Sélectionnez une réservation à payer</h2>
          {reservationsEnAttente.length === 0 ? (
            <p className="mt-4 text-sm text-ardoise">
              Vous n'avez aucune réservation en attente de paiement.{' '}
              <Link to={cheminRetour} className="font-semibold text-violet hover:text-violet-fonce">
                {libelleRetour}
              </Link>
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {reservationsEnAttente.map((r) => {
                const premierEspace = espaceParId[r.details?.[0]?.espace_id]
                return (
                  <Link
                    key={r.id}
                    to={`${cheminPaiement}?reservation=${r.id}`}
                    className="flex items-center justify-between rounded-xl border border-ligne p-4 transition hover:border-violet hover:bg-lavande"
                  >
                    <div>
                      <p className="text-sm font-semibold text-encre">{premierEspace?.nom || 'Espace'}</p>
                      <p className="text-xs text-ardoise">Réservation #{r.id.slice(0, 8)}</p>
                    </div>
                    <span className="font-titre text-base font-bold text-violet">{formatFcfa(r.prix_total)}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Réservation introuvable / erreur */}
      {reservationId && !reservationLoading && (reservationErreur || !reservation) && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          Impossible de charger cette réservation.
        </div>
      )}

      {/* Réservation déjà payée */}
      {reservationId && reservation && reservation.statut === 'confirmee' && !paiementConfirme && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <Check className="mx-auto text-emerald-600" width={28} height={28} />
          <p className="mt-3 text-sm font-semibold text-emerald-700">Cette réservation est déjà confirmée et payée.</p>
          <Link to={cheminRetour} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-violet hover:text-violet-fonce">
            {libelleRetour} <Fleche width={14} height={14} />
          </Link>
        </div>
      )}

      {/* Confirmation post-initiation */}
      {paiementConfirme && (
        <div className="rounded-2xl border border-ligne bg-white p-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-lavande text-violet">
            <Check width={26} height={26} />
          </span>
          <h2 className="mt-4 font-titre text-xl font-bold text-encre">Paiement initié</h2>
          <p className="mt-2 text-sm text-ardoise">
            Référence <span className="font-semibold text-encre">{paiementConfirme.reference}</span> — {formatFcfa(paiementConfirme.montant)}
          </p>
          <p className="mt-1 text-xs text-ardoise">
            Votre réservation sera confirmée dès validation du paiement par {config.nom}.
          </p>
          <Link
            to={cheminRetour}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-violet px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-fonce"
          >
            {libelleRetour}
            <Fleche width={15} height={15} />
          </Link>
        </div>
      )}

      {/* Formulaire de paiement */}
      {reservationId && reservation && reservation.statut === 'en_attente' && !paiementConfirme && (
        <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          {/* Récapitulatif */}
          <aside className="h-fit rounded-2xl border border-ligne bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet">Récapitulatif</p>
            <div className="mt-4 space-y-3">
              {(reservation.details || []).map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2 text-ardoise">
                    <Calendrier width={14} height={14} />
                    {espaceParId[d.espace_id]?.nom || 'Espace'}
                  </div>
                  <span className="font-semibold text-encre">{formatFcfa(d.prix)}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-dashed border-ligne pt-4">
              <span className="font-titre text-base font-semibold text-encre">Total</span>
              <span className="font-titre text-xl font-bold text-violet">{formatFcfa(reservation.prix_total)}</span>
            </div>
          </aside>

          {/* Sélection du moyen de paiement — un dashboard distinct par méthode */}
          <section className="rounded-2xl border border-ligne bg-white p-6">
            <div className="grid grid-cols-3 gap-3">
              {METHODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMethode(m.id)
                    setErreurNumero('')
                  }}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 text-center transition-all ${
                    methode === m.id ? m.actif : 'border-ligne bg-white hover:border-violet/40'
                  }`}
                >
                  <span className="text-2xl">{m.logo}</span>
                  <span className="text-[12.5px] font-semibold text-encre">{m.nom}</span>
                </button>
              ))}
            </div>

            {/* Dashboard du moyen de paiement sélectionné */}
            <form onSubmit={onSubmit} className="mt-6 overflow-hidden rounded-xl border border-ligne">
              <div className={`h-1.5 w-full ${config.bandeau}`} />
              <div className="p-6">
                <p className="text-[15px] font-semibold text-encre">{config.nom}</p>
                <p className="mt-1 text-[13px] text-ardoise">{config.description}</p>

                {config.id !== 'CARTE' ? (
                  <div className="mt-5 flex flex-col gap-1.5">
                    <label htmlFor="numero_telephone" className="text-[13.5px] font-semibold text-encre">
                      Numéro {config.nom}
                    </label>
                    <div className="flex items-center gap-2 rounded-lg border border-ligne px-3 py-2.5 focus-within:border-violet">
                      <Telephone width={16} height={16} className="text-ardoise" />
                      <input
                        id="numero_telephone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={9}
                        placeholder={config.placeholder}
                        value={numeroTelephone}
                        onChange={(e) => setNumeroTelephone(e.target.value.replace(/\D/g, ''))}
                        className="w-full border-none bg-transparent text-sm outline-none"
                      />
                    </div>
                    {erreurNumero && <span className="text-xs font-medium text-red-600">{erreurNumero}</span>}
                  </div>
                ) : (
                  <div className="mt-5 flex items-center gap-3 rounded-lg bg-lavande p-4">
                    <CartePaiement width={22} height={22} className="flex-none text-violet" />
                    <p className="text-[13px] text-ardoise">
                      Vous serez redirigé vers la page de paiement sécurisée par carte bancaire.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={initierPaiement.isPending}
                  className={`mt-6 flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-[15px] font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-60 ${config.bouton}`}
                >
                  {initierPaiement.isPending ? 'Traitement…' : `Payer ${formatFcfa(reservation.prix_total)}`}
                  <Fleche width={16} height={16} />
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
