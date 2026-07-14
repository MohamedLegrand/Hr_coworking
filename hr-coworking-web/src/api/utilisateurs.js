import client from './client'

export async function obtenirProfilComplet() {
  const { data } = await client.get('/utilisateurs/profil')
  return data
}

export async function modifierProfil(profil) {
  const formData = new FormData()
  if (profil.nom != null) formData.append('nom', profil.nom)
  if (profil.prenom != null) formData.append('prenom', profil.prenom)
  if (profil.telephone != null) formData.append('telephone', profil.telephone)
  if (profil.nom_entreprise != null) formData.append('nom_entreprise', profil.nom_entreprise)

  const { data } = await client.patch('/utilisateurs/profil', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function changerMotDePasse(payload) {
  const { data } = await client.post('/utilisateurs/changer-mot-de-passe', payload)
  return data
}

export async function reuploadDocuments({ cniRecto, cniVerso, photoIdentite, documentEntreprise }) {
  const formData = new FormData()
  if (cniRecto) formData.append('cni_recto', cniRecto)
  if (cniVerso) formData.append('cni_verso', cniVerso)
  if (photoIdentite) formData.append('photo_identite', photoIdentite)
  if (documentEntreprise) formData.append('document_entreprise', documentEntreprise)

  const { data } = await client.post('/utilisateurs/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

// ───────────── Administration ─────────────

export async function listerTousUtilisateurs(filtres = {}) {
  const params = {}
  if (filtres.type_compte) params.type_compte = filtres.type_compte
  if (filtres.document_statut) params.document_statut = filtres.document_statut
  if (filtres.est_actif != null) params.est_actif = filtres.est_actif
  const { data } = await client.get('/administration/utilisateurs', { params })
  return data
}

export async function validerDocument(utilisateurId, statut) {
  const { data } = await client.patch(`/administration/utilisateurs/${utilisateurId}/valider-document`, {
    statut,
  })
  return data
}

export async function desactiverUtilisateur(utilisateurId) {
  const { data } = await client.patch(`/administration/utilisateurs/${utilisateurId}/desactiver`)
  return data
}

export async function reactiverUtilisateur(utilisateurId) {
  const { data } = await client.patch(`/administration/utilisateurs/${utilisateurId}/reactiver`)
  return data
}

export async function obtenirStatistiquesAdmin() {
  const { data } = await client.get('/administration/statistiques')
  return data
}
