import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  inscrire,
  connecter,
  obtenirMoi,
  motDePasseOublie,
  reinitialiserMotDePasse,
} from '../api/auth'
import useAuthStore from '../contexte/authStore'
import { useToast } from '../contexte/ToastContext'

/** Mutation d'inscription — redirige vers /connexion après succès. */
export function useInscription() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: inscrire,
    onSuccess: () => navigate('/connexion?inscrit=1'),
  })
}

/** Mutation de connexion — stocke le token et redirige vers l'accueil. */
export function useConnexion() {
  const { connecter: stocker, setUtilisateur } = useAuthStore()
  const navigate = useNavigate()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ email, motDePasse }) => connecter(email, motDePasse),
    onSuccess: async (data) => {
      stocker(data.access_token, null)
      // Charger le profil juste après pour hydrater le store
      try {
        const profil = await obtenirMoi()
        setUtilisateur(profil)
        toast.success('👋 Bienvenue' + (profil.prenom ? `, ${profil.prenom}` : ''), 'Connexion réussie. Redirection…')
        if (profil.role === 'admin') {
          navigate('/administration')
        } else {
          navigate('/profil')
        }
      } catch {
        toast.success('👋 Bienvenue', 'Connexion réussie. Redirection…')
        navigate('/profil')
      }
    },
  })
}

/** Profil de l'utilisateur connecté. */
export function useMonProfil() {
  const token = useAuthStore((s) => s.token)
  return useQuery({
    queryKey: ['moi'],
    queryFn: obtenirMoi,
    enabled: Boolean(token),
  })
}

/** Mutation mot de passe oublié. */
export function useMotDePasseOublie() {
  return useMutation({ mutationFn: (email) => motDePasseOublie(email) })
}

/** Mutation réinitialisation mot de passe. */
export function useReinitialiserMotDePasse() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: ({ token, nouveauMotDePasse }) =>
      reinitialiserMotDePasse(token, nouveauMotDePasse),
    onSuccess: () => navigate('/connexion?reinitialise=1'),
  })
}
