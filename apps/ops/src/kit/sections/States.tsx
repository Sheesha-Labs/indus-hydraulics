import { Pending } from '../KitSection'

/** Set to 'built' when S01-T06 lands: visual tests skip pending sections. */
export const status: 'built' | 'pending' = 'pending'

/** States kit specimen: every part with every variant and state (L1 section k11). */
export default function StatesSpecimen() {
  return <Pending task="S01-T06" what="The States kit" />
}
