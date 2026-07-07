import { useState } from 'react'
import { urlImageEspace } from '../../utilitaires/format'

/**
 * Composant Image d'espace avec fallback
 * Affiche l'image ou un placeholder si le chargement échoue
 */
export default function ImageEspace({ espace, className = '', ...props }) {
  const [erreur, setErreur] = useState(false)

  const imageSrc = urlImageEspace(espace)
  const typeEspace = espace?.type_espace

  if (erreur) {
    // Placeholder si l'image ne charge pas
    const couleurFallback = {
      bureau_individuel: 'from-blue-400 to-blue-600',
      salle_reunion: 'from-purple-400 to-purple-600',
      open_space: 'from-green-400 to-green-600',
    }

    const couleur = couleurFallback[typeEspace] || 'from-slate-400 to-slate-600'

    return (
      <div className={`bg-gradient-to-br ${couleur} flex items-center justify-center ${className}`}>
        <div className="text-center text-white">
          <div className="text-4xl mb-2">🏢</div>
          <p className="text-sm opacity-80">{espace?.nom || 'Espace'}</p>
        </div>
      </div>
    )
  }

  return (
    <img
      src={imageSrc}
      alt={espace?.nom || 'Espace'}
      className={className}
      onError={() => setErreur(true)}
      {...props}
    />
  )
}
