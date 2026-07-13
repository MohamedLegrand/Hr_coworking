import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { usePlanSalle } from '../../hooks/usePlanSalle'
import AssistantReservation from './AssistantReservation'

const COULEURS = {
  disponible: 0x1d9e75,   // vert
  occupe:     0xe24b4a,   // rouge
  selectionne:0x7c3aed,   // violet
  survol:     0x8b5cf6,   // violet clair
  sol:        0xf4f0fc,   // lavande
  mur:        0xece8f1,   // ligne
}

/**
 * Vue 3D de sélection des bureaux (étape 1-2 du parcours de réservation :
 * découverte + sélection). Une fois un ou plusieurs bureaux choisis,
 * l'assistant de réservation (gamme → forfait → date → récapitulatif)
 * s'affiche en dessous — voir AssistantReservation.
 */
export default function SalleCoworking3D({ typeCompteUtilisateur, onReserver, chargement }) {
  const conteneurRef = useRef(null)
  const { bureaux, isLoading } = usePlanSalle()
  const [selectionnes, setSelectionnes] = useState([])
  const [survole, setSurvole] = useState(null)

  // Un compte freelance ne peut garder qu'un seul bureau sélectionné : au cas où
  // plusieurs auraient été choisis avant que le profil (async) ne soit connu.
  useEffect(() => {
    if (typeCompteUtilisateur !== 'freelance') return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ajuste la sélection à une donnée externe (type de compte chargé de façon asynchrone)
    setSelectionnes((prev) => (prev.length > 1 ? prev.slice(-1) : prev))
  }, [typeCompteUtilisateur])

  const etatRef = useRef({ selectionnes: [], survole: null, typeCompteUtilisateur })

  useEffect(() => {
    etatRef.current = { selectionnes, survole, typeCompteUtilisateur }
  }, [selectionnes, survole, typeCompteUtilisateur])

  useEffect(() => {
    if (isLoading || !conteneurRef.current) return

    const conteneur = conteneurRef.current
    let largeur = conteneur.clientWidth
    const hauteur = 480

    // Scène
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xffffff)

    // Caméra isométrique (orthographique)
    const aspect = largeur / hauteur
    const d = 7
    const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 100)
    camera.position.set(9, 9, 9)
    camera.lookAt(0, 0, 0)

    // Rendu
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(largeur, hauteur)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    conteneur.appendChild(renderer.domElement)

    // Lumières
    scene.add(new THREE.AmbientLight(0xffffff, 0.75))
    const dir = new THREE.DirectionalLight(0xffffff, 0.6)
    dir.position.set(6, 12, 8)
    dir.castShadow = true
    dir.shadow.mapSize.set(1024, 1024)
    scene.add(dir)

    // Sol
    const sol = new THREE.Mesh(
      new THREE.BoxGeometry(11, 0.3, 8),
      new THREE.MeshStandardMaterial({ color: COULEURS.sol })
    )
    sol.position.y = -0.15
    sol.receiveShadow = true
    scene.add(sol)

    // Allée centrale (marquage plus foncé)
    const allee = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.32, 8),
      new THREE.MeshStandardMaterial({ color: COULEURS.mur })
    )
    allee.position.y = -0.14
    scene.add(allee)

    // Groupe de bureaux (chaque bureau = un groupe cliquable)
    const meshBureaux = []

    bureaux.forEach((bureau) => {
      const groupe = new THREE.Group()
      groupe.position.set(bureau.position.x, 0, bureau.position.z)

      const couleurBase = bureau.disponible ? COULEURS.disponible : COULEURS.occupe

      // Plateau du bureau
      const plateau = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.12, 0.7),
        new THREE.MeshStandardMaterial({ color: couleurBase })
      )
      plateau.position.y = 0.55
      plateau.castShadow = true
      groupe.add(plateau)

      // 4 pieds
      const matPied = new THREE.MeshStandardMaterial({ color: 0x888078 })
      const offsets = [[-0.45, -0.28], [0.45, -0.28], [-0.45, 0.28], [0.45, 0.28]]
      offsets.forEach(([px, pz]) => {
        const pied = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.08), matPied)
        pied.position.set(px, 0.27, pz)
        pied.castShadow = true
        groupe.add(pied)
      })

      // Chaise (petit cube derrière)
      const chaise = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.5, 0.4),
        new THREE.MeshStandardMaterial({ color: 0xb4b2a9 })
      )
      chaise.position.set(0, 0.25, 0.6)
      chaise.castShadow = true
      groupe.add(chaise)

      groupe.userData = { bureau, plateau, couleurBase }
      scene.add(groupe)
      meshBureaux.push(groupe)
    })

    // Raycaster pour survol / clic
    const raycaster = new THREE.Raycaster()
    const souris = new THREE.Vector2()

    const majSouris = (e) => {
      const rect = renderer.domElement.getBoundingClientRect()
      souris.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      souris.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    }

    const trouverBureau = () => {
      raycaster.setFromCamera(souris, camera)
      const intersections = raycaster.intersectObjects(meshBureaux, true)
      if (intersections.length === 0) return null
      let obj = intersections[0].object
      while (obj.parent && !obj.userData.bureau) obj = obj.parent
      return obj.userData.bureau ? obj : null
    }

    const onMouseMove = (e) => {
      majSouris(e)
      const groupe = trouverBureau()
      const bureau = groupe?.userData.bureau
      if (bureau && bureau.disponible) {
        setSurvole(bureau.numero)
        renderer.domElement.style.cursor = 'pointer'
      } else {
        setSurvole(null)
        renderer.domElement.style.cursor = 'default'
      }
    }

    const onClick = (e) => {
      majSouris(e)
      const groupe = trouverBureau()
      const bureau = groupe?.userData.bureau
      if (!bureau || !bureau.disponible) return

      setSelectionnes((prev) => {
        const existe = prev.includes(bureau.numero)
        let nouveau
        if (existe) {
          nouveau = prev.filter((n) => n !== bureau.numero)
        } else if (etatRef.current.typeCompteUtilisateur === 'freelance') {
          // Un compte freelance ne peut réserver qu'un seul bureau à la fois
          nouveau = [bureau.numero]
        } else {
          nouveau = [...prev, bureau.numero]
        }
        return nouveau
      })
    }

    renderer.domElement.addEventListener('mousemove', onMouseMove)
    renderer.domElement.addEventListener('click', onClick)

    // Boucle de rendu : applique les couleurs selon l'état
    let animationId
    const animer = () => {
      animationId = requestAnimationFrame(animer)

      const { selectionnes: sel, survole: surv } = etatRef.current

      meshBureaux.forEach((groupe) => {
        const { bureau, plateau, couleurBase } = groupe.userData
        let couleur = couleurBase
        if (sel.includes(bureau.numero)) couleur = COULEURS.selectionne
        else if (surv === bureau.numero) couleur = COULEURS.survol
        plateau.material.color.setHex(couleur)

        // Lévitation légère du bureau sélectionné
        const cible = sel.includes(bureau.numero) ? 0.12 : 0
        groupe.position.y += (cible - groupe.position.y) * 0.15
      })

      renderer.render(scene, camera)
    }
    animer()

    // Responsive
    const onResize = () => {
      largeur = conteneur.clientWidth
      const a = largeur / hauteur
      camera.left = -d * a
      camera.right = d * a
      camera.updateProjectionMatrix()
      renderer.setSize(largeur, hauteur)
    }
    window.addEventListener('resize', onResize)

    // Nettoyage
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', onResize)
      renderer.domElement.removeEventListener('mousemove', onMouseMove)
      renderer.domElement.removeEventListener('click', onClick)
      renderer.dispose()
      if (conteneur.contains(renderer.domElement)) {
        conteneur.removeChild(renderer.domElement)
      }
    }
  }, [isLoading, bureaux])

  if (isLoading) {
    return <div className="h-[480px] animate-pulse rounded-2xl bg-lavande" />
  }

  const espacesChoisis = selectionnes
    .map((numero) => bureaux.find((b) => b.numero === numero)?.espace)
    .filter(Boolean)

  return (
    <div className="overflow-hidden rounded-2xl border border-ligne bg-white">
      {/* Vue 3D */}
      <div ref={conteneurRef} className="w-full" />

      {/* Légende */}
      <div className="flex flex-wrap items-center justify-center gap-6 border-t border-ligne px-6 py-4">
        {[
          { c: 'bg-[#1d9e75]', l: 'Disponible' },
          { c: 'bg-[#e24b4a]', l: 'Occupé' },
          { c: 'bg-violet', l: 'Sélectionné' },
        ].map((item) => (
          <span key={item.l} className="flex items-center gap-2 text-[12.5px] text-ardoise">
            <span className={`h-3 w-3 rounded ${item.c}`} />
            {item.l}
          </span>
        ))}
        {typeCompteUtilisateur === 'freelance' && (
          <span className="text-[12.5px] font-semibold text-violet">
            Compte freelance : un seul bureau à la fois
          </span>
        )}
      </div>

      <AssistantReservation
        espaces={espacesChoisis}
        onReserver={onReserver}
        chargement={chargement}
        onReinitialiser={() => setSelectionnes([])}
      />
    </div>
  )
}
