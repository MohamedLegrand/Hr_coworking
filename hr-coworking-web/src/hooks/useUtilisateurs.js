import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  obtenirProfilComplet,
  modifierProfil,
  changerMotDePasse,
  reuploadDocuments,
  envoyerVerificationReservation,
  listerTousUtilisateurs,
  validerDocument,
  desactiverUtilisateur,
  reactiverUtilisateur,
  obtenirStatistiquesAdmin,
} from '../api/utilisateurs'

export function useProfilComplet() {
  return useQuery({
    queryKey: ['profil'],
    queryFn: obtenirProfilComplet,
    staleTime: 1000 * 60 * 5,
  })
}

export function useModifierProfil() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: modifierProfil,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profil'] }),
  })
}

export function useChangerMotDePasse() {
  return useMutation({
    mutationFn: changerMotDePasse,
  })
}

export function useReuploadDocuments() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reuploadDocuments,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profil'] }),
  })
}

/** Acceptation des conditions + dépôt des documents KYC avant réservation. */
export function useEnvoyerVerificationReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: envoyerVerificationReservation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profil'] }),
  })
}

// ───────────── Administration ─────────────

export function useTousUtilisateurs(filtres = {}) {
  return useQuery({
    queryKey: ['administration', 'utilisateurs', filtres],
    queryFn: () => listerTousUtilisateurs(filtres),
  })
}

export function useValiderDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ utilisateurId, statut }) => validerDocument(utilisateurId, statut),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['administration', 'utilisateurs'] }),
  })
}

export function useDesactiverUtilisateur() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: desactiverUtilisateur,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['administration', 'utilisateurs'] }),
  })
}

export function useReactiverUtilisateur() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reactiverUtilisateur,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['administration', 'utilisateurs'] }),
  })
}

export function useStatistiquesAdmin() {
  return useQuery({
    queryKey: ['administration', 'statistiques'],
    queryFn: obtenirStatistiquesAdmin,
  })
}
