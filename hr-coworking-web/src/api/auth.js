import client from './client'

/**
 * Inscription (JSON — les documents KYC sont demandés plus tard, avant la réservation).
 * POST /api/v1/authentification/inscription
 */
export async function inscrire(donnees) {
  const { data } = await client.post('/authentification/inscription', {
    email: donnees.email,
    mot_de_passe: donnees.mot_de_passe,
    nom: donnees.nom,
    prenom: donnees.prenom,
    type_compte: donnees.type_compte,
    telephone: donnees.telephone || null,
    nom_entreprise: donnees.nom_entreprise || null,
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
