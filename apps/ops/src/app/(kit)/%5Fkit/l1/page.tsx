import KitSection from '../../../../kit/KitSection'
import { KITS } from '../../../../kit/registry'

/** /_kit/l1: 1:1 mirror of the L1 Component Sheet (sections k00–k12). */
export default function KitL1() {
  return (
    <main>
      {KITS.map(({ Specimen, ...k }) => (
        <KitSection
          key={k.id}
          id={k.id}
          crumb={k.crumb}
          title={k.title}
          text={k.text}
          status={k.status}
        >
          <Specimen />
        </KitSection>
      ))}
    </main>
  )
}
