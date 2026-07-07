import { Navigate } from 'react-router-dom'
import useAuthStore from '../../contexte/authStore'
import { useMonProfil } from '../../hooks/useAuth'

/**
 * Après un rechargement de page, le store n'a que le token le temps qu'un
 * effet (RehydratationSession) resynchronise `utilisateur`. On lit donc la
 * requête /moi en secours pour connaître le rôle sans redirection prématurée.
 */
function useUtilisateurFiable() {
  const token = useAuthStore((s) => s.token)
  const utilisateurStore = useAuthStore((s) => s.utilisateur)
  const { data: profil, isLoading } = useMonProfil()
  const utilisateur = utilisateurStore || profil
  return { token, utilisateur, enAttente: !utilisateur && isLoading }
}

/** Route accessible uniquement si connecté (membre OU admin). */
export function RouteProtegee({ children }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/connexion" replace />
  return children
}

/** Route réservée au MEMBRE : un admin est renvoyé vers son espace. */
export function RouteMembre({ children }) {
  const { token, utilisateur, enAttente } = useUtilisateurFiable()
  if (!token) return <Navigate to="/connexion" replace />
  if (enAttente) return null
  if (utilisateur?.role === 'admin') return <Navigate to="/administration" replace />
  return children
}

/** Route réservée à l'ADMIN : un membre est renvoyé vers son espace. */
export function RouteAdmin({ children }) {
  const { token, utilisateur, enAttente } = useUtilisateurFiable()
  if (!token) return <Navigate to="/connexion" replace />
  if (enAttente) return null
  if (utilisateur?.role !== 'admin') return <Navigate to="/profil" replace />
  return children
}
