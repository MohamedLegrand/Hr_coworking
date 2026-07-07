import client from './client'

/**
 * Inscription (multipart/form-data car il y a des fichiers).
 * POST /api/v1/authentification/inscription
 */
export async function inscrire(donnees) {
  const formData = new FormData()
  formData.append('email', donnees.email)
  formData.append('mot_de_passe', donnees.mot_de_passe)
  formData.append('nom', donnees.nom)
  formData.append('prenom', donnees.prenom)
  formData.append('type_compte', donnees.type_compte)
  if (donnees.telephone) formData.append('telephone', donnees.telephone)
  if (donnees.nom_entreprise) formData.append('nom_entreprise', donnees.nom_entreprise)
  formData.append('cni', donnees.cni)
  if (donnees.document_entreprise) {
    formData.append('document_entreprise', donnees.document_entreprise)
  }
  const { data } = await client.post('/authentification/inscription', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

/**
 * Connexion (application/x-www-form-urlencoded — norme OAuth2).
 * POST /api/v1/authentification/connexion
 */
export async function connecter(email, motDePasse) {
  const params = new URLSearchParams()
  params.append('username', email)
  params.append('password', motDePasse)
  const { data } = await client.post('/authentification/connexion', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data // { access_token, token_type }
}

/**
 * Récupère le profil de l'utilisateur connecté.
 * GET /api/v1/authentification/moi
 */
export async function obtenirMoi() {
  const { data } = await client.get('/authentification/moi')
  return data
}

/**
 * Demande de réinitialisation de mot de passe.
 * POST /api/v1/authentification/mot-de-passe-oublie
 */
export async function motDePasseOublie(email) {
  const { data } = await client.post('/authentification/mot-de-passe-oublie', { email })
  return data
}

/**
 * Réinitialisation du mot de passe avec le token reçu par email.
 * POST /api/v1/authentification/reinitialiser-mot-de-passe
 */
export async function reinitialiserMotDePasse(token, nouveauMotDePasse) {
  const { data } = await client.post('/authentification/reinitialiser-mot-de-passe', {
    token,
    nouveau_mot_de_passe: nouveauMotDePasse,
  })
  return data
}
