import { Pending } from '../KitSection'

/** Set to 'built' when S01-T04 lands: visual tests skip pending sections. */
export const status: 'built' | 'pending' = 'pending'

/** Status kit specimen: every part with every variant and state (L1 section k02). */
export default function StatusSpecimen() {
  return <Pending task="S01-T04" what="The Status kit" />
}
