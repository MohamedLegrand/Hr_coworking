import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import LayoutAuth from '../../composants/mise-en-page/LayoutAuth'
import ChampTexte from '../../composants/communs/ChampTexte'
import BoutonSoumission from '../../composants/communs/BoutonSoumission'
import { useMotDePasseOublie } from '../../hooks/useAuth'
import { useToast } from '../../contexte/ToastContext'
import { getErrorMessage, getErrorTitle } from '../../utilitaires/erreurs'

export default function PageMotDePasseOublie() {
  const { mutate, isPending, error, isSuccess } = useMotDePasseOublie()
  const { success: toastSuccess, error: toastError } = useToast()
  const { register, handleSubmit, formState: { errors } } = useForm()

  useEffect(() => {
    if (error) {
      toastError(getErrorTitle(error), getErrorMessage(error), 5000)
    }
  }, [error, toastError])

  useEffect(() => {
    if (isSuccess) {
      toastSuccess('✉️ Lien envoyé', 'Si un compte existe, un lien de réinitialisation a été envoyé à votre e-mail.', 5000)
    }
  }, [isSuccess, toastSuccess])

  const onSubmit = (data) => mutate(data.email)

  return (
    <LayoutAuth
      titre="Mot de passe oublié"
      sousTitre="Entrez votre e-mail, nous vous enverrons un lien de réinitialisation."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {!isSuccess && (
          <>
            <ChampTexte
              label="Adresse e-mail"
              nom="email"
              type="email"
              placeholder="vous@exemple.com"
              register={register}
              erreur={errors.email}
              obligatoire
              {...register('email', {
                required: "L'e-mail est obligatoire.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Format d'e-mail invalide.",
                },
              })}
            />

            <BoutonSoumission
              libelle="Envoyer le lien"
              libelleChargement="Envoi…"
              chargement={isPending}
            />
          </>
        )}

        <p className="text-center text-[13.5px] text-ardoise">
          <Link
            to="/connexion"
            className="font-semibold text-violet hover:text-violet-fonce"
          >
            ← Retour à la connexion
          </Link>
        </p>
      </form>
    </LayoutAuth>
  )
}
