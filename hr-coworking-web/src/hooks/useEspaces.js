import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listerEspaces,
  obtenirEspace,
  listerTousLesEspaces,
  creerEspace,
  modifierEspace,
  supprimerEspace,
} from '../api/espaces'

export function useEspaces(filtres = {}) {
  return useQuery({
    queryKey: ['espaces', filtres],
    queryFn: () => listerEspaces(filtres),
  })
}

export function useEspace(espaceId) {
  return useQuery({
    queryKey: ['espace', espaceId],
    queryFn: () => obtenirEspace(espaceId),
    enabled: Boolean(espaceId),
  })
}

// ───────────── Administration ─────────────

export function useEspacesAdmin() {
  return useQuery({
    queryKey: ['administration', 'espaces'],
    queryFn: listerTousLesEspaces,
  })
}

function invaliderEspaces(queryClient) {
  queryClient.invalidateQueries({ queryKey: ['espaces'] })
  queryClient.invalidateQueries({ queryKey: ['administration', 'espaces'] })
}

export function useCreerEspace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: creerEspace,
    onSuccess: () => invaliderEspaces(queryClient),
  })
}

export function useModifierEspace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ espaceId, espace }) => modifierEspace(espaceId, espace),
    onSuccess: () => invaliderEspaces(queryClient),
  })
}

export function useSupprimerEspace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: supprimerEspace,
    onSuccess: () => invaliderEspaces(queryClient),
  })
}
