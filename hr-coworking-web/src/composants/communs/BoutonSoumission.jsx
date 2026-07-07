/**
 * Bouton de formulaire avec état de chargement.
 */
export default function BoutonSoumission({ libelle, libelleChargement, chargement, className = '' }) {
  return (
    <button
      type="submit"
      disabled={chargement}
      className={`flex w-full items-center justify-center gap-2.5 rounded-lg bg-violet px-6 py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-violet-fonce disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${className}`}
    >
      {chargement ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          {libelleChargement || 'Chargement…'}
        </>
      ) : (
        libelle
      )}
    </button>
  )
}
