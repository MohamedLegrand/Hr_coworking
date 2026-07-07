import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SalleCoworking3D from '../../composants/widgets/SalleCoworking3D'
import { useCreerReservation } from '../../hooks/useReservations'
import { useToast } from '../../contexte/ToastContext'
import { Fleche } from '../../composants/communs/Icones'
import { formatFcfa, prixAffichage } from '../../utilitaires/format'
import { getErrorMessage, getErrorTitle } from '../../utilitaires/erreurs'

function demainISO() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

export default function PageSelectionBureaux() {
  const [bureauxChoisis, setBureauxChoisis] = useState([])
  const creerReservation = useCreerReservation()
  const { error: toastError } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (creerReservation.isError) {
      toastError(getErrorTitle(creerReservation.error), getErrorMessage(creerReservation.error))
    }
  }, [creerReservation.isError, creerReservation.error, toastError])

  const espacesChoisis = bureauxChoisis.filter((b) => b.espace).map((b) => b.espace)
  const total = espacesChoisis.reduce((s, e) => s + (prixAffichage(e).montant || 0), 0)

  const reserver = () => {
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
        navigate(`/paiements?reservation=${reservationCreee.id}`)
      },
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
          Survolez un bureau disponible pour le mettre en surbrillance et cliquez pour le
          sélectionner. Vous pouvez en choisir plusieurs.
        </p>
      </div>

      <SalleCoworking3D onSelection={setBureauxChoisis} />

      {espacesChoisis.length > 0 && (
        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-ligne bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-encre">
              {espacesChoisis.length} bureau{espacesChoisis.length > 1 ? 'x' : ''} sélectionné{espacesChoisis.length > 1 ? 's' : ''}
            </p>
            <p className="mt-1 text-sm text-ardoise">
              Total estimé : <span className="font-semibold text-violet">{formatFcfa(total)}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={reserver}
            disabled={creerReservation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-violet px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-violet-fonce disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creerReservation.isPending ? 'Envoi…' : 'Réserver ces bureaux'}
            <Fleche width={16} height={16} />
          </button>
        </div>
      )}
    </div>
  )
}
