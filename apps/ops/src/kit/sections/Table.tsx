import { Pending } from '../KitSection'

/** Set to 'built' when S01-T05 lands: visual tests skip pending sections. */
export const status: 'built' | 'pending' = 'pending'

/** Table kit specimen: every part with every variant and state (L1 section k03). */
export default function TableSpecimen() {
  return <Pending task="S01-T05" what="The Table kit" />
}
