import { useState, useEffect, useRef } from 'react'

// Séquence : [lettre, délai avant cette lettre en ms]
const SEQUENCE = [
  ['H', 120],
  ['R', 120],
  ['-', 300],
  ['C', 110],
  ['O', 100],
  ['W', 100],
  ['O', 100],
  ['R',  90],
  ['K',  90],
  ['I',  90],
  ['N',  90],
  ['G',  90],
]

const DELAI_DEBUT_FRAPPE   = 900   // ms avant que la 1ère lettre apparaisse
const PAUSE_APRES_FRAPPE   = 700   // ms de clignotement après la dernière lettre
const DUREE_FONDU_SORTIE   = 600   // ms de fade out

export default function SplashScreen({ onTermine }) {
  const [logoVisible,   setLogoVisible]   = useState(false)
  const [texteTape,     setTexteTape]     = useState('')
  const [curseurActif,  setCurseurActif]  = useState(false)
  const [taglineVis,    setTaglineVis]    = useState(false)
  const [fonduSortie,   setFonduSortie]   = useState(false)
  const timers = useRef([])

  const add = (fn, ms) => {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
    return id
  }

  useEffect(() => {
    // Logo monte 100ms après le montage
    add(() => setLogoVisible(true), 100)

    // Début de la frappe
    let cumul = DELAI_DEBUT_FRAPPE
    add(() => setCurseurActif(true), cumul - 80)

    SEQUENCE.forEach(([lettre, delai]) => {
      cumul += delai
      add(() => setTexteTape((p) => p + lettre), cumul)
    })

    // Après la dernière lettre
    const frappeTerminee = cumul

    // Tagline apparaît
    add(() => setTaglineVis(true), frappeTerminee + 200)

    // Curseur s'arrête + fondu de sortie
    add(() => {
      setCurseurActif(false)
      add(() => {
        setFonduSortie(true)
        add(onTermine, DUREE_FONDU_SORTIE)
      }, PAUSE_APRES_FRAPPE)
    }, frappeTerminee + PAUSE_APRES_FRAPPE)

    return () => timers.current.forEach(clearTimeout)
  }, [])

  // Découpe le texte tapé en 3 parties
  const hr    = texteTape.slice(0, 2)
  const tiret = texteTape.slice(2, 3)
  const reste = texteTape.slice(3)

  // Progression (0 → 1) pour la barre
  const progression = texteTape.length / SEQUENCE.length

  return (
    <div
      role="status"
      aria-label="Chargement HR-COWORKING"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-encre via-violet-fonce/25 to-encre font-corps transition-opacity ease-in-out ${
        fonduSortie ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ transitionDuration: `${DUREE_FONDU_SORTIE}ms` }}
    >

      {/* Halo d'ambiance — dégradé violet clair centré */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)',
        }}
      />

      {/* Lueur douce en bas — teinte lavande, très subtile */}
      <div
        className="pointer-events-none absolute -bottom-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(244,240,252,0.08) 0%, transparent 70%)',
        }}
      />

      {/* ───── Logo ───── */}
      <div
        className={`relative z-10 transition-all duration-700 ease-out ${
          logoVisible
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-75 translate-y-5'
        }`}
      >
        {/* Ring pulse — une seule fois */}
        <span className="absolute inset-0 rounded-full bg-violet animate-ring-pulse" />

        {/* Cercle logo */}
        <span className="relative grid h-28 w-28 place-items-center overflow-hidden rounded-full shadow-[0_0_64px_rgba(124,58,237,0.55)] sm:h-32 sm:w-32">
          <img
            src="/images/logo.jpeg"
            alt="HR-COWORKING"
            className="h-full w-full object-cover"
          />
        </span>
      </div>

      {/* ───── Texte typewriter ───── */}
      <div
        className={`relative z-10 mt-8 flex items-baseline font-titre font-bold tracking-[0.10em] transition-all duration-500 ${
          logoVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          fontSize: 'clamp(30px, 5.5vw, 52px)',
          transitionDelay: logoVisible ? '200ms' : '0ms',
        }}
      >
        <span className="text-white">{hr}</span>
        <span className="text-violet">{tiret}</span>
        <span className="text-white">{reste}</span>

        {/* Curseur clignotant */}
        {curseurActif && (
          <span
            className="ml-[3px] inline-block text-violet animate-clignote"
            style={{ lineHeight: 1 }}
            aria-hidden="true"
          >
            |
          </span>
        )}
      </div>

      {/* ───── Tagline ───── */}
      <p
        className={`relative z-10 mt-4 font-corps text-[13px] font-medium uppercase tracking-[0.28em] text-white/35 transition-all duration-700 ${
          taglineVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        Espace de coworking premium
      </p>

      {/* ───── Barre de progression ───── */}
      <div className="absolute bottom-10 left-1/2 z-10 h-[2px] w-24 -translate-x-1/2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-violet transition-all ease-linear"
          style={{
            width: `${Math.max(8, Math.round(progression * 100))}%`,
            transitionDuration: logoVisible ? '150ms' : '800ms',
          }}
        />
      </div>
    </div>
  )
}
