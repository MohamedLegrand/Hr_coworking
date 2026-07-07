import { Link } from 'react-router-dom'

/**
 * Mise en page partagée pour toutes les pages d'authentification.
 * Colonne gauche : image déco + citation. Colonne droite : formulaire.
 */
export default function LayoutAuth({ children, titre, sousTitre }) {
  return (
    <div className="min-h-screen bg-white font-corps text-encre lg:grid lg:grid-cols-2">

      {/* Colonne gauche — déco (cachée sur mobile) */}
      <div className="relative hidden overflow-hidden bg-encre lg:flex lg:flex-col lg:justify-between lg:p-12">
        <img
          src="/images/hero/coworking.jpg"
          alt="Espace coworking"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5 text-white">
            <img
              src="/images/logo.jpeg"
              alt="HR-COWORKING"
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="font-titre text-[22px] font-bold tracking-tight">HR-COWORKING</span>
          </Link>
        </div>
        <div className="relative z-10">
          <p className="font-titre text-[clamp(26px,2.8vw,34px)] font-bold leading-tight tracking-tight text-white">
            "Un espace de travail<br />qui fait avancer votre<br />business."
          </p>
          <div className="mt-6 flex items-center gap-3">
            <span className="h-px w-8 bg-violet" />
            <span className="text-sm font-semibold text-white/70">HR-COWORKING — Yaoundé</span>
          </div>
        </div>
      </div>

      {/* Colonne droite — formulaire */}
      <div className="flex min-h-screen flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">

        {/* Logo mobile */}
        <div className="mb-8 lg:hidden">
          <Link to="/" className="flex items-center gap-2.5 text-encre">
            <img
              src="/images/logo.jpeg"
              alt="HR-COWORKING"
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="font-titre text-[22px] font-bold tracking-tight">HR-COWORKING</span>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-[440px]">
          {/* En-tête formulaire */}
          <div className="mb-8">
            <h1 className="font-titre text-[clamp(26px,3.5vw,32px)] font-bold leading-tight tracking-tight">
              {titre}
            </h1>
            {sousTitre && (
              <p className="mt-2 text-[15px] leading-relaxed text-ardoise">{sousTitre}</p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
