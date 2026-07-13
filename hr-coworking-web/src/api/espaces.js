import client from './client'

export async function listerEspaces(filtres = {}) {
  const params = {}
  if (filtres.type_espace) params.type_espace = filtres.type_espace
  if (filtres.capacite_min) params.capacite_min = filtres.capacite_min
  const { data } = await client.get('/espaces/', { params })
  return data
}

export async function obtenirEspace(espaceId) {
  const { data } = await client.get(`/espaces/${espaceId}`)
  return data
}

// ───────────── Administration ─────────────

export async function listerTousLesEspaces() {
  const { data } = await client.get('/espaces/admin/tous')
  return data
}

function versFormData(espace) {
  const formData = new FormData()
  Object.entries(espace).forEach(([cle, valeur]) => {
    if (valeur == null || cle === 'image') return
    formData.append(cle, valeur)
  })
  if (espace.image) formData.append('image', espace.image)
  return formData
}

export async function creerEspace(espace) {
  const { data } = await client.post('/espaces/', versFormData(espace), {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function modifierEspace(espaceId, espace) {
  const { data } = await client.patch(`/espaces/${espaceId}`, versFormData(espace), {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function supprimerEspace(espaceId) {
  const { data } = await client.delete(`/espaces/${espaceId}`)
  return data
}
