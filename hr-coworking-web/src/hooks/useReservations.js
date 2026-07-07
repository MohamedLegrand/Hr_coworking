import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listerMesReservations,
  obtenirReservation,
  creerReservation,
  annulerReservation,
  listerToutesReservations,
} from '../api/reservations'

export function useMesReservations() {
  return useQuery({
    queryKey: ['reservations'],
    queryFn: listerMesReservations,
    staleTime: 1000 * 60 * 2,
  })
}

export function useReservation(reservationId) {
  return useQuery({
    queryKey: ['reservation', reservationId],
    queryFn: () => obtenirReservation(reservationId),
    enabled: Boolean(reservationId),
  })
}

export function useCreerReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: creerReservation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reservations'] }),
  })
}

export function useAnnulerReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: annulerReservation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reservations'] }),
  })
}

// ───────────── Administration ─────────────

export function useToutesReservations() {
  return useQuery({
    queryKey: ['administration', 'reservations'],
    queryFn: listerToutesReservations,
  })
}
