import { Pending } from '../KitSection'

/** Set to 'built' when S01-T08 lands: visual tests skip pending sections. */
export const status: 'built' | 'pending' = 'pending'

/** Chart kit specimen: every part with every variant and state (L1 section k12). */
export default function ChartSpecimen() {
  return <Pending task="S01-T08" what="The Chart kit" />
}
