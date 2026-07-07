import { Link } from 'react-router-dom'
import { Fleche, Check } from '../communs/Icones'

const IMG_HERO = '/images/hero/hero-section.jpg'

export default function Hero() {
  return (
    <header id="accueil" className="relative scroll-mt-[74px]">
      <div className="relative flex min-h-[560px] items-center overflow-hidden">
        <img src={IMG_HERO} alt="Espace de coworking" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(15,10,25,.82)] via-[rgba(15,10,25,.5)] to-[rgba(15,10,25,.12)]" />
        <div className="relative mx-auto w-full max-w-[1240px] px-4 sm:px-7">
          <div className="max-w-[600px] animate-monter">
            <div className="mb-5 flex items-center gap-2.5 text-white">
              <span className="grid h-[26px] w-[26px] place-items-center rounded-full bg-violet">
                <Check width={14} height={14} />
              </span>
              <span className="text-[15px] font-semibold">Bienvenue chez HR-COWORKING</span>
            </div>
            <h1 className="font-titre text-[clamp(44px,6vw,74px)] font-bold leading-[1.02] tracking-tight text-white">
              Espace de<br />coworking<br />confortable.
            </h1>
            <p className="mb-7 mt-6 max-w-[440px] text-[17px] leading-relaxed text-white/80">
              Bureaux privés, open spaces et salles de réunion premium à Yaoundé.
              Réservez à la journée, à l'heure ou au mois.
            </p>
            <Link
              to="/connexion"
              className="inline-flex items-center gap-2.5 rounded-md bg-violet px-7 py-4 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-violet-fonce"
            >
              Réserver une visite
              <Fleche width={16} height={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Encart statistique flottant */}
      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-7">
        <div className="relative mt-8 flex flex-col gap-4 rounded-[2rem] border border-ligne bg-white/95 p-4 shadow-[0_20px_50px_rgba(20,16,25,.08)] sm:absolute sm:-bottom-[38px] sm:right-7 sm:flex-row sm:p-0 sm:bg-transparent sm:border-none sm:shadow-none">
          <div className="flex items-center gap-4 rounded-2xl bg-white px-6 py-5 text-center sm:min-w-[220px] sm:rounded-l-xl sm:text-left">
            <span className="font-titre text-[34px] font-bold leading-none">
              120<span className="text-violet">+</span>
            </span>
            <span className="text-[13px] leading-tight text-ardoise">espaces<br />disponibles</span>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-violet px-6 py-5 text-center sm:min-w-[220px] sm:rounded-r-xl sm:text-left">
            <span className="font-titre text-[34px] font-bold leading-none text-white">4.9</span>
            <span className="text-[13px] leading-tight text-white/85">note<br />moyenne</span>
          </div>
        </div>
      </div>
    </header>
  )
}
