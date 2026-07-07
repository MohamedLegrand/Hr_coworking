/**
 * Traduction des erreurs API en messages clairs pour l'utilisateur
 */
export function getErrorMessage(error) {
  if (!error) return null

  // Erreur depuis l'API (response data)
  if (error?.response?.data?.detail) {
    const detail = error.response.data.detail
    
    // Mapper les erreurs courantes
    const errorMap = {
      'email_already_exists': '📧 Cette adresse e-mail est déjà utilisée.',
      'invalid_credentials': '❌ Identifiants incorrects. Vérifiez votre e-mail et mot de passe.',
      'invalid_email': '❌ Format d\'e-mail invalide.',
      'password_too_weak': '🔒 Le mot de passe doit contenir au moins 8 caractères.',
      'user_not_found': '👤 Utilisateur introuvable. Avez-vous un compte ?',
      'invalid_token': '⏱️ Votre session a expiré. Reconnectez-vous.',
      'network_error': '🌐 Problème de connexion. Vérifiez votre internet.',
      'server_error': '⚙️ Problème serveur. Réessayez dans quelques instants.',
      'not_found': '❌ La ressource demandée n\'existe pas.',
      'insufficient_permissions': '🔐 Vous n\'avez pas les permissions nécessaires.',
    }
    
    // Rechercher une correspondance
    for (const [key, msg] of Object.entries(errorMap)) {
      if (typeof detail === 'string' && detail.toLowerCase().includes(key.toLowerCase())) {
        return msg
      }
    }
    
    // Retourner le message de l'API si présent
    if (typeof detail === 'string') return detail
  }

  // Erreur depuis le message d'erreur standard
  if (error?.message) {
    const msg = error.message.toLowerCase()
    if (msg.includes('network') || msg.includes('fetch')) {
      return '🌐 Problème de connexion réseau.'
    }
    if (msg.includes('timeout')) {
      return '⏱️ La requête a pris trop de temps. Réessayez.'
    }
    return error.message
  }

  return '❌ Une erreur est survenue. Veuillez réessayer.'
}

/**
 * Messages de succès localisés et agréables
 */
export function getSuccessMessage(action) {
  const messages = {
    login: '✨ Bienvenue ! Connexion réussie.',
    register: '🎉 Compte créé avec succès ! Bienvenue chez HR-COWORKING.',
    password_reset: '🔑 Votre mot de passe a été réinitialisé. Connectez-vous.',
    reservation_created: '📅 Réservation créée avec succès !',
    reservation_cancelled: '❌ Réservation annulée.',
    profile_updated: '✅ Profil mis à jour.',
    payment_success: '💳 Paiement reçu. Merci !',
    notification_cleared: '🗑️ Notifications effacées.',
  }
  return messages[action] || '✅ Opération réussie.'
}

/**
 * Titres d'erreur pour les toasts
 */
export function getErrorTitle(error) {
  if (!error) return 'Erreur'
  
  const status = error?.response?.status
  if (status === 401) return '🔐 Non authentifié'
  if (status === 403) return '🔒 Accès refusé'
  if (status === 404) return '🔍 Non trouvé'
  if (status === 409) return '⚠️ Conflit'
  if (status >= 500) return '⚙️ Erreur serveur'
  if (status >= 400) return '❌ Requête invalide'
  
  return '❌ Erreur'
}
