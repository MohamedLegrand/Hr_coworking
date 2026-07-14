import { useMemo } from 'react'
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

/** Bureaux occupés à l'instant présent (réservation en_attente/confirmée en cours). */
export function useEspacesOccupesMaintenant() {
  const { debut, fin } = useMemo(() => {
    const debut = new Date()
    return { debut, fin: new Date(debut.getTime() + 5 * 60 * 1000) }
  }, [])
  return useIndisponibilites(debut, fin)
}

/**
 * Bureaux ayant une réservation active à venir ou en cours (en_attente/confirmée),
 * sur une large fenêtre (1 an) — sert à signaler "espace réservé" sur les cartes du
 * catalogue, indépendamment de l'heure exacte à laquelle le client consulte la page.
 */
export function useEspacesReserves() {
  const { debut, fin } = useMemo(() => {
    const debut = new Date()
    const fin = new Date(debut)
    fin.setFullYear(fin.getFullYear() + 1)
    return { debut, fin }
  }, [])
  return useIndisponibilites(debut, fin)
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
