import { bareSpecimen } from '../../../../../kit/sections/Templates'

const T9A = bareSpecimen('t9a')

/**
 * /_kit/templates/t9a: the T9 wizard in its centred layout, outside AppShell (the board draws no sidebar).
 * In (kit), so no session and no database; gated by the (kit) layout.
 */
export default function T9ASpecimenPage() {
  return (
    <main id="content">
      <T9A />
    </main>
  )
}
