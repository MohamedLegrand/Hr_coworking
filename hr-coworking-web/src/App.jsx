import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import useAuthStore from './contexte/authStore'
import { useMonProfil } from './hooks/useAuth'
import { RouteMembre, RouteAdmin } from './composants/routes/Gardes'
import SplashScreen from './composants/communs/SplashScreen'
import { ToastProvider, useToast } from './contexte/ToastContext'
import { ToastContainer } from './composants/communs/Toast'
import LayoutPrincipal from './composants/mise-en-page/LayoutPrincipal'
import LayoutMembre from './composants/mise-en-page/LayoutMembre'
import LayoutAdmin from './composants/mise-en-page/LayoutAdmin'
import PageAccueil from './pages/espaces/PageAccueil'
import PageDetailEspace from './pages/espaces/PageDetailEspace'
import PageDashboard from './pages/dashboard/PageDashboard'
import PageConnexion from './pages/authentification/PageConnexion'
import PageInscription from './pages/authentification/PageInscription'
import PageMotDePasseOublie from './pages/authentification/PageMotDePasseOublie'
import PageEnConstruction from './composants/communs/PageEnConstruction'
import PageSelectionBureaux from './pages/espaces/PageSelectionBureaux'
import PageMesReservations from './pages/reservations/PageMesReservations'
import PagePaiement from './pages/paiements/PagePaiement'
import PageAdminAccueil from './pages/administration/PageAdminAccueil'
import PageAdminEspaces from './pages/administration/PageAdminEspaces'
import PageAdminUtilisateurs from './pages/administration/PageAdminUtilisateurs'
import PageAdminReservations from './pages/administration/PageAdminReservations'
import PageAdminPaiements from './pages/administration/PageAdminPaiements'

/** Recharge l'utilisateur (rôle inclus) depuis le token persisté après un rechargement de page. */
function RehydratationSession() {
  const utilisateur = useAuthStore((s) => s.utilisateur)
  const setUtilisateur = useAuthStore((s) => s.setUtilisateur)
  const { data: profil } = useMonProfil()

  useEffect(() => {
    if (profil && !utilisateur) setUtilisateur(profil)
  }, [profil, utilisateur, setUtilisateur])

  return null
}

/** Défile vers l'ancre ciblée par l'URL, sinon remonte en haut à chaque changement de page. */
function DefilementNavigation() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const cible = document.querySelector(hash)
      if (cible) {
        requestAnimationFrame(() => cible.scrollIntoView({ behavior: 'smooth' }))
        return
      }
    }
    window.scrollTo({ top: 0 })
  }, [pathname, hash])

  return null
}

export default function App() {
  const [splashTermine, setSplashTermine] = useState(() => {
    return sessionStorage.getItem('hr_splash_done') === 'true'
  })

  const marquerSplashTermine = () => {
    sessionStorage.setItem('hr_splash_done', 'true')
    setSplashTermine(true)
  }

  return (
    <ToastProvider>
      <>
        <RehydratationSession />

        {/* Splash screen monté AVANT le BrowserRouter
            pour qu'il soit totalement indépendant du routeur */}
        {!splashTermine && (
          <SplashScreen onTermine={marquerSplashTermine} />
        )}

        {/* L'app est montée derrière le splash (invisible)
            pour que React Query et Zustand soient déjà prêts
            quand le splash se termine */}
        <div
          className={`transition-opacity duration-700 ${
            splashTermine ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <BrowserRouter>
            <DefilementNavigation />
            <AppRoutes />
          </BrowserRouter>
        </div>

        {/* Toast Container — gère les notifications */}
        <AppToastContainer />
      </>
    </ToastProvider>
  )
}

/** Composant pour afficher les toasts */
function AppToastContainer() {
  const { toasts, removeToast } = useToast()
  return <ToastContainer toasts={toasts} removeToast={removeToast} />
}

/** Toutes les routes de l'application */
function AppRoutes() {
  return (
    <Routes>
      <Route element={<LayoutPrincipal />}>
        {/* Routes publiques */}
        <Route path="/" element={<PageAccueil />} />
        <Route path="/espaces/:id" element={<PageDetailEspace />} />
      </Route>

      {/* ───── ESPACE MEMBRE — sidebar dédiée, jamais d'accès admin ───── */}
      <Route element={<RouteMembre><LayoutMembre /></RouteMembre>}>
        <Route path="/profil" element={<PageDashboard />} />
        <Route path="/espaces" element={<PageSelectionBureaux />} />
        <Route path="/reservations" element={<PageMesReservations />} />
        <Route path="/paiements" element={<PagePaiement />} />
        <Route path="/notifications" element={<PageEnConstruction titre="Mes notifications" />} />
      </Route>

      {/* ───── ESPACE ADMIN — sidebar dédiée, réservé au rôle admin ───── */}
      <Route path="/administration" element={<RouteAdmin><LayoutAdmin /></RouteAdmin>}>
        <Route index element={<PageAdminAccueil />} />
        <Route path="utilisateurs" element={<PageAdminUtilisateurs />} />
        <Route path="espaces" element={<PageAdminEspaces />} />
        <Route path="reservations" element={<PageAdminReservations />} />
        <Route path="paiements" element={<PageAdminPaiements />} />
        <Route path="checkout" element={<PagePaiement />} />
      </Route>

      {/* Authentification — mise en page dédiée, sans header/footer */}
      <Route path="/connexion" element={<PageConnexion />} />
      <Route path="/inscription" element={<PageInscription />} />
      <Route path="/mot-de-passe-oublie" element={<PageMotDePasseOublie />} />
      <Route path="/reinitialiser-mot-de-passe" element={<div>Réinitialisation — à créer</div>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
