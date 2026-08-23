'use client'

import SectionEditor, {
  type EditorSection,
  type SectionActions,
} from '../../../../../../../components/admin/pages/SectionEditor'
import type { Seeds } from '../../../../../../../components/admin/pages/section-fields'
import { resetSubPage, saveSubPage } from './actions'

const SUB_ACTIONS: SectionActions = {
  save: (id, sections) => saveSubPage(id, sections),
  reset: (id) => resetSubPage(id),
}

export default function SubPageEditorClient({
  pageId,
  pageLabel,
  path,
  initial,
  seeds,
  usingDefaults,
}: {
  /** `market:nigeria` — kind and record slug, split apart in the action. */
  pageId: string
  pageLabel: string
  path: string
  initial: EditorSection[]
  seeds: Seeds
  usingDefaults: boolean
}) {
  return (
    <SectionEditor
      pageId={pageId}
      pageLabel={pageLabel}
      path={path}
      initial={initial}
      seeds={seeds}
      usingDefaults={usingDefaults}
      actions={SUB_ACTIONS}
    />
  )
}
