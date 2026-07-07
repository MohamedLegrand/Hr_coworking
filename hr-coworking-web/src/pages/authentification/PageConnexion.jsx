import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import LayoutAuth from '../../composants/mise-en-page/LayoutAuth'
import ChampTexte from '../../composants/communs/ChampTexte'
import BoutonSoumission from '../../composants/communs/BoutonSoumission'
import { useConnexion } from '../../hooks/useAuth'
import { useToast } from '../../contexte/ToastContext'
import { getErrorMessage, getErrorTitle, getSuccessMessage } from '../../utilitaires/erreurs'

export default function PageConnexion() {
  const [searchParams] = useSearchParams()
  const inscrit = searchParams.get('inscrit') === '1'
  const reinitialise = searchParams.get('reinitialise') === '1'

  const { mutate, isPending, error } = useConnexion()
  const { success: toastSuccess, error: toastError } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  // Afficher messages de succès/erreur en toast
  // (le toast de connexion réussie est déclenché une seule fois depuis useConnexion, à l'onSuccess de la mutation)
  useEffect(() => {
    if (inscrit) toastSuccess('🎉 Bienvenue !', getSuccessMessage('register'))
    if (reinitialise) toastSuccess('🔑 Réinitialisation', getSuccessMessage('password_reset'))
  }, [inscrit, reinitialise, toastSuccess])

  useEffect(() => {
    if (error) {
      toastError(getErrorTitle(error), getErrorMessage(error), 5000)
    }
  }, [error, toastError])

  const onSubmit = (data) => {
    mutate({ email: data.email, motDePasse: data.mot_de_passe })
  }

  return (
    <LayoutAuth
      titre="Bienvenue"
      sousTitre="Connectez-vous à votre espace de travail."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

        <ChampTexte
          label="Adresse e-mail"
          nom="email"
          type="email"
          placeholder="vous@exemple.com"
          inputMode="email"
          autoComplete="email"
          register={register}
          erreur={errors.email}
          obligatoire
          {...register('email', {
            required: "L'adresse e-mail est obligatoire.",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Format d'e-mail invalide.",
            },
          })}
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="mot_de_passe" className="text-[13.5px] font-semibold text-encre">
              Mot de passe <span className="text-violet">*</span>
            </label>
            <Link
              to="/mot-de-passe-oublie"
              className="text-[12.5px] font-semibold text-violet hover:text-violet-fonce"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <ChampTexte
            label=""
            nom="mot_de_passe"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            register={register}
            erreur={errors.mot_de_passe}
            {...register('mot_de_passe', {
              required: 'Le mot de passe est obligatoire.',
              minLength: { value: 8, message: 'Minimum 8 caractères.' },
            })}
          />
        </div>

        <BoutonSoumission
          libelle="Se connecter"
          libelleChargement="Connexion…"
          chargement={isPending}
        />

        <p className="text-center text-[13.5px] text-ardoise">
          Pas encore de compte ?{' '}
          <Link
            to="/inscription"
            className="font-semibold text-violet hover:text-violet-fonce"
          >
            S'inscrire
          </Link>
        </p>
      </form>
    </LayoutAuth>
  )
}
