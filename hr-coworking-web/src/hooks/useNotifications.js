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

export function useMarquerNotificationLue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: marquerNotificationLue,
    onSuccess: () => queryClient.invalidateQueries(['notifications', true]),
  })
}

export function useMarquerToutNotifications() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: marquerToutNotifications,
    onSuccess: () => queryClient.invalidateQueries(['notifications', true]),
  })
}

export function useSupprimerNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: supprimerNotification,
    onSuccess: () => queryClient.invalidateQueries(['notifications', true]),
  })
}

export function useViderNotifications() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: viderNotifications,
    onSuccess: () => queryClient.invalidateQueries(['notifications', true]),
  })
}
