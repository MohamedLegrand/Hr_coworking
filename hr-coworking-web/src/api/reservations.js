import client from './client'

/** Grille tarifaire de référence (2 gammes x 4 forfaits), source unique de vérité. */
export async function obtenirForfaits() {
  const { data } = await client.get('/reservations/forfaits')
  return data
}

export async function listerMesReservations() {
  const { data } = await client.get('/reservations/mes-reservations')
  return data
}

export async function obtenirReservation(reservationId) {
  const { data } = await client.get(`/reservations/${reservationId}`)
  return data
}

/** espaceIds: uuid[] — gamme/forfait/date_debut choisis par le client, date_fin calculée côté serveur. */
export async function creerReservation({ espaceIds, gamme, forfait, dateDebut }) {
  const { data } = await client.post('/reservations/', {
    espace_ids: espaceIds,
    gamme,
    forfait,
    date_debut: dateDebut.toISOString(),
  })
  return data
}

/** Acceptation des conditions (par réservation) + dépôt des documents KYC si nécessaire. */
export async function validerCguKyc({
  reservationId, cguAcceptees, cniRecto, cniVerso, photoIdentite, documentEntreprise,
}) {
  const formData = new FormData()
  formData.append('cgu_acceptees', cguAcceptees ? 'true' : 'false')
  if (cniRecto) formData.append('cni_recto', cniRecto)
  if (cniVerso) formData.append('cni_verso', cniVerso)
  if (photoIdentite) formData.append('photo_identite', photoIdentite)
  if (documentEntreprise) formData.append('document_entreprise', documentEntreprise)

  const { data } = await client.post(`/reservations/${reservationId}/valider-cgu-kyc`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

/** Espaces déjà réservés (en_attente/confirmée) qui chevauchent la période donnée. */
export async function obtenirIndisponibilites(debut, fin) {
  const { data } = await client.get('/reservations/indisponibilites', {
    params: { debut: debut.toISOString(), fin: fin.toISOString() },
  })
  return data
}

export async function annulerReservation(reservationId) {
  const { data } = await client.patch(`/reservations/${reservationId}/annuler`)
  return data
}

// ───────────── Administration ─────────────

export async function listerToutesReservations() {
  const { data } = await client.get('/reservations/admin/toutes')
  return data
}
