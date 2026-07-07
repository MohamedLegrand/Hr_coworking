/**
 * Icônes SVG inline — aucune dépendance externe.
 * Chaque composant accepte les props SVG standard.
 */

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  width: 18,
  height: 18,
}

export function Fleche(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function Lieu(props) {
  return (
    <svg {...base} {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export function Cloche(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}

export function Check(props) {
  return (
    <svg {...base} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function Enveloppe(props) {
  return (
    <svg {...base} {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 5L2 7" />
    </svg>
  )
}

export function Telephone(props) {
  return (
    <svg {...base} {...props}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.5-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" />
    </svg>
  )
}

export function Etoile(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" {...props}>
      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

export function Oeil(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" {...props}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function OeilBarre(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" {...props}>
      <path d="M17.94 17.94C16.2 19.12 14.15 20 12 20 5 20 1 12 1 12s2.24-3.8 5.81-6.26" />
      <path d="M22.54 11.88C21.65 7.8 17.84 4 12 4 8.16 4 4.71 5.77 2.53 8.49" />
      <path d="M1 1l22 22" />
    </svg>
  )
}

export function Menu(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" {...props}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  )
}

export function Croix(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" {...props}>
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  )
}

export function Ecran(props) {
  return (
    <svg {...base} {...props}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  )
}

export function Bureau(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M3 10h18M8 4v14" />
    </svg>
  )
}

export function Canape(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 19V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10M4 15h16M8 19v2M16 19v2" />
    </svg>
  )
}

export function Lieu2(props) {
  return (
    <svg {...base} {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export function Flocon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2v20M4 7l16 10M20 7 4 17M2 12h20" />
    </svg>
  )
}

export function CameraSecurite(props) {
  return (
    <svg {...base} {...props}>
      <rect x="2" y="7" width="13" height="8" rx="2" />
      <path d="M15 9.5 22 6v12l-7-3.5" />
      <circle cx="7" cy="11" r="2" />
    </svg>
  )
}

export function Wifi(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12.5a11 11 0 0 1 14 0" />
      <path d="M8.5 16a6 6 0 0 1 7 0" />
      <circle cx="12" cy="19.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function Tasse(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z" />
      <path d="M17 9h1a3 3 0 0 1 0 6h-1" />
      <path d="M8 2v2M12 2v2M16 2v2" />
    </svg>
  )
}

export function Projecteur(props) {
  return (
    <svg {...base} {...props}>
      <rect x="2" y="6" width="15" height="9" rx="2" />
      <circle cx="9.5" cy="10.5" r="2.3" />
      <path d="m17 9.5 5-2.5v7l-5-2.5" />
      <path d="M6 15v2M13 15v2" />
    </svg>
  )
}

export function Imprimante(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 9V3h12v6" />
      <rect x="4" y="9" width="16" height="7" rx="1.5" />
      <rect x="7" y="14" width="10" height="7" />
    </svg>
  )
}

export function Plus(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function Grille(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  )
}

export function Calendrier(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="m9 16 2 2 4-4" />
    </svg>
  )
}

export function CartePaiement(props) {
  return (
    <svg {...base} {...props}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  )
}

export function Crayon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  )
}

export function Corbeille(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-.9 14a2 2 0 0 1-2 1.9H7.9a2 2 0 0 1-2-1.9L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

export function Personne(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  )
}

export function Boucliers(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l7 3v6c0 4.5-3 8.2-7 9-4-.8-7-4.5-7-9V6l7-3Z" />
      <path d="m9.5 12 2 2 3.5-3.5" />
    </svg>
  )
}

export function Info(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  )
}

export function Attention(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2 2 20h20L12 2Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  )
}
