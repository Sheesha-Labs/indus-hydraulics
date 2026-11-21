import { Pending } from '../KitSection'

/** Set to 'built' when S01-T05 lands: visual tests skip pending sections. */
export const status: 'built' | 'pending' = 'pending'

/** Card kit specimen: every part with every variant and state (L1 section k04). */
export default function CardSpecimen() {
  return <Pending task="S01-T05" what="The Card kit" />
}
