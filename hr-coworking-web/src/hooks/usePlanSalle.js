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

  const bureaux = useMemo(() => {
    return POSITIONS.map((pos, i) => {
      const espace = espaces[i] || null
      return {
        position: pos,
        espace,
        numero: pos.id,
        disponible: espace ? espace.est_disponible : true,
        nom: espace ? espace.nom : `Bureau ${pos.id}`,
      }
    })
  }, [espaces])

  return { bureaux, isLoading }
}
