import { useState, useEffect } from 'react'
import { Check, Attention, Croix, Info } from './Icones'

/**
 * Composant Toast - Notification temporaire en haut à droite
 * Types: 'success', 'error', 'warning', 'info'
 */
function ToastItem({ id, type, title, message, onClose, duration = 4000 }) {
  const [seFermant, setSeFermant] = useState(false)
  const fadeOutDuration = 300

  useEffect(() => {
    // Commencer la fermeture AVANT d'atteindre le timeout
    const timerFadeOut = setTimeout(() => setSeFermant(true), duration - fadeOutDuration)
    // Vraiment fermer après le fade out
    const timerClose = setTimeout(onClose, duration)
    return () => {
      clearTimeout(timerFadeOut)
      clearTimeout(timerClose)
    }
  }, [duration, onClose, fadeOutDuration])

  const config = {
    success: { bg: 'bg-emerald-50', border: 'border-emerald-200', title: 'Succès', icon: Check, iconColor: 'text-emerald-600' },
    error: { bg: 'bg-red-50', border: 'border-red-200', title: 'Erreur', icon: Attention, iconColor: 'text-red-600' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', title: 'Attention', icon: Attention, iconColor: 'text-amber-600' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', title: 'Information', icon: Info, iconColor: 'text-blue-600' },
  }

  const c = config[type] || config.info
  const Icon = c.icon

  return (
    <div
      className={`rounded-lg border ${c.bg} ${c.border} p-4 shadow-lg backdrop-blur-sm transition-all ${
        seFermant
          ? 'animate-out fade-out duration-300'
          : 'animate-in slide-in-from-right-full duration-300'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex gap-3">
        <div className={`mt-0.5 flex-none ${c.iconColor}`}>
          <Icon width={20} height={20} />
        </div>
        <div className="flex-1 min-w-0">
          {title && <p className={`text-[13px] font-semibold ${c.iconColor}`}>{title}</p>}
          {message && <p className="mt-1 text-[13px] leading-snug text-slate-700">{message}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-0.5 flex-none text-slate-400 hover:text-slate-600"
          aria-label="Fermer"
        >
          <Croix width={16} height={16} />
        </button>
      </div>
    </div>
  )
}

/**
 * Conteneur Toast - Se place en haut à droite
 */
export function ToastContainer({ toasts, removeToast }) {
  return (
    <div
      className="fixed top-4 right-4 z-[1000] space-y-3 pointer-events-auto"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

export default ToastItem
