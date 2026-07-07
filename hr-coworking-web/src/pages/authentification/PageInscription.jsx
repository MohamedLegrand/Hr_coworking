import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import LayoutAuth from '../../composants/mise-en-page/LayoutAuth'
import ChampTexte from '../../composants/communs/ChampTexte'
import ChampFichier from '../../composants/communs/ChampFichier'
import BoutonSoumission from '../../composants/communs/BoutonSoumission'
import { useInscription } from '../../hooks/useAuth'
import { useToast } from '../../contexte/ToastContext'
import { getErrorMessage, getErrorTitle } from '../../utilitaires/erreurs'

export default function PageInscription() {
  const [typeCompte, setTypeCompte] = useState('freelance')
  const [cni, setCni] = useState(null)
  const [documentEntreprise, setDocumentEntreprise] = useState(null)
  const [erreurFichier, setErreurFichier] = useState('')

  const { mutate, isPending, error, isSuccess } = useInscription()
  const { error: toastError, warning: toastWarning } = useToast()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { type_compte: 'freelance' } })

  const motDePasse = watch('mot_de_passe')

  useEffect(() => {
    if (error) {
      toastError(getErrorTitle(error), getErrorMessage(error), 5000)
    }
  }, [error, toastError])

  useEffect(() => {
    if (erreurFichier) {
      toastWarning('⚠️ Fichier manquant', erreurFichier)
    }
  }, [erreurFichier, toastWarning])

  const onSubmit = (data) => {
    setErreurFichier('')

    if (!cni) {
      setErreurFichier('La CNI est obligatoire.')
      return
    }
    if (typeCompte === 'entreprise' && !documentEntreprise) {
      setErreurFichier('Le document entreprise est obligatoire.')
      return
    }

    mutate({
      ...data,
      type_compte: typeCompte,
      cni,
      document_entreprise: typeCompte === 'entreprise' ? documentEntreprise : null,
    })
  }

  return (
    <LayoutAuth
      titre="Créer un compte"
      sousTitre="Rejoignez HR-COWORKING et réservez votre espace."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Type de compte */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[13.5px] font-semibold text-encre">
            Type de compte <span className="text-violet">*</span>
          </span>
          <div className="grid grid-cols-2 gap-3">
            {[
              { valeur: 'freelance', libelle: 'Freelance', desc: 'Un seul bureau' },
              { valeur: 'entreprise', libelle: 'Entreprise', desc: 'Plusieurs bureaux' },
            ].map((t) => (
              <button
                key={t.valeur}
                type="button"
                onClick={() => setTypeCompte(t.valeur)}
                className={`flex flex-col items-start rounded-lg border p-4 text-left transition-all ${
                  typeCompte === t.valeur
                    ? 'border-violet bg-lavande'
                    : 'border-ligne bg-white hover:border-violet/40'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`h-4 w-4 rounded-full border-2 transition-colors ${
                      typeCompte === t.valeur
                        ? 'border-violet bg-violet'
                        : 'border-ardoise/40 bg-white'
                    }`}
                  />
                  <span className="text-[13.5px] font-semibold">{t.libelle}</span>
                </span>
                <span className="mt-1 pl-6 text-[11.5px] text-ardoise">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Nom + Prénom */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ChampTexte
            label="Nom"
            nom="nom"
            placeholder="Doe"
            autoComplete="family-name"
            register={register}
            erreur={errors.nom}
            obligatoire
            {...register('nom', { required: 'Le nom est obligatoire.' })}
          />
          <ChampTexte
            label="Prénom"
            nom="prenom"
            placeholder="Jane"
            autoComplete="given-name"
            register={register}
            erreur={errors.prenom}
            obligatoire
            {...register('prenom', { required: 'Le prénom est obligatoire.' })}
          />
        </div>

        {/* Email */}
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
            required: "L'e-mail est obligatoire.",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Format d'e-mail invalide.",
            },
          })}
        />

        {/* Téléphone */}
        <ChampTexte
          label="Téléphone"
          nom="telephone"
          type="tel"
          placeholder="600000000"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={9}
          register={register}
          erreur={errors.telephone}
          {...register('telephone', {
            pattern: {
              value: /^[0-9]{9}$/,
              message: 'Le numéro doit comporter 9 chiffres.',
            },
            minLength: {
              value: 9,
              message: 'Le numéro doit comporter 9 chiffres.',
            },
            maxLength: {
              value: 9,
              message: 'Le numéro ne doit pas dépasser 9 chiffres.',
            },
          })}
        />

        {/* Mot de passe */}
        <ChampTexte
          label="Mot de passe"
          nom="mot_de_passe"
          type="password"
          placeholder="Minimum 8 caractères"
          autoComplete="new-password"
          register={register}
          erreur={errors.mot_de_passe}
          obligatoire
          {...register('mot_de_passe', {
            required: 'Le mot de passe est obligatoire.',
            minLength: { value: 8, message: 'Minimum 8 caractères.' },
          })}
        />

        <ChampTexte
          label="Confirmer le mot de passe"
          nom="mot_de_passe_confirmation"
          type="password"
          placeholder="Ressaisissez votre mot de passe"
          autoComplete="new-password"
          register={register}
          erreur={errors.mot_de_passe_confirmation}
          obligatoire
          {...register('mot_de_passe_confirmation', {
            required: 'La confirmation du mot de passe est obligatoire.',
            validate: (valeur) => valeur === motDePasse || 'Les mots de passe ne correspondent pas.',
          })}
        />

        {/* Champs entreprise (conditionnels) */}
        {typeCompte === 'entreprise' && (
          <>
            <div className="h-px bg-ligne" />
            <p className="text-[13px] font-semibold text-ardoise">
              Informations entreprise
            </p>

            <ChampTexte
              label="Nom de l'entreprise"
              nom="nom_entreprise"
              placeholder="ACME SARL"
              register={register}
              erreur={errors.nom_entreprise}
              obligatoire
              {...register('nom_entreprise', {
                required: typeCompte === 'entreprise'
                  ? "Le nom de l'entreprise est obligatoire."
                  : false,
              })}
            />

            <ChampFichier
              label="Document entreprise"
              nom="document_entreprise"
              description="RCCM, statuts ou tout justificatif d'existence légale"
              onChange={setDocumentEntreprise}
              obligatoire
            />
          </>
        )}

        {/* Séparateur documents */}
        <div className="h-px bg-ligne" />
        <p className="text-[13px] font-semibold text-ardoise">
          Pièce d'identité
        </p>

        {/* CNI */}
        <ChampFichier
          label="Carte Nationale d'Identité"
          nom="cni"
          description="CNI recto-verso ou passeport — PDF, JPG, PNG, max 5 Mo"
          onChange={setCni}
          obligatoire
        />

        {/* Mentions légales */}
        <p className="text-[12px] leading-relaxed text-ardoise">
          En créant un compte, vous acceptez nos{' '}
          <a href="#" className="text-violet hover:underline">
            conditions d'utilisation
          </a>{' '}
          et notre{' '}
          <a href="#" className="text-violet hover:underline">
            politique de confidentialité
          </a>
          . Vos documents seront validés par un administrateur sous 24h.
        </p>

        <BoutonSoumission
          libelle="Créer mon compte"
          libelleChargement="Création du compte…"
          chargement={isPending}
        />

        <p className="text-center text-[13.5px] text-ardoise">
          Déjà un compte ?{' '}
          <Link
            to="/connexion"
            className="font-semibold text-violet hover:text-violet-fonce"
          >
            Se connecter
          </Link>
        </p>
      </form>
    </LayoutAuth>
  )
}
