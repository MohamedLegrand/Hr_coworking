import client from './client'

export async function listerMesReservations() {
  const { data } = await client.get('/reservations/mes-reservations')
  return data
}

export async function obtenirReservation(reservationId) {
  const { data } = await client.get(`/reservations/${reservationId}`)
  return data
}

export async function creerReservation(details) {
  const { data } = await client.post('/reservations/', { details })
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
