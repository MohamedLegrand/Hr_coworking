import { Croix } from './Icones'

export default function Modale({ titre, onFermer, children }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-apparaitre">
      <div className="absolute inset-0 bg-encre/50 backdrop-blur-sm" onClick={onFermer} />

      <div className="relative max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-2xl border border-ligne bg-white p-6 shadow-2xl animate-glisser-haut sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="font-titre text-xl font-bold text-encre">{titre}</h2>
          <button
            type="button"
            onClick={onFermer}
            aria-label="Fermer"
            className="grid h-9 w-9 flex-none place-items-center rounded-full border border-ligne text-ardoise transition hover:border-violet hover:text-violet"
          >
            <Croix width={16} height={16} />
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}
