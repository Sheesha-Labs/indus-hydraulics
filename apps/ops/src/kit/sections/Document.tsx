import { Pending } from '../KitSection'

/** Set to 'built' when S01-T09c lands: visual tests skip pending sections. */
export const status: 'built' | 'pending' = 'pending'

/** Document kit specimen: every part with every variant and state (L1 section k07). */
export default function DocumentSpecimen() {
  return <Pending task="S01-T09c" what="The Document kit" />
}
