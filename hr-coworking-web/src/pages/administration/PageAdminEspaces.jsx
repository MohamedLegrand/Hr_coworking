import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useEspacesAdmin, useCreerEspace, useModifierEspace, useSupprimerEspace } from '../../hooks/useEspaces'
import { useCreerReservation } from '../../hooks/useReservations'
import { useToast } from '../../contexte/ToastContext'
import Modale from '../../composants/communs/Modale'
import ChampTexte from '../../composants/communs/ChampTexte'
import ChampFichier from '../../composants/communs/ChampFichier'
import BoutonSoumission from '../../composants/communs/BoutonSoumission'
import ImageEspace from '../../composants/communs/ImageEspace'
import AlerteErreur from '../../composants/communs/AlerteErreur'
import SalleCoworking3D from '../../composants/widgets/SalleCoworking3D'
import { Plus, Crayon, Corbeille, Fleche } from '../../composants/communs/Icones'
import { formatFcfa, libelleType, prixAffichage, LIBELLES_TYPE } from '../../utilitaires/format'
import { getErrorMessage, getErrorTitle } from '../../utilitaires/erreurs'

function demainISO() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

const VALEURS_PAR_DEFAUT = {
  nom: '',
  type_espace: 'bureau_individuel',
  capacite: 1,
  localisation: '',
  prix_jour: '',
  prix_heure: '',
}

