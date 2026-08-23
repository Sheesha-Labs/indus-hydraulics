'use client'

import SectionEditor, {
  type EditorSection,
  type SectionActions,
} from '../../../../../../components/admin/pages/SectionEditor'
import type { Seeds } from '../../../../../../components/admin/pages/section-fields'
import { resetMasterPage, saveMasterPage } from './actions'

/**
 * Binds the generic section editor to the master-page actions.
 *
 * It exists so the server route can stay a server component: a server action
 * imported into a server component and passed down as a prop is legal, but the
 * `actions` object is built from two of them and reads better assembled on the
 * client side of the boundary, next to the component that calls it.
 */
const MASTER_ACTIONS: SectionActions = {
  save: (id, sections) => saveMasterPage(id, sections),
  reset: (id) => resetMasterPage(id),
}

export default function MasterPageEditorClient({
  pageKey,
  pageLabel,
  path,
  initial,
  seeds,
  usingDefaults,
}: {
  pageKey: string
  pageLabel: string
  path: string
  initial: EditorSection[]
  seeds: Seeds
  usingDefaults: boolean
}) {
  return (
    <SectionEditor
      pageId={pageKey}
      pageLabel={pageLabel}
      path={path}
      initial={initial}
      seeds={seeds}
      usingDefaults={usingDefaults}
      actions={MASTER_ACTIONS}
    />
  )
}
