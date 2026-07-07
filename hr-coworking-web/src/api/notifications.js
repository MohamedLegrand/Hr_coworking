import client from './client'

export async function listerNotifications(nonLuesSeules = true) {
  const { data } = await client.get('/notifications/mes-notifications', {
    params: { non_lues_seulement: nonLuesSeules },
  })
  return data
}

export async function marquerNotificationLue(notificationId) {
  const { data } = await client.patch(
    `/notifications/mes-notifications/${notificationId}/lire`,
  )
  return data
}

export async function marquerToutNotifications() {
  const { data } = await client.patch('/notifications/mes-notifications/tout-lire')
  return data
}

export async function supprimerNotification(notificationId) {
  const { data } = await client.delete(
    `/notifications/mes-notifications/${notificationId}`,
  )
  return data
}

export async function viderNotifications() {
  const { data } = await client.delete('/notifications/mes-notifications')
  return data
}
