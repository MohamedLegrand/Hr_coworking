import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import LayoutAuth from '../../composants/mise-en-page/LayoutAuth'
import ChampTexte from '../../composants/communs/ChampTexte'
import BoutonSoumission from '../../composants/communs/BoutonSoumission'
import { useReinitialiserMotDePasse } from '../../hooks/useAuth'
import { useToast } from '../../contexte/ToastContext'
import { getErrorMessage, getErrorTitle } from '../../utilitaires/erreurs'

export default function PageReinitialiserMotDePasse() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const { mutate, isPending, error } = useReinitialiserMotDePasse()
  const { error: toastError } = useToast()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const nouveauMotDePasse = watch('nouveau_mot_de_passe')

  useEffect(() => {
    if (error) {
      toastError(getErrorTitle(error), getErrorMessage(error), 5000)
    }
  }, [error, toastError])

  const onSubmit = (data) => mutate({ token, nouveauMotDePasse: data.nouveau_mot_de_passe })

  if (!token) {
    return (
      <LayoutAuth
        titre="Lien invalide"
        sousTitre="Ce lien de réinitialisation est incomplet ou a déjà été utilisé."
      >
        <p className="text-center text-[13.5px] text-ardoise">
          <Link to="/mot-de-passe-oublie" className="font-semibold text-violet hover:text-violet-fonce">
            Demander un nouveau lien
          </Link>
        </p>
      </LayoutAuth>
    )
  }

  return (
    <LayoutAuth
      titre="Nouveau mot de passe"
      sousTitre="Choisissez un nouveau mot de passe pour votre compte."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <ChampTexte
          label="Nouveau mot de passe"
          nom="nouveau_mot_de_passe"
          type="password"
          register={register}
          erreur={errors.nouveau_mot_de_passe}
          obligatoire
          {...register('nouveau_mot_de_passe', {
            required: 'Le mot de passe est obligatoire.',
            minLength: { value: 8, message: 'Minimum 8 caractères.' },
          })}
        />

        <ChampTexte
          label="Confirmer le mot de passe"
          nom="confirmation"
          type="password"
          register={register}
          erreur={errors.confirmation}
          obligatoire
          {...register('confirmation', {
            required: 'La confirmation est obligatoire.',
            validate: (valeur) => valeur === nouveauMotDePasse || 'Les mots de passe ne correspondent pas.',
          })}
        />

        <BoutonSoumission
          libelle="Réinitialiser le mot de passe"
          libelleChargement="Réinitialisation…"
          chargement={isPending}
        />

        <p className="text-center text-[13.5px] text-ardoise">
          <Link to="/connexion" className="font-semibold text-violet hover:text-violet-fonce">
            ← Retour à la connexion
          </Link>
        </p>
      </form>
    </LayoutAuth>
  )
}
