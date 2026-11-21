import { Pending } from '../KitSection'

/** Set to 'built' when S01-T09a lands: visual tests skip pending sections. */
export const status: 'built' | 'pending' = 'pending'

/** Mail kit specimen: every part with every variant and state (L1 section k06). */
export default function MailSpecimen() {
  return <Pending task="S01-T09a" what="The Mail kit" />
}
