export const LIBELLES_TYPE = {
  bureau_individuel: 'Bureau privé',
  salle_reunion: 'Salle de réunion',
  open_space: 'Open space',
}

export const FILTRES_TYPE = [
  { valeur: null, libelle: 'Tous' },
  { valeur: 'bureau_individuel', libelle: 'Bureau privé' },
  { valeur: 'salle_reunion', libelle: 'Salle de réunion' },
  { valeur: 'open_space', libelle: 'Open space' },
]

const IMAGES_DEFAUT = {
  bureau_individuel: '/images/hero/bureau1.jpg',
  salle_reunion: '/images/hero/salle-reunion.jpg',
  open_space: '/images/hero/hero-section.jpg',
  'Bureau privé': '/images/hero/bureau1.jpg',
  'Salle de réunion': '/images/hero/salle-reunion.jpg',
  'Open space': '/images/hero/hero-section.jpg',
}

const ORIGINE_STATIQUE = import.meta.env.VITE_API_ORIGINE || ''

export function urlImageEspace(espace) {
  // Si l'espace a une image_url (uploadée)
  if (espace?.image_url) {
    if (espace.image_url.startsWith('http')) {
      return espace.image_url
    }
    return `${ORIGINE_STATIQUE}${espace.image_url}`
  }
  
  // Sinon, utiliser l'image par défaut selon le type
  const typeEspace = espace?.type_espace
  let imageUrl = IMAGES_DEFAUT[typeEspace]
  
  // Si pas trouvée, utiliser le libellé comme clé
  if (!imageUrl) {
    const libelle = LIBELLES_TYPE[typeEspace]
    imageUrl = IMAGES_DEFAUT[libelle]
  }
  
  // Fallback ultime
  return imageUrl || IMAGES_DEFAUT.open_space
}

export function formatFcfa(montant) {
  if (montant == null) return '—'
  const n = typeof montant === 'string' ? Number(montant) : montant
  return `${new Intl.NumberFormat('fr-FR').format(n)} F`
}

export function prixAffichage(espace) {
  if (espace?.prix_jour != null) return { montant: espace.prix_jour, unite: 'jour' }
  if (espace?.prix_heure != null) return { montant: espace.prix_heure, unite: 'heure' }
  return { montant: null, unite: 'jour' }
}

export function libelleType(typeEspace) {
  return LIBELLES_TYPE[typeEspace] || typeEspace
}
