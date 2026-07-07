import client from './client'

export async function listerPaiements() {
  const { data } = await client.get('/paiements/mes-paiements')
  return data
}

export async function obtenirPaiement(paiementId) {
  const { data } = await client.get(`/paiements/${paiementId}`)
  return data
}

export async function initierPaiement({ reservation_id, operateur, numero_telephone, description }) {
  const { data } = await client.post('/paiements/initier', {
    reservation_id,
    operateur,
    numero_telephone,
    description,
  })
  return data
}

// ───────────── Administration ─────────────

export async function listerTousPaiements() {
  const { data } = await client.get('/paiements/admin/tous')
  return data
}
