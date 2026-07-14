import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  useProfilComplet,
  useModifierProfil,
  useChangerMotDePasse,
  useReuploadDocuments,
} from '../../hooks/useUtilisateurs'
import ChampTexte from '../../composants/communs/ChampTexte'
import ChampFichier from '../../composants/communs/ChampFichier'
import BoutonSoumission from '../../composants/communs/BoutonSoumission'
import AlerteErreur from '../../composants/communs/AlerteErreur'
import { useToast } from '../../contexte/ToastContext'
import { urlDocument } from '../../utilitaires/format'
import { getErrorMessage, getErrorTitle } from '../../utilitaires/erreurs'

const LIBELLES_STATUT_DOCUMENT = {
  valide: { texte: 'Validés', classe: 'bg-emerald-100 text-emerald-700' },
  en_attente: { texte: 'En attente de validation', classe: 'bg-amber-100 text-amber-700' },
  invalide: { texte: 'Refusés — à re-soumettre', classe: 'bg-red-100 text-red-700' },
}

function LienDocument({ href, libelle }) {
  if (!href) {
    return <span className="text-[12.5px] text-ardoise/60">{libelle} — non fourni</span>
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[12.5px] font-semibold text-violet hover:underline"
    >
      Voir {libelle}
    </a>
  )
}

function Carte({ titre, description, children }) {
  return (
    <section className="rounded-2xl border border-ligne bg-white p-6 sm:p-8">
      <h2 className="font-titre text-lg font-semibold text-encre">{titre}</h2>
      {description && <p className="mt-1.5 text-[13.5px] text-ardoise">{description}</p>}
      <div className="mt-6">{children}</div>
    </section>
  )
}

