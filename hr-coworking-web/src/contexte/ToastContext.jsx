import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((type, title, message, duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, type, title, message, duration }])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const value = useMemo(
    () => ({ toasts, addToast, removeToast }),
    [toasts, addToast, removeToast]
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

/**
 * Hook pour utiliser les toasts n'importe où dans l'app.
 * Retourne: toast.success(title, message), toast.error(...), etc.
 *
 * success/error/warning/info gardent la même référence entre les rendus
 * (mémoïsées via addToast, lui-même stable). On peut donc les mettre dans
 * un tableau de dépendances de useEffect sans provoquer de ré-exécutions
 * à chaque rendu — c'était la cause des toasts dupliqués (l'objet complet
 * `toast` changeait de référence à chaque rendu et redéclenchait les effets).
 */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast doit être utilisé avec ToastProvider')
  }

  const { addToast, removeToast, toasts } = context

  const actions = useMemo(
    () => ({
      success: (title, message, duration) => addToast('success', title, message, duration),
      error: (title, message, duration) => addToast('error', title, message, duration),
      warning: (title, message, duration) => addToast('warning', title, message, duration),
      info: (title, message, duration) => addToast('info', title, message, duration),
    }),
    [addToast]
  )

  return { ...actions, toasts, removeToast }
}
