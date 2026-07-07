import { useState } from 'react'
import { Oeil, OeilBarre } from './Icones'

/**
 * Champ de saisie réutilisable (text, email, password, tel…).
 * Compatible React Hook Form via la prop register.
 */
export default function ChampTexte({
  label,
  nom,
  type = 'text',
  placeholder = '',
  register,
  erreur,
  obligatoire = false,
  ...rest
}) {
  const [revele, setRevele] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (revele ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={nom} className="text-[13.5px] font-semibold text-encre">
        {label}
        {obligatoire && <span className="ml-1 text-violet">*</span>}
      </label>

      <div className="relative">
        <input
          id={nom}
          type={inputType}
          placeholder={placeholder}
          {...(register ? register(nom) : {})}
          {...rest}
          className={`h-11 w-full rounded-lg border px-4 ${isPassword ? 'pr-12' : 'pr-4'} text-[14.5px] text-encre placeholder-ardoise/60 outline-none transition-colors focus:border-violet focus:ring-2 focus:ring-violet/15 ${
            erreur ? 'border-red-400 bg-red-50' : 'border-ligne bg-white hover:border-ardoise/40'
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevele((etat) => !etat)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ardoise transition-colors hover:text-encre"
          >
            {revele ? <OeilBarre /> : <Oeil />}
          </button>
        )}
      </div>

      {erreur && (
        <p className="text-[12px] font-medium text-red-600">{erreur.message}</p>
      )}
    </div>
  )
}
