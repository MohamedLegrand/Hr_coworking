import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SalleCoworking3D from '../../composants/widgets/SalleCoworking3D'
import ModaleCguKyc from '../../composants/communs/ModaleCguKyc'
import { useCreerReservation } from '../../hooks/useReservations'
import { useProfilComplet } from '../../hooks/useUtilisateurs'
import { useToast } from '../../contexte/ToastContext'
import { getErrorMessage, getErrorTitle } from '../../utilitaires/erreurs'

export default function PageSelectionBureaux() {
  const [reservationEnAttente, setReservationEnAttente] = useState(null)
  const creerReservation = useCreerReservation()
  const { data: profil } = useProfilComplet()
  const { error: toastError } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (creerReservation.isError) {
      toastError(getErrorTitle(creerReservation.error), getErrorMessage(creerReservation.error))
    }
  }, [creerReservation.isError, creerReservation.error, toastError])

  const reserver = (payload) => {
    creerReservation.mutate(payload, {
      onSuccess: (reservationCreee) => setReservationEnAttente(reservationCreee),
    })
  }

  return (
    <div className="pb-16">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet">Espaces</p>
        <h1 className="mt-3 font-titre text-[clamp(24px,3vw,34px)] font-bold tracking-tight text-encre">
          Choisissez vos bureaux
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ardoise">
          Cliquez sur un bureau disponible pour le sélectionner, choisissez votre gamme, votre
          forfait et votre date, puis confirmez le récapitulatif.
        </p>
      </div>

      <SalleCoworking3D
        typeCompteUtilisateur={profil?.type_compte}
        onReserver={reserver}
        chargement={creerReservation.isPending}
      />

      {reservationEnAttente && (
        <ModaleCguKyc
          reservationId={reservationEnAttente.id}
          profil={profil}
          onFermer={() => setReservationEnAttente(null)}
          onValide={() => navigate(`/paiements?reservation=${reservationEnAttente.id}`)}
        />
      )}
    </div>
  )
}
