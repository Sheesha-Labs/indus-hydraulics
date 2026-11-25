import {
  DuplicateCard,
  HandwritingCard,
  RevisionCard,
  UnreadableCard,
} from '../../components/intake/review/ExceptionCards'

/**
 * Board 17 · Intake exceptions (S08-T04): the four states from the real cards, neutral fixtures. No session, no
 * database; the cards' verbs do nothing here.
 */
export default function IntakeStatesSpecimen() {
  return (
    <main className="bg-io-paper min-h-screen w-[1440px] p-8">
      <h1 className="sr-only">Intake exceptions</h1>
      <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-[22px]">
        <UnreadableCard fileName="scan_0019.jpg" meta="96 dpi scan" dpi="96 dpi" canAsk />
        <HandwritingCard ord={8} printed="8" handwritten="10" />
        <DuplicateCard
          a={{
            ord: 1,
            page: 2,
            description: 'Hose 1/2" 2SN, 3 m, JIC F/F',
            partNo: 'TEST-08-2SN-3000',
            qty: '24',
            uom: 'EA',
          }}
          b={{
            ord: 9,
            page: 3,
            description: 'Hose 1/2" 2SN, 3 m',
            partNo: 'TEST-08-2SN-3000',
            qty: '24',
            uom: 'EA',
          }}
        />
        <RevisionCard
          enquiryRef="ENQ-2026-0411"
          clientName="Sample Client LLC"
          clientRef="SC/PR/0788"
          matched={9}
          total={9}
          added={0}
          changes={[
            { ord: 3, description: 'Bearing TEST-22320', from: '120', to: '160' },
            { ord: 7, description: 'Housing TEST-520', from: '12', to: '8' },
          ]}
        />
      </div>
    </main>
  )
}
