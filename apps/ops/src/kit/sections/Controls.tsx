import { Pending } from '../KitSection'

/** Set to 'built' when S01-T03 lands: visual tests skip pending sections. */
export const status: 'built' | 'pending' = 'pending'

/** Controls kit specimen: every part with every variant and state (L1 section k01). */
export default function ControlsSpecimen() {
  return <Pending task="S01-T03" what="The Controls kit" />
}
