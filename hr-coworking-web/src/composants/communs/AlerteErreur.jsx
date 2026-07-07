/**
 * Affiche un message d'erreur API en rouge.
 */
export default function AlerteErreur({ erreur }) {
  if (!erreur) return null

  const message =
    erreur?.response?.data?.detail ||
    erreur?.message ||
    'Une erreur est survenue. Veuillez réessayer.'

  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3.5">
      <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-red-500 text-white">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </span>
      <p className="text-[13.5px] font-medium leading-snug text-red-700">{message}</p>
    </div>
  )
}
