import { useRef, useState } from 'react'

/**
 * Zone d'upload de fichier avec aperçu du nom sélectionné.
 * Accepte PDF, JPG, JPEG, PNG (max 5 Mo).
 */
export default function ChampFichier({
  label,
  nom,
  description = '',
  onChange,
  erreur,
  obligatoire = false,
}) {
  const inputRef = useRef(null)
  const [nomFichier, setNomFichier] = useState(null)

  const handleChange = (e) => {
    const fichier = e.target.files?.[0] || null
    setNomFichier(fichier?.name || null)
    onChange?.(fichier)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={nom} className="text-[13.5px] font-semibold text-encre">
        {label}
        {obligatoire && <span className="ml-1 text-violet">*</span>}
      </label>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors hover:border-violet hover:bg-lavande ${
          erreur ? 'border-red-400 bg-red-50' : 'border-ligne bg-white'
        } ${nomFichier ? 'border-violet bg-lavande' : ''}`}
      >
        {nomFichier ? (
          <>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-violet text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <span className="max-w-[240px] truncate text-[13px] font-semibold text-violet">
              {nomFichier}
            </span>
            <span className="text-[11.5px] text-ardoise">Cliquer pour remplacer</span>
          </>
        ) : (
          <>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-lavande text-violet">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </span>
            <span className="text-[13px] font-semibold text-encre">
              Cliquer pour choisir un fichier
            </span>
            <span className="text-[11.5px] text-ardoise">
              {description || 'PDF, JPG, PNG — max 5 Mo'}
            </span>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        id={nom}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleChange}
      />

      {erreur && (
        <p className="text-[12px] font-medium text-red-600">{erreur.message}</p>
      )}
    </div>
  )
}
