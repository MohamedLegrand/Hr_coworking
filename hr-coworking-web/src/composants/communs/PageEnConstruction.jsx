export default function PageEnConstruction({ titre }) {
  return (
    <div className="rounded-2xl border border-ligne bg-white p-12 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet">Bientôt disponible</p>
      <h1 className="mt-3 font-titre text-2xl font-bold text-encre">{titre}</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ardoise">
        Cette section est en cours de construction. Revenez bientôt pour découvrir cette fonctionnalité.
      </p>
    </div>
  )
}
