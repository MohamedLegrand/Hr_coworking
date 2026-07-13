/**
 * Libellés d'affichage pour la grille tarifaire (voir hooks/useForfaits —
 * les prix et prestations viennent du backend, source unique de vérité ;
 * ce fichier ne contient que du texte marketing).
 */

export const LIBELLES_GAMME = {
  standard: 'Standard',
  vip: 'VIP',
}

export const LIBELLES_FORFAIT = {
  heure: {
    nom: 'À l\'heure',
    description: 'Pour un rendez-vous ponctuel ou une session de travail courte.',
  },
  jour: {
    nom: 'À la journée',
    description: 'Une journée complète de productivité, sans engagement.',
  },
  semaine: {
    nom: 'À la semaine',
    description: 'Pour une mission ou un projet qui dure quelques jours.',
  },
  mois: {
    nom: 'Au mois',
    description: 'Pour les équipes et freelances installés durablement.',
  },
}

export function libelleForfait(forfait) {
  return LIBELLES_FORFAIT[forfait]?.nom || forfait
}

export function descriptionForfait(forfait) {
  return LIBELLES_FORFAIT[forfait]?.description || ''
}

export function libelleGamme(gamme) {
  return LIBELLES_GAMME[gamme] || gamme
}