export default function PageAdminEspaces() {
  const { data: espaces = [], isLoading, error } = useEspacesAdmin()
  const creer = useCreerEspace()
  const modifier = useModifierEspace()
  const supprimer = useSupprimerEspace()
  const creerReservation = useCreerReservation()
  const { error: toastError } = useToast()
  const navigate = useNavigate()

  const [modaleOuverte, setModaleOuverte] = useState(false)
  const [espaceEnEdition, setEspaceEnEdition] = useState(null)
  const [image, setImage] = useState(null)
  const [bureauxChoisis, setBureauxChoisis] = useState([])

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: VALEURS_PAR_DEFAUT,
  })

  const ouvrirCreation = () => {
    setEspaceEnEdition(null)
    setImage(null)
    reset(VALEURS_PAR_DEFAUT)
    setModaleOuverte(true)
  }

  const ouvrirEdition = (espace) => {
    setEspaceEnEdition(espace)
    setImage(null)
    reset({
      nom: espace.nom,
      type_espace: espace.type_espace,
      capacite: espace.capacite,
      localisation: espace.localisation || '',
      prix_jour: espace.prix_jour ?? '',
      prix_heure: espace.prix_heure ?? '',
    })
    setModaleOuverte(true)
  }

  const mutationActive = espaceEnEdition ? modifier : creer

  const onSubmit = (valeurs) => {
    const payload = {
      ...valeurs,
      capacite: Number(valeurs.capacite),
      prix_jour: valeurs.prix_jour === '' ? null : Number(valeurs.prix_jour),
      prix_heure: valeurs.prix_heure === '' ? null : Number(valeurs.prix_heure),
      image,
    }

    if (espaceEnEdition) {
      modifier.mutate(
        { espaceId: espaceEnEdition.id, espace: payload },
        { onSuccess: () => setModaleOuverte(false) },
      )
    } else {
      creer.mutate(
        { ...payload, est_disponible: true },
        { onSuccess: () => setModaleOuverte(false) },
      )
    }
  }

  const basculerDisponibilite = (espace) => {
    modifier.mutate({ espaceId: espace.id, espace: { est_disponible: !espace.est_disponible } })
  }

  const supprimerAvecConfirmation = (espace) => {
    if (window.confirm(`Supprimer définitivement « ${espace.nom} » ?`)) {
      supprimer.mutate(espace.id)
    }
  }

  const espacesChoisis = bureauxChoisis.filter((b) => b.espace).map((b) => b.espace)
  const totalChoisi = espacesChoisis.reduce((s, e) => s + (prixAffichage(e).montant || 0), 0)

  const reserverDepuisLaVue3D = () => {
    const debut = new Date(`${demainISO()}T09:00:00`)
    const fin = new Date(debut)
    fin.setDate(fin.getDate() + 1)
    const details = espacesChoisis.map((espace) => ({
      espace_id: espace.id,
      date_debut: debut.toISOString(),
      date_fin: fin.toISOString(),
    }))
    creerReservation.mutate(details, {
      onSuccess: (reservationCreee) => {
        setBureauxChoisis([])
        navigate(`/administration/checkout?reservation=${reservationCreee.id}`)
      },
      onError: (err) => toastError(getErrorTitle(err), getErrorMessage(err)),
    })
  }

  return (
    <div className="pb-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet">Administration</p>
          <h1 className="mt-3 font-titre text-[clamp(24px,3vw,34px)] font-bold tracking-tight text-encre">
            Gérer les bureaux
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ardoise">
            Créez, modifiez ou retirez des espaces du catalogue, et basculez leur disponibilité.
          </p>
        </div>
        <button
          type="button"
          onClick={ouvrirCreation}
          className="inline-flex flex-none items-center justify-center gap-2 self-start rounded-md bg-violet px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-violet-fonce"
        >
          <Plus width={16} height={16} />
          Ajouter un bureau
        </button>
      </div>

      {error && <div className="mb-6"><AlerteErreur erreur={error} /></div>}
      {supprimer.isError && <div className="mb-6"><AlerteErreur erreur={supprimer.error} /></div>}

      {/* Vue 3D du plan de salle — identique à celle de l'espace client, avec sélection et réservation */}
      <div className="mb-8">
        <h2 className="mb-4 font-titre text-lg font-semibold tracking-tight text-encre">
          Vue 3D du plan de salle
        </h2>
        <SalleCoworking3D onSelection={setBureauxChoisis} />

        {espacesChoisis.length > 0 && (
          <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-ligne bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-encre">
                {espacesChoisis.length} bureau{espacesChoisis.length > 1 ? 'x' : ''} sélectionné{espacesChoisis.length > 1 ? 's' : ''}
              </p>
              <p className="mt-1 text-sm text-ardoise">
                Total estimé : <span className="font-semibold text-violet">{formatFcfa(totalChoisi)}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={reserverDepuisLaVue3D}
              disabled={creerReservation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-violet px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-violet-fonce disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creerReservation.isPending ? 'Envoi…' : 'Réserver ces bureaux'}
              <Fleche width={16} height={16} />
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-lavande" />)
        ) : espaces.length === 0 ? (
          <div className="rounded-2xl border border-ligne bg-white p-10 text-center text-sm text-ardoise sm:col-span-2 lg:col-span-3">
            Aucun bureau enregistré pour le moment.
          </div>
        ) : (
          espaces.map((espace) => (
            <div key={espace.id} className="overflow-hidden rounded-2xl border border-ligne bg-white">
              <div className="relative h-52 bg-lavande">
                <ImageEspace espace={espace} className="h-full w-full object-contain p-3" />
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10.5px] font-bold text-violet">
                  {libelleType(espace.type_espace)}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-titre text-[15px] font-semibold text-encre">{espace.nom}</p>
                  <div className="flex flex-none items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => ouvrirEdition(espace)}
                      aria-label={`Modifier ${espace.nom}`}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-ligne text-ardoise transition hover:border-violet hover:text-violet"
                    >
                      <Crayon width={14} height={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => supprimerAvecConfirmation(espace)}
                      aria-label={`Supprimer ${espace.nom}`}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-ligne text-ardoise transition hover:border-red-400 hover:text-red-600"
                    >
                      <Corbeille width={14} height={14} />
                    </button>
                  </div>
                </div>

                <p className="mt-1 text-[12.5px] text-ardoise">{espace.localisation || 'Yaoundé'} · {espace.capacite} pl.</p>

                <div className="mt-3 flex items-center justify-between">
                  <span className="font-titre text-[16px] font-bold text-violet">
                    {formatFcfa(prixAffichage(espace).montant)}
                    <span className="text-[11px] font-normal text-ardoise"> /{prixAffichage(espace).unite}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => basculerDisponibilite(espace)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                      espace.est_disponible
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {espace.est_disponible ? 'Disponible' : 'Indisponible'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {modaleOuverte && (
        <Modale
          titre={espaceEnEdition ? 'Modifier le bureau' : 'Ajouter un bureau'}
          onFermer={() => setModaleOuverte(false)}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <AlerteErreur erreur={mutationActive.error} />

            <ChampTexte
              label="Nom du bureau"
              nom="nom"
              placeholder="Bureau Kilimandjaro"
              register={register}
              erreur={errors.nom}
              obligatoire
              {...register('nom', { required: 'Le nom est obligatoire.' })}
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="type_espace" className="text-[13.5px] font-semibold text-encre">
                Type d'espace <span className="text-violet">*</span>
              </label>
              <select
                id="type_espace"
                {...register('type_espace', { required: true })}
                className="h-11 w-full rounded-lg border border-ligne bg-white px-4 text-[14.5px] text-encre outline-none transition-colors focus:border-violet focus:ring-2 focus:ring-violet/15"
              >
                {Object.entries(LIBELLES_TYPE).map(([valeur, libelle]) => (
                  <option key={valeur} value={valeur}>{libelle}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ChampTexte
                label="Capacité (places)"
                nom="capacite"
                type="number"
                min={1}
                register={register}
                erreur={errors.capacite}
                obligatoire
                {...register('capacite', { required: 'Obligatoire.', min: { value: 1, message: 'Minimum 1.' } })}
              />
              <ChampTexte
                label="Localisation"
                nom="localisation"
                placeholder="Yaoundé"
                register={register}
                erreur={errors.localisation}
                {...register('localisation')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ChampTexte
                label="Prix / jour (FCFA)"
                nom="prix_jour"
                type="number"
                min={0}
                register={register}
                erreur={errors.prix_jour}
                {...register('prix_jour')}
              />
              <ChampTexte
                label="Prix / heure (FCFA)"
                nom="prix_heure"
                type="number"
                min={0}
                register={register}
                erreur={errors.prix_heure}
                {...register('prix_heure')}
              />
            </div>

            <ChampFichier
              label="Photo du bureau"
              nom="image"
              description="JPG, PNG — remplace la photo actuelle si fournie"
              onChange={setImage}
            />

            <BoutonSoumission
              libelle={espaceEnEdition ? 'Enregistrer les modifications' : 'Créer le bureau'}
              libelleChargement="Enregistrement…"
              chargement={mutationActive.isPending}
            />
          </form>
        </Modale>
      )}
    </div>
  )
}
