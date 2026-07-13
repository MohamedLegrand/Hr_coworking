import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  obtenirForfaits,
  listerMesReservations,
  obtenirReservation,
  creerReservation,
  validerCguKyc,
  annulerReservation,
  listerToutesReservations,
  obtenirIndisponibilites,
} from '../api/reservations'

/** Grille tarifaire de référence (2 gammes x 4 forfaits) — change rarement. */
export function useForfaits() {
  return useQuery({
    queryKey: ['forfaits'],
    queryFn: obtenirForfaits,
    staleTime: 1000 * 60 * 30,
  })
}

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

/** Espaces indisponibles sur une période donnée (pour griser en temps réel). */
export function useIndisponibilites(debut, fin) {
  return useQuery({
    queryKey: ['reservations', 'indisponibilites', debut?.toISOString(), fin?.toISOString()],
    queryFn: () => obtenirIndisponibilites(debut, fin),
    enabled: Boolean(debut && fin && fin > debut),
    staleTime: 1000 * 30,
  })
}

export function useCreerReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: creerReservation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reservations'] }),
  })
}

/** Acceptation des CGU (par réservation) + dépôt KYC si nécessaire, avant paiement. */
export function useValiderCguKyc() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: validerCguKyc,
    onSuccess: (reservation) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservation', reservation.id] })
      queryClient.invalidateQueries({ queryKey: ['profil'] })
    },
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
