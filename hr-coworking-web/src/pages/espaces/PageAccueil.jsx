import Hero from '../../composants/sections/Hero'
import SectionAvantages from '../../composants/sections/SectionAvantages'
import SectionPourquoi from '../../composants/sections/SectionPourquoi'
import SectionOnboarding from '../../composants/sections/SectionOnboarding'
import Banniere from '../../composants/sections/Banniere'
import SectionTarifs from '../../composants/sections/SectionTarifs'
import SectionEspaces from '../../composants/sections/SectionEspaces'

export default function PageAccueil() {
  return (
    <>
      <Hero />
      <SectionAvantages />
      <SectionPourquoi />
      <SectionOnboarding />
      <Banniere />
      <SectionTarifs />
      <SectionEspaces />
    </>
  )
}
