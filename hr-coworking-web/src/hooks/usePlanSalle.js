import { useMemo } from 'react'
import { useEspaces } from './useEspaces'

/*
 * Mappe les espaces de l'API sur une grille fixe de 8 positions.
 * Disposition : 2 rangées, 2 blocs de 2 bureaux par rangée.
 *
 *    B1 B2   B3 B4      (rangée haut)
 *       allée centrale
 *    B5 B6   B7 B8      (rangée bas)
 */
const POSITIONS = [
  { id: 1, x: -3.2, z: -2.2 }, { id: 2, x: -1.8, z: -2.2 },
  { id: 3, x:  1.8, z: -2.2 }, { id: 4, x:  3.2, z: -2.2 },
  { id: 5, x: -3.2, z:  2.2 }, { id: 6, x: -1.8, z:  2.2 },
  { id: 7, x:  1.8, z:  2.2 }, { id: 8, x:  3.2, z:  2.2 },
]

export function usePlanSalle() {
  const { data: espaces = [], isLoading } = useEspaces()

  // Seuls les bureaux marqués visible_plan_3d apparaissent dans la salle —
  // un bureau peut exister dans le catalogue (réservable via les cartes)
  // sans occuper l'un des 8 emplacements physiques du plan 3D.
  const espacesPlan3D = useMemo(
    () => espaces.filter((e) => e.visible_plan_3d),
    [espaces]
  )

  // La salle affiche toujours 8 emplacements fixes. Un emplacement sans
  // espace réel derrière (moins de 8 bureaux visibles en 3D) est marqué
  // indisponible : il reste visible mais non sélectionnable, pour éviter
  // qu'un clic dans le vide sélectionne un bureau fantôme (silencieusement
  // ignoré par l'assistant de réservation, faute d'espace réel à réserver).
  const bureaux = useMemo(() => {
    return POSITIONS.map((pos, i) => {
      const espace = espacesPlan3D[i] || null
      return {
        position: pos,
        espace,
        numero: pos.id,
        disponible: espace ? espace.est_disponible : false,
        nom: espace ? espace.nom : `Bureau ${pos.id} (non configuré)`,
      }
    })
  }, [espacesPlan3D])

  return { bureaux, isLoading }
}
