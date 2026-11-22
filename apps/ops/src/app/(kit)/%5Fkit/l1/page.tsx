import KitSection, { Pending } from '../../../../kit/KitSection'
import { KITS } from '../../../../kit/registry'

/** /_kit/l1: 1:1 mirror of the L1 Component Sheet (sections k00–k12). */
export default function KitL1() {
  return (
    <main>
      <KitSection
        id="k00"
        crumb="K-00 · Shell Kit"
        title="Shell"
        text="Sidebar, page headers, record header, Assistant strip and the board frame."
        status="pending"
      >
        <Pending task="S02" what="Shell" />
      </KitSection>
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
