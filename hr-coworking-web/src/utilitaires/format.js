export const LIBELLES_TYPE = {
  bureau_individuel: 'Bureau privé',
  salle_reunion: 'Salle de réunion',
  open_space: 'Open space',
}

export const FILTRES_TYPE = [
  { valeur: null, libelle: 'Tous' },
  { valeur: 'bureau_individuel', libelle: 'Bureau privé' },
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

export function libelleType(typeEspace) {
  return LIBELLES_TYPE[typeEspace] || typeEspace
}

/** Phrase à afficher sur un bureau déjà réservé : période exacte + heure de retour à disponibilité. */
export function formatPeriodeReservee(dateDebut, dateFin) {
  const debut = new Date(dateDebut).toLocaleString('fr-FR')
  const fin = new Date(dateFin).toLocaleString('fr-FR')
  return `Réservé du ${debut} au ${fin} — disponible à partir du ${fin}.`
}

/** URL absolue vers un document uploadé (CNI, justificatif entreprise…). */
export function urlDocument(cheminRelatif) {
  if (!cheminRelatif) return null
  if (cheminRelatif.startsWith('http')) return cheminRelatif
  const chemin = cheminRelatif.startsWith('/') ? cheminRelatif : `/${cheminRelatif}`
  return `${ORIGINE_STATIQUE}${chemin}`
}
