import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  useNotifications,
  useMarquerNotificationLue,
  useMarquerToutNotifications,
} from '../../hooks/useNotifications'
import { Cloche } from './Icones'

/**
 * Cloche de notifications réutilisée par l'espace membre et l'espace admin.
 * N'affiche que le titre de chaque notification (jamais le contenu complet) ;
 * cliquer dessus la marque comme lue et redirige vers la page dédiée
 * (`lien`), seul endroit où le contenu complet est visible.
 */
export default function ClocheNotifications({ lien }) {
  const [ouvert, setOuvert] = useState(false)
  const { data: notifications = [] } = useNotifications(true)
  const marquerLue = useMarquerNotificationLue()
  const marquerTout = useMarquerToutNotifications()
  const navigate = useNavigate()
  const nonLues = notifications.length

  const ouvrirNotification = (notification) => {
    setOuvert(false)
    marquerLue.mutate(notification.id)
    navigate(lien)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-label="Notifications"
        className="relative grid h-11 w-11 place-items-center rounded-full border border-ligne bg-white text-encre transition hover:border-violet hover:text-violet"
      >
        <Cloche width={18} height={18} />
        {nonLues > 0 && (
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
        )}
      </button>

      {ouvert && (
        <div className="absolute right-0 top-[54px] z-40 w-[320px] overflow-hidden rounded-2xl border border-ligne bg-white shadow-2xl animate-glisser-haut">
          <div className="flex items-center justify-between border-b border-ligne px-4 py-3.5">
            <span className="font-titre text-sm font-semibold">Notifications</span>
            {nonLues > 0 && (
              <button
                type="button"
                onClick={() => marquerTout.mutate()}
                className="text-xs font-semibold text-violet hover:text-violet-fonce"
              >
                Tout marquer lu
              </button>
            )}
          </div>
          <div className="max-h-[280px] overflow-y-auto">
            {nonLues === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-ardoise">Aucune notification non lue.</p>
            ) : (
              notifications.slice(0, 6).map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => ouvrirNotification(n)}
                  className="flex w-full gap-2.5 border-b border-ligne px-4 py-3 text-left transition hover:bg-lavande/50 last:border-0"
                >
                  <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-violet" />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold leading-snug text-encre">{n.titre}</p>
                    <p className="mt-1 text-[11px] text-ardoise">
                      {new Date(n.date_envoi).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
          <Link
            to={lien}
            onClick={() => setOuvert(false)}
            className="block border-t border-ligne px-4 py-3 text-center text-[12.5px] font-semibold text-violet hover:bg-lavande/50"
          >
            Voir toutes les notifications
          </Link>
        </div>
      )}
    </div>
  )
}
