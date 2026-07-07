import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listerPaiements, obtenirPaiement, initierPaiement, listerTousPaiements } from '../api/paiements'

export function usePaiements() {
  return useQuery({
    queryKey: ['paiements'],
    queryFn: listerPaiements,
    staleTime: 1000 * 60 * 2,
  })
}

export function usePaiement(paiementId) {
  return useQuery({
    queryKey: ['paiement', paiementId],
    queryFn: () => obtenirPaiement(paiementId),
    enabled: Boolean(paiementId),
  })
}

export function useInitierPaiement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: initierPaiement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paiements'] })
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
    },
  })
}

// ───────────── Administration ─────────────

export function useTousPaiements() {
  return useQuery({
    queryKey: ['administration', 'paiements'],
    queryFn: listerTousPaiements,
  })
}
