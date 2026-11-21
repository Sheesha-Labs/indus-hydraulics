import { Pending } from '../KitSection'

/** Set to 'built' when S01-T08 lands: visual tests skip pending sections. */
export const status: 'built' | 'pending' = 'pending'

/** Timeline kit specimen: every part with every variant and state (L1 section k08). */
export default function TimelineSpecimen() {
  return <Pending task="S01-T08" what="The Timeline kit" />
}
