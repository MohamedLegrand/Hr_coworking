import { useEffect } from 'react'
import {
  useNotifications,
  useMarquerNotificationLue,
  useMarquerToutNotifications,
  useSupprimerNotification,
  useViderNotifications,
} from '../../hooks/useNotifications'
import { useToast } from '../../contexte/ToastContext'
import AlerteErreur from '../../composants/communs/AlerteErreur'
import { Croix } from '../../composants/communs/Icones'
import { getErrorMessage, getErrorTitle } from '../../utilitaires/erreurs'

const LIBELLES_TYPE = {
  confirmation: '✅ Confirmation',
  annulation: '❌ Annulation',
  rappel: '🔐 Rappel',
  reservation_creee: '🗓️ Réservation',
  paiement_recu: '💰 Paiement',
}

/**
 * Page dédiée aux notifications — seul endroit où le contenu complet du
 * message est visible (la cloche du header n'affiche que les titres).
 * Réutilisée telle quelle pour l'espace membre (/notifications) et l'espace
 * admin (/administration/notifications) : chaque compte ne voit que ses
 * propres notifications.
 */
export default function PageNotifications() {
  const { data: notifications = [], isLoading, error } = useNotifications(false)
  const marquerLue = useMarquerNotificationLue()
  const marquerTout = useMarquerToutNotifications()
  const supprimer = useSupprimerNotification()
  const vider = useViderNotifications()
  const { error: toastError } = useToast()

  useEffect(() => {
    if (error) toastError(getErrorTitle(error), getErrorMessage(error))
  }, [error, toastError])

  const nonLues = notifications.filter((n) => !n.est_lu).length

  return (
    <div className="pb-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet">Notifications</p>
          <h1 className="mt-3 font-titre text-[clamp(24px,3vw,34px)] font-bold tracking-tight text-encre">
            Toutes vos notifications
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ardoise">
            {nonLues > 0
              ? `${nonLues} notification${nonLues > 1 ? 's' : ''} non lue${nonLues > 1 ? 's' : ''}.`
              : 'Vous êtes à jour.'}
          </p>
        </div>
        <div className="flex flex-none gap-2">
          {nonLues > 0 && (
            <button
              type="button"
              onClick={() => marquerTout.mutate()}
              className="rounded-md border border-ligne bg-white px-4 py-2.5 text-sm font-semibold text-encre transition hover:border-violet hover:text-violet"
            >
              Tout marquer lu
            </button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={() => window.confirm('Supprimer toutes les notifications ?') && vider.mutate()}
              className="rounded-md border border-ligne bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:border-red-400 hover:bg-red-50"
            >
              Tout supprimer
            </button>
          )}
        </div>
      </div>

      {error && <div className="mb-6"><AlerteErreur erreur={error} /></div>}

      <div className="space-y-3">
        {isLoading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-lavande" />)
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-ligne bg-white p-10 text-center text-sm text-ardoise">
            Aucune notification pour l'instant.
          </div>
        ) : (
          notifications.map((n) => (
            <article
              key={n.id}
              onClick={() => !n.est_lu && marquerLue.mutate(n.id)}
              className={`flex items-start justify-between gap-4 rounded-2xl border p-5 shadow-sm transition ${
                n.est_lu ? 'border-ligne bg-white' : 'border-violet/40 bg-lavande/40'
              }`}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-violet">
                    {LIBELLES_TYPE[n.type] || n.type}
                  </span>
                  {!n.est_lu && (
                    <span className="h-1.5 w-1.5 flex-none rounded-full bg-rose-500" />
                  )}
                </div>
                <p className="mt-1.5 font-titre text-[15px] font-semibold text-encre">{n.titre}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ardoise">{n.contenu}</p>
                <p className="mt-2 text-[11.5px] text-ardoise">
                  {new Date(n.date_envoi).toLocaleString('fr-FR')}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  supprimer.mutate(n.id)
                }}
                aria-label="Supprimer"
                className="grid h-8 w-8 flex-none place-items-center rounded-lg border border-ligne text-ardoise transition hover:border-red-400 hover:text-red-600"
              >
                <Croix width={14} height={14} />
              </button>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
