import { Pending } from '../KitSection'

/** Set to 'built' when S01-T07 lands: visual tests skip pending sections. */
export const status: 'built' | 'pending' = 'pending'

/** Overlay kit specimen: every part with every variant and state (L1 section k10). */
export default function OverlaySpecimen() {
  return <Pending task="S01-T07" what="The Overlay kit" />
}