export default function PageProfil() {
  const { data: profil, isLoading } = useProfilComplet()
  const modifierProfil = useModifierProfil()
  const changerMotDePasse = useChangerMotDePasse()
  const reuploadDocuments = useReuploadDocuments()
  const { success: toastSuccess, error: toastError } = useToast()

  const estEntreprise = profil?.type_compte === 'entreprise'

  // ───────── Informations personnelles ─────────
  const {
    register: registerInfos,
    handleSubmit: handleSubmitInfos,
    reset: resetInfos,
    formState: { errors: erreursInfos },
  } = useForm({ defaultValues: { nom: '', prenom: '', telephone: '', nom_entreprise: '' } })

  useEffect(() => {
    if (profil) {
      resetInfos({
        nom: profil.nom,
        prenom: profil.prenom,
        telephone: profil.telephone || '',
        nom_entreprise: profil.nom_entreprise || '',
      })
    }
  }, [profil, resetInfos])

  const onSubmitInfos = (valeurs) => {
    modifierProfil.mutate(valeurs, {
      onSuccess: () => toastSuccess('✅ Profil mis à jour', 'Vos informations ont été enregistrées.'),
      onError: (err) => toastError(getErrorTitle(err), getErrorMessage(err)),
    })
  }

  // ───────── Mot de passe ─────────
  const {
    register: registerMdp,
    handleSubmit: handleSubmitMdp,
    reset: resetMdp,
    watch: watchMdp,
    formState: { errors: erreursMdp },
  } = useForm({ defaultValues: { ancien_mot_de_passe: '', nouveau_mot_de_passe: '', confirmation: '' } })

  const nouveauMdp = watchMdp('nouveau_mot_de_passe')

  const onSubmitMdp = (valeurs) => {
    changerMotDePasse.mutate(
      { ancien_mot_de_passe: valeurs.ancien_mot_de_passe, nouveau_mot_de_passe: valeurs.nouveau_mot_de_passe },
      {
        onSuccess: () => {
          toastSuccess('✅ Mot de passe modifié', 'Votre mot de passe a été mis à jour.')
          resetMdp()
        },
        onError: (err) => toastError(getErrorTitle(err), getErrorMessage(err)),
      }
    )
  }

  // ───────── Documents KYC ─────────
  const [cniRecto, setCniRecto] = useState(null)
  const [cniVerso, setCniVerso] = useState(null)
  const [photoIdentite, setPhotoIdentite] = useState(null)
  const [documentEntreprise, setDocumentEntreprise] = useState(null)
  const [erreurDocuments, setErreurDocuments] = useState('')

  const soumettreDocuments = (e) => {
    e.preventDefault()
    setErreurDocuments('')

    if (!cniRecto && !cniVerso && !photoIdentite && !documentEntreprise) {
      setErreurDocuments('Sélectionnez au moins un document à envoyer.')
      return
    }

    reuploadDocuments.mutate(
      { cniRecto, cniVerso, photoIdentite, documentEntreprise },
      {
        onSuccess: () => {
          toastSuccess('✅ Documents envoyés', 'Ils seront examinés par notre équipe sous peu.')
          setCniRecto(null)
          setCniVerso(null)
          setPhotoIdentite(null)
          setDocumentEntreprise(null)
        },
        onError: (err) => toastError(getErrorTitle(err), getErrorMessage(err)),
      }
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        {[1, 2, 3].map((i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-lavande" />)}
      </div>
    )
  }

  const statutDocument = LIBELLES_STATUT_DOCUMENT[profil?.document_statut] || LIBELLES_STATUT_DOCUMENT.en_attente

  return (
    <div className="pb-16">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet">Mon compte</p>
        <h1 className="mt-3 font-titre text-[clamp(24px,3vw,34px)] font-bold tracking-tight text-encre">
          Paramètres du profil
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ardoise">
          Modifiez vos informations, votre mot de passe, et vos documents d'identification.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <Carte titre="Informations personnelles">
          <form onSubmit={handleSubmitInfos(onSubmitInfos)} className="flex flex-col gap-4">
            <AlerteErreur erreur={modifierProfil.error} />

            <div className="flex flex-col gap-1.5">
              <label className="text-[13.5px] font-semibold text-encre">Adresse e-mail</label>
              <div className="h-11 w-full rounded-lg border border-ligne bg-lavande/40 px-4 text-[14.5px] leading-[44px] text-ardoise">
                {profil?.email}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ChampTexte
                label="Prénom"
                nom="prenom"
                register={registerInfos}
                erreur={erreursInfos.prenom}
                obligatoire
                {...registerInfos('prenom', { required: 'Le prénom est obligatoire.' })}
              />
              <ChampTexte
                label="Nom"
                nom="nom"
                register={registerInfos}
                erreur={erreursInfos.nom}
                obligatoire
                {...registerInfos('nom', { required: 'Le nom est obligatoire.' })}
              />
            </div>

            <ChampTexte
              label="Téléphone"
              nom="telephone"
              type="tel"
              placeholder="699000000"
              register={registerInfos}
              erreur={erreursInfos.telephone}
              {...registerInfos('telephone')}
            />

            {estEntreprise && (
              <ChampTexte
                label="Nom de l'entreprise"
                nom="nom_entreprise"
                register={registerInfos}
                erreur={erreursInfos.nom_entreprise}
                {...registerInfos('nom_entreprise')}
              />
            )}

            <BoutonSoumission
              libelle="Enregistrer les modifications"
              libelleChargement="Enregistrement…"
              chargement={modifierProfil.isPending}
              className="sm:w-fit sm:px-8"
            />
          </form>
        </Carte>

        <Carte titre="Sécurité" description="Changez votre mot de passe.">
          <form onSubmit={handleSubmitMdp(onSubmitMdp)} className="flex flex-col gap-4">
            <AlerteErreur erreur={changerMotDePasse.error} />

            <ChampTexte
              label="Mot de passe actuel"
              nom="ancien_mot_de_passe"
              type="password"
              register={registerMdp}
              erreur={erreursMdp.ancien_mot_de_passe}
              obligatoire
              {...registerMdp('ancien_mot_de_passe', { required: 'Obligatoire.' })}
            />
            <ChampTexte
              label="Nouveau mot de passe"
              nom="nouveau_mot_de_passe"
              type="password"
              register={registerMdp}
              erreur={erreursMdp.nouveau_mot_de_passe}
              obligatoire
              {...registerMdp('nouveau_mot_de_passe', {
                required: 'Obligatoire.',
                minLength: { value: 8, message: 'Minimum 8 caractères.' },
              })}
            />
            <ChampTexte
              label="Confirmer le nouveau mot de passe"
              nom="confirmation"
              type="password"
              register={registerMdp}
              erreur={erreursMdp.confirmation}
              obligatoire
              {...registerMdp('confirmation', {
                required: 'Obligatoire.',
                validate: (valeur) => valeur === nouveauMdp || 'Les mots de passe ne correspondent pas.',
              })}
            />

            <BoutonSoumission
              libelle="Changer le mot de passe"
              libelleChargement="Modification…"
              chargement={changerMotDePasse.isPending}
              className="sm:w-fit sm:px-8"
            />
          </form>
        </Carte>

        <Carte
          titre="Documents d'identification (KYC)"
          description="Photo de la CNI (recto et verso) et photo de vous — utilisées pour vérifier votre identité avant paiement."
        >
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className={`inline-flex rounded-full px-3 py-1.5 text-[11.5px] font-bold ${statutDocument.classe}`}>
              {statutDocument.texte}
            </span>
            <LienDocument href={urlDocument(profil?.cni_recto_url)} libelle="la CNI (recto)" />
            <LienDocument href={urlDocument(profil?.cni_verso_url)} libelle="la CNI (verso)" />
            <LienDocument href={urlDocument(profil?.photo_identite_url)} libelle="la photo" />
            {estEntreprise && (
              <LienDocument href={urlDocument(profil?.document_entreprise_url)} libelle="le document entreprise" />
            )}
          </div>

          <form onSubmit={soumettreDocuments} className="flex flex-col gap-4">
            <AlerteErreur erreur={reuploadDocuments.error} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ChampFichier
                label="Photo de la CNI — recto"
                nom="cni_recto_profil"
                description="Remplace le document actuel si fourni"
                onChange={setCniRecto}
              />
              <ChampFichier
                label="Photo de la CNI — verso"
                nom="cni_verso_profil"
                description="Remplace le document actuel si fourni"
                onChange={setCniVerso}
              />
            </div>
            <ChampFichier
              label="Photo de vous"
              nom="photo_identite_profil"
              description="Remplace la photo actuelle si fournie"
              onChange={setPhotoIdentite}
            />
            {estEntreprise && (
              <ChampFichier
                label="Document entreprise"
                nom="document_entreprise_profil"
                description="RCCM, statuts ou tout justificatif d'existence légale"
                onChange={setDocumentEntreprise}
              />
            )}

            {erreurDocuments && (
              <p className="text-[12.5px] font-medium text-red-600">{erreurDocuments}</p>
            )}

            <p className="text-[12px] text-ardoise">
              L'envoi d'un ou plusieurs documents repasse leur statut en attente de validation.
            </p>

            <BoutonSoumission
              libelle="Envoyer les documents"
              libelleChargement="Envoi…"
              chargement={reuploadDocuments.isPending}
              className="sm:w-fit sm:px-8"
            />
          </form>
        </Carte>
      </div>
    </div>
  )
}
