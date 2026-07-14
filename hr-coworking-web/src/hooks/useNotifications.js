import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listerNotifications,
  marquerNotificationLue,
  marquerToutNotifications,
  supprimerNotification,
  viderNotifications,
} from '../api/notifications'

export function useNotifications(nonLuesSeules = true) {
  return useQuery({
    queryKey: ['notifications', nonLuesSeules],
    queryFn: () => listerNotifications(nonLuesSeules),
    staleTime: 1000 * 60 * 2,
  })
}

function invaliderNotifications(queryClient) {
  // Invalide les deux variantes (non-lues seulement / toutes) en une fois.
  queryClient.invalidateQueries({ queryKey: ['notifications'] })
}

export function useMarquerNotificationLue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: marquerNotificationLue,
    onSuccess: () => invaliderNotifications(queryClient),
  })
}

export function useMarquerToutNotifications() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: marquerToutNotifications,
    onSuccess: () => invaliderNotifications(queryClient),
  })
}

export function useSupprimerNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: supprimerNotification,
    onSuccess: () => invaliderNotifications(queryClient),
  })
}

export function useViderNotifications() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: viderNotifications,
    onSuccess: () => invaliderNotifications(queryClient),
  })
}
