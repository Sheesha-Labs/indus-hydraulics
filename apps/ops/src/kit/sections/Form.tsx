import { Pending } from '../KitSection'

/** Set to 'built' when S01-T06 lands: visual tests skip pending sections. */
export const status: 'built' | 'pending' = 'pending'

/** Form kit specimen: every part with every variant and state (L1 section k09). */
export default function FormSpecimen() {
  return <Pending task="S01-T06" what="The Form kit" />
}
