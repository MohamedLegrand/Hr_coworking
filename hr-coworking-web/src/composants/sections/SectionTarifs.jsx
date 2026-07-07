import { Link } from 'react-router-dom'
import { Check, Fleche } from '../communs/Icones'
import { formatFcfa } from '../../utilitaires/format'

const FORMULES = [
  {
    nom: 'À l\'heure',
    montant: 2500,
    unite: 'heure',
    description: 'Pour un rendez-vous ponctuel ou une session de travail courte.',
    avantages: [
      'Accès open space',
      'Wifi fibre haut débit',
      'Café & thé illimités',
      '1h de salle de réunion offerte',
    ],
    populaire: false,
  },
  {
    nom: 'À la journée',
    montant: 15000,
    unite: 'jour',
    description: 'Une journée complète de productivité, sans engagement.',
    avantages: [
      'Bureau privé au choix',
      'Wifi fibre haut débit',
      'Disponible 5 jours sur 7',
      'Casier sécurisé',
      'Impressions incluses',
    ],
    populaire: true,
  },
  {
    nom: 'Au mois',
    montant: 180000,
    unite: 'mois',
    description: 'Pour les équipes et freelances installés durablement.',
    avantages: [
      'Bureau dédié',
      'Domiciliation d\'entreprise',
      'Salles de réunion illimitées',
      'Cuisine équipée pour le café',
      'Réductions événements',
    ],
    populaire: false,
  },
]

export default function SectionTarifs() {
  return (
    <section id="tarifs" className="mx-auto max-w-[1240px] scroll-mt-[74px] px-4 py-20 sm:px-7">

      <div className="mb-3.5 text-center">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-violet">
          <Check width={16} height={16} /> Nos tarifs
        </span>
      </div>
      <h2 className="mx-auto mb-2 max-w-[640px] text-center font-titre text-[clamp(30px,4vw,46px)] font-bold leading-tight tracking-tight">
        Une formule pour chaque façon de travailler
      </h2>
      <p className="mx-auto mb-12 max-w-[520px] text-center text-[15.5px] text-ardoise">
        Tarifs simples et transparents, sans frais cachés. Changez de formule à tout moment.
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {FORMULES.map((f) => (
          <div
            key={f.nom}
            className={`flex flex-col rounded-2xl border p-8 ${
              f.populaire
                ? 'border-violet bg-violet text-white shadow-[0_22px_48px_rgba(124,58,237,.28)] md:-translate-y-3'
                : 'border-ligne bg-white text-encre'
            }`}
          >
            {f.populaire && (
              <span className="mb-4 inline-flex w-fit items-center rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide">
                Le plus populaire
              </span>
            )}

            <h3 className="font-titre text-xl font-semibold">{f.nom}</h3>
            <p className={`mt-2 text-sm leading-relaxed ${f.populaire ? 'text-white/80' : 'text-ardoise'}`}>
              {f.description}
            </p>

            <div className="mb-6 mt-6 flex items-end gap-1.5">
              <span className="font-titre text-[36px] font-bold leading-none">
                {formatFcfa(f.montant)}
              </span>
              <span className={`pb-1 text-[13px] ${f.populaire ? 'text-white/70' : 'text-ardoise'}`}>
                /{f.unite}
              </span>
            </div>

            <div className={`mb-8 h-px ${f.populaire ? 'bg-white/20' : 'bg-ligne'}`} />

            <div className="mb-8 flex flex-1 flex-col gap-3">
              {f.avantages.map((a) => (
                <div key={a} className="flex items-center gap-2.5 text-sm font-medium">
                  <Check width={16} height={16} className="flex-none" />
                  {a}
                </div>
              ))}
            </div>

            <Link
              to="/connexion"
              className={`inline-flex items-center justify-center gap-2.5 rounded-md px-6 py-3.5 text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                f.populaire
                  ? 'bg-white text-violet hover:bg-white/90'
                  : 'bg-violet text-white hover:bg-violet-fonce'
              }`}
            >
              Choisir cette formule
              <Fleche width={15} height={15} />
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
