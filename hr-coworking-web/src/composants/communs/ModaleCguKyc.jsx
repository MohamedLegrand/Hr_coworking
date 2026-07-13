import { useState } from 'react'
import Modale from './Modale'
import ChampFichier from './ChampFichier'
import BoutonSoumission from './BoutonSoumission'
import { Boucliers } from './Icones'
import { useValiderCguKyc } from '../../hooks/useReservations'
import { useToast } from '../../contexte/ToastContext'
import { getErrorMessage, getErrorTitle } from '../../utilitaires/erreurs'

const CONDITIONS = [
  "Respecter le matériel mis à disposition (bureaux, écrans, chaises, équipements informatiques).",
  "Ne pas détériorer, démonter ou sortir le matériel de l'espace sans autorisation préalable.",
  "Respecter le règlement intérieur de l'espace de coworking.",
  "Respecter les horaires réservés et libérer l'espace à l'heure prévue.",
  "Adopter un comportement respectueux envers les autres membres et le personnel.",
  "Signaler immédiatement tout dommage ou dysfonctionnement constaté.",
  "Accepter d'être tenu responsable de toute dégradation causée par négligence.",
]

/**
 * Étape obligatoire avant le paiement d'une réservation précise (étape 7
 * du parcours) : acceptation des CGU — tracée sur CETTE réservation,
 * horodatée — puis dépôt des documents KYC si manquants ou refusés
 * (document_statut === 'invalide'). Si les documents sont déjà valides ou
 * en attente de validation, l'étape KYC est sautée.
 */
export default function ModaleCguKyc({ reservationId, profil, onValide, onFermer }) {
  const estEntreprise = profil?.type_compte === 'entreprise'
  const documentsRefuses = profil?.document_statut === 'invalide'
  const besoinCni = !profil?.cni_url || documentsRefuses
  const besoinDocEntreprise = estEntreprise && (!profil?.document_entreprise_url || documentsRefuses)
  const besoinKyc = besoinCni || besoinDocEntreprise

  const [etape, setEtape] = useState('cgu')
  const [accepte, setAccepte] = useState(false)
  const [cni, setCni] = useState(null)
  const [documentEntreprise, setDocumentEntreprise] = useState(null)
  const [erreur, setErreur] = useState('')

  const { mutate, isPending } = useValiderCguKyc()
  const { error: toastError } = useToast()

  const valider = (cniFichier, documentEntrepriseFichier) => {
    mutate(
      { reservationId, cguAcceptees: true, cni: cniFichier, documentEntreprise: documentEntrepriseFichier },
      {
        onSuccess: () => onValide?.(),
        onError: (err) => toastError(getErrorTitle(err), getErrorMessage(err), 5000),
      }
    )
  }

  const soumettreCgu = (e) => {
    e.preventDefault()
    setErreur('')

    if (!accepte) {
      setErreur('Vous devez accepter les conditions pour continuer.')
      return
    }

    if (besoinKyc) {
      setEtape('kyc')
    } else {
      valider(null, null)
    }
  }

  const soumettreKyc = (e) => {
    e.preventDefault()
    setErreur('')

    if (besoinCni && !cni) {
      setErreur('La photo de votre CNI est obligatoire.')
      return
    }
    if (besoinDocEntreprise && !documentEntreprise) {
      setErreur("Le document justificatif de l'entreprise est obligatoire.")
      return
    }

    valider(cni, documentEntreprise)
  }

  if (etape === 'kyc') {
    return (
      <Modale titre="Vérification d'identité" onFermer={onFermer}>
        <form onSubmit={soumettreKyc} className="flex flex-col gap-5">
          <div className="flex items-start gap-3 rounded-xl border border-ligne bg-lavande/60 p-4">
            <span className="mt-0.5 grid h-9 w-9 flex-none place-items-center rounded-full bg-white text-violet">
              <Boucliers width={18} height={18} />
            </span>
            <p className="text-[13px] leading-relaxed text-ardoise">
              {documentsRefuses
                ? "Un ou plusieurs de vos documents ont été refusés : merci de les soumettre à nouveau."
                : "Conditions acceptées. Il ne reste plus qu'à déposer vos documents d'identification."}
            </p>
          </div>

          {besoinCni && (
            <ChampFichier
              label="Photo de la CNI"
              nom="cni_reservation"
              description="CNI recto-verso ou passeport — PDF, JPG, PNG, max 5 Mo"
              onChange={setCni}
              obligatoire
            />
          )}

          {besoinDocEntreprise && (
            <ChampFichier
              label="Document entreprise"
              nom="document_entreprise_reservation"
              description="RCCM, statuts ou tout justificatif d'existence légale"
              onChange={setDocumentEntreprise}
              obligatoire
            />
          )}

          {erreur && (
            <p className="text-[12.5px] font-medium text-red-600">{erreur}</p>
          )}

          <BoutonSoumission
            libelle="Continuer vers le paiement"
            libelleChargement="Validation…"
            chargement={isPending}
          />

          <button
            type="button"
            onClick={() => setEtape('cgu')}
            className="text-center text-[12.5px] font-semibold text-ardoise hover:text-encre"
          >
            Retour
          </button>
        </form>
      </Modale>
    )
  }

  return (
    <Modale titre="Avant de payer" onFermer={onFermer}>
      <form onSubmit={soumettreCgu} className="flex flex-col gap-5">
        <div className="flex items-start gap-3 rounded-xl border border-ligne bg-lavande/60 p-4">
          <span className="mt-0.5 grid h-9 w-9 flex-none place-items-center rounded-full bg-white text-violet">
            <Boucliers width={18} height={18} />
          </span>
          <p className="text-[13px] leading-relaxed text-ardoise">
            Merci de lire et d'accepter les conditions ci-dessous avant de finaliser le paiement
            de cette réservation.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[13.5px] font-semibold text-encre">
            Conditions d'utilisation de l'espace
          </span>
          <ul className="max-h-48 overflow-y-auto rounded-lg border border-ligne bg-white p-4">
            {CONDITIONS.map((condition, index) => (
              <li
                key={index}
                className="flex gap-2.5 py-1.5 text-[13px] leading-relaxed text-ardoise"
              >
                <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-violet" />
                {condition}
              </li>
            ))}
          </ul>
        </div>

        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={accepte}
            onChange={(e) => setAccepte(e.target.checked)}
            className="mt-0.5 h-4 w-4 flex-none accent-violet"
          />
          <span className="text-[13.5px] leading-relaxed text-encre">
            J'ai lu et j'accepte les conditions d'utilisation de l'espace de coworking pour cette réservation.
          </span>
        </label>

        {erreur && (
          <p className="text-[12.5px] font-medium text-red-600">{erreur}</p>
        )}

        <BoutonSoumission
          libelle={besoinKyc ? 'Continuer' : 'Continuer vers le paiement'}
          libelleChargement="Validation…"
          chargement={isPending}
        />
      </form>
    </Modale>
  )
}
