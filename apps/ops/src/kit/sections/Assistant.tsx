import { Pending } from '../KitSection'

/** Set to 'built' when S01-T09b lands: visual tests skip pending sections. */
export const status: 'built' | 'pending' = 'pending'

/** Assistant kit specimen: every part with every variant and state (L1 section k05). */
export default function AssistantSpecimen() {
  return <Pending task="S01-T09b" what="The Assistant kit" />
}
