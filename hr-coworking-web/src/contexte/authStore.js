import { create } from 'zustand'

const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  utilisateur: null,

  connecter: (token, utilisateur) => {
    localStorage.setItem('token', token)
    set({ token, utilisateur })
  },

  deconnecter: () => {
    localStorage.removeItem('token')
    set({ token: null, utilisateur: null })
  },

  setUtilisateur: (utilisateur) => set({ utilisateur }),
}))

export default useAuthStore
