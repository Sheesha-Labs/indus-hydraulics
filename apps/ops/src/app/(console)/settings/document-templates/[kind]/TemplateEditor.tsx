'use client'

import {
  KIND_COLUMNS,
  previewSample,
  type BuildContext,
  type DocKind,
  type Letterhead,
  type TemplateDefinition,
} from '@indus/ops-core'
import { Button, ButtonLink, Segmented } from '@indus/ops-ui/controls'
import { Note } from '@indus/ops-ui/card'
import { useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import HeaderActions from '../../../../../components/route/HeaderActions'
import {
  discardTemplateDraftAction,
  publishTemplateAction,
  saveTemplateDraftAction,
} from '../actions/templates'
import BlockList from './BlockList'
import ColumnPicker from './ColumnPicker'
import TemplatePreview from './TemplatePreview'

export interface TemplateEditorProps {
  kind: DocKind
  title: string
  /** "Version 4 · published 2 Nov by … · used on 9 open quotations". */
  versionLine: string
  published: TemplateDefinition
  draft: TemplateDefinition | null
  draftVersion: number | null
  stamp: string
  isOwner: boolean
  awaitingSignoff: boolean
  letterhead: Letterhead
  signer: BuildContext['signer']
  /** The default preset's terms (client documents); null: the sample's own. */
  terms: { label: string; text: string }[] | null
  /** The number the next document would print (ops.peek_number), or "Next free number". */
  previewLabel: string
}

const same = (a: TemplateDefinition, b: TemplateDefinition) => JSON.stringify(a) === JSON.stringify(b)

/**
 * Board 57's editor (S11-T05): the blocks (order, switches, the subject's case), the line-table columns, lines
 * on page 1, the pending-line note, the paper, and a live preview of the sample document through the working
 * copy. Save keeps a draft; Publish (Owner, primary) makes it the template the next render uses. A Helper sees
 * it read only (219). The header buttons are portalled into the settings header's slot. The page keys this
 * component by the saved stamp, so a refresh after save or publish starts again from the new props.
 */
export default function TemplateEditor(p: TemplateEditorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const saved = p.draft ?? p.published
  const [def, setDef] = useState<TemplateDefinition>(saved)
  const [stamp, setStamp] = useState(p.stamp)
  const [busy, setBusy] = useState<null | 'save' | 'publish' | 'discard'>(null)
  const readOnly = !p.isOwner
  const dirty = !same(def, saved)
  const canPublish = !!p.draft && !dirty && !readOnly


  const preview = useMemo(
    () =>
      previewSample(p.kind, def, {
        signer: p.signer,
        previewLabel: p.previewLabel,
        ...(p.terms ? { terms: p.terms } : {}),
      }),
    [p.kind, def, p.signer, p.terms, p.previewLabel]
  )

  async function save() {
    setBusy('save')
    const r = await saveTemplateDraftAction({ kind: p.kind, definition: def, stamp })
    setBusy(null)
    if (!r.success) {
      toast({ kind: 'error', title: r.error })
      return
    }
    setStamp(r.data.stamp)
    toast({ kind: 'success', title: `Draft saved as version ${r.data.version}` })
    router.refresh()
  }
  async function publish() {
    setBusy('publish')
    const r = await publishTemplateAction({ kind: p.kind, stamp })
    setBusy(null)
    if (!r.success) {
      toast({ kind: 'error', title: r.error })
      return
    }
    toast({
      kind: 'success',
      title: `Version ${r.data.version} published · new renders use it; issued PDFs are unchanged`,
    })
    router.refresh()
  }
  async function discard() {
    setBusy('discard')
    const r = await discardTemplateDraftAction({ kind: p.kind, stamp })
    setBusy(null)
    if (!r.success) {
      toast({ kind: 'error', title: r.error })
      return
    }
    toast({ kind: 'success', title: 'Unpublished changes discarded' })
    router.refresh()
  }

  const actions = (
    <>
      {dirty && !readOnly ? (
        <>
          <Button variant="ghost" onClick={() => setDef(saved)} disabled={!!busy}>
            Undo changes
          </Button>
          <Button onClick={save} busy={busy === 'save'} disabled={!!busy && busy !== 'save'}>
            Save
          </Button>
        </>
      ) : p.draft && !readOnly ? (
        <Button variant="ghost" onClick={discard} busy={busy === 'discard'} disabled={!!busy}>
          Discard draft
        </Button>
      ) : null}
      <ButtonLink
        href={`/api/documents/template-preview/${p.kind}`}
        target="_blank"
        prefetch={false}
        variant="secondary"
      >
        Preview with an enquiry
      </ButtonLink>
      {readOnly ? null : (
        <Button
          variant="primary"
          onClick={publish}
          busy={busy === 'publish'}
          disabled={!canPublish || (!!busy && busy !== 'publish')}
          title={
            dirty ? 'Save the changes first' : p.draft ? undefined : 'There are no changes to publish'
          }
        >
          Publish
        </Button>
      )}
    </>
  )

  const cols = KIND_COLUMNS[p.kind]
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_334px] gap-6 pb-6">
      <HeaderActions>{actions}</HeaderActions>
      <div className="flex min-w-0 flex-col gap-4 pt-4">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h2 className="m-0 text-[18px] font-medium">{p.title}</h2>
            <p className="text-io-ink-3 m-0 text-[12.5px]">
              {p.versionLine}
              {p.draft ? ` · draft version ${p.draftVersion} not published` : ''}
            </p>
          </div>
          <Segmented<'A4' | 'Letter'>
            aria-label="Paper"
            options={[
              { value: 'A4', label: 'A4' },
              { value: 'Letter', label: 'Letter' },
            ]}
            value={def.pageSize}
            {...(readOnly ? {} : { onValueChange: (v: 'A4' | 'Letter') => setDef({ ...def, pageSize: v }) })}
          />
        </div>
        {readOnly ? (
          <Note tone="plain">Only the Owner changes document templates.</Note>
        ) : p.awaitingSignoff && !p.draft ? (
          <Note tone="warn" title="Default layout.">
            This template is the layout the builders print today and waits for your sign-off.
            Publishing a change signs it off.
          </Note>
        ) : null}
        <BlockList
          kind={p.kind}
          blocks={def.blocks}
          readOnly={readOnly}
          onChange={(blocks) => setDef({ ...def, blocks })}
        />
        <ColumnPicker
          kind={p.kind}
          columns={cols}
          def={def}
          readOnly={readOnly}
          onChange={(patch) => setDef({ ...def, ...patch })}
        />
        <p className="text-io-ink-3 m-0 text-[12px]">
          Publishing affects only new renders; issued PDFs are immutable.
        </p>
      </div>
      <TemplatePreview data={preview} letterhead={p.letterhead} kind={p.kind} />
    </div>
  )
}
