/**
 * Affiche un message de succès en vert.
 */
export default function AlerteSucces({ message }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3.5">
      <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-green-500 text-white">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      <p className="text-[13.5px] font-medium leading-snug text-green-700">{message}</p>
    </div>
  )
}
