import 'server-only'
import { checkCandidates, locateTermsSection, offerRefIn, type CheckedCandidate } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import { parsePdf } from '../../intake/parse/pdf'
import { isOpsBucket } from '../../storage/buckets'
import { getStorage } from '../../storage/storage'
import {
  importTermsSchema,
  importTermsUser,
  PROMPT_VERSION,
  SYSTEM_PARTS,
} from '../prompts/import-terms.v1'
import { registerAction } from '../registry'
import type { ActionDefinition, ProposalDraft } from '../types'
import { writeTracked } from '../write-tracked'

/**
 * `import_terms` (S11-T06, board 39 "Import from offer", locked Do quietly, internal). gather reads the uploaded
 * offer PDF from ops-uploads and cuts out its terms section in code; propose asks Sonnet to split it into clauses;
 * verify keeps only known categories and variables; effect writes CANDIDATES on the terms_import row. A candidate
 * is not a clause: a person accepts each one on board 39 (server/terms/import.ts).
 */
export interface ImportTermsInput {
  importId: string
  offerRef: string | null
  section: string | null
  problem: string | null
}
export interface ImportTermsOut {
  candidates: CheckedCandidate[]
  offerRef: string | null
  problem: string | null
}

async function bytesOf(bucket: string, path: string): Promise<Uint8Array | null> {
  if (!isOpsBucket(bucket)) return null
  const stream = await getStorage().openRead(bucket, path)
  if (!stream) return null
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

const definition: ActionDefinition<ImportTermsInput, ImportTermsOut> = {
  key: 'import_terms',
  group: 'system',
  aiPurpose: 'extract',
  external: false,
  concurrencyGroup: 'settings',
  surface: 'hint',

  estimate: (input) => ({ chars: input.section?.length ?? 0, maxTokens: 2_000 }),

  async gather({ request }) {
    const imp = await opsDb.termsImport.findUniqueOrThrow({
      where: { id: request.subjectId },
      select: { id: true, file: { select: { bucket: true, path: true } } },
    })
    const bytes = await bytesOf(imp.file.bucket, imp.file.path)
    const parsed = bytes ? await parsePdf(bytes) : null
    const text =
      parsed?.kind === 'pdf' ? parsed.pages.map((p) => p.text).join('\n') : ''
    const section = text ? locateTermsSection(text) : null
    return {
      input: {
        importId: imp.id,
        offerRef: text ? offerRefIn(text) : null,
        section,
        problem: !parsed
          ? 'The file is no longer in storage'
          : parsed.kind !== 'pdf'
            ? 'This is not a readable PDF'
            : !parsed.hasTextLayer
              ? 'This PDF is a scan with no text'
              : !section
                ? 'No terms section was found'
                : null,
      },
      versions: { import: imp.id },
    }
  },

  async propose(input, ai) {
    if (input.problem || !input.section)
      return {
        ok: true,
        out: {
          candidates: [],
          offerRef: input.offerRef,
          problem: input.problem ?? 'No terms section was found',
        },
        costUsd: '0.000000',
        model: null,
        promptVersion: null,
        callIds: [],
      }
    const res = await ai.call({
      route: 'extract',
      purpose: 'extract',
      system: SYSTEM_PARTS,
      user: importTermsUser(input.section),
      zod: importTermsSchema,
      maxTokens: 2_000,
      promptVersion: PROMPT_VERSION,
    })
    if (!res.ok)
      return { ok: false, reason: res.reason, detail: res.detail, costUsd: res.costUsd, callIds: res.callIds }
    return {
      ok: true,
      out: {
        candidates: checkCandidates(res.value.clauses),
        offerRef: input.offerRef,
        problem: null,
      },
      costUsd: res.costUsd,
      model: res.model,
      promptVersion: PROMPT_VERSION,
      callIds: res.callIds,
    }
  },

  async verify(out) {
    const empty = !out.problem && out.candidates.length === 0
    const problem = out.problem ?? (empty ? 'No clauses were found in the terms section' : null)
    return {
      out: { ...out, problem },
      checks: [
        problem
          ? { label: 'Clauses found', status: 'fail' as const, detail: problem }
          : { label: 'Clauses found', status: 'pass' as const, detail: `${out.candidates.length}` },
        { label: 'Variables are known names only', status: 'pass' as const },
      ],
      confidence: problem ? 'unsure' : 'likely',
      ...(problem ? { unsure: [{ field: 'clauses', why: problem }] } : {}),
    }
  },

  toProposal(v): ProposalDraft {
    return {
      headline: v.out.problem
        ? 'No clauses read from the offer'
        : `${v.out.candidates.length} clauses read from the offer`,
      reasons: [{ text: 'Candidates for a person to accept one by one' }],
      preview: { text: v.out.candidates.map((c) => `${c.title}: ${c.body}`).join('\n') },
      checks: v.checks,
      confidence: v.confidence,
      unsureAbout: v.out.problem,
      onApproveText: 'Lists the candidates on Settings › Offer terms',
    }
  },

  async effect(tx, v, ctx) {
    const importId = ctx.request.subjectId
    const failed = !!v.out.problem
    await writeTracked(
      tx,
      {
        actor: { kind: 'assistant' },
        actionId: ctx.actionId,
        subjectType: 'settings',
        subjectId: importId,
        changes: [
          {
            field: 'terms_import.status',
            before: 'reading',
            after: failed ? 'failed' : `ready · ${v.out.candidates.length} candidates`,
            kind: 'terms',
          },
        ],
      },
      async (t) => {
        if (!failed)
          await t.termsImportCandidate.createMany({
            data: v.out.candidates.map((c, i) => ({
              importId,
              position: i + 1,
              category: c.category,
              title: c.title,
              body: c.body,
              variables: c.variables,
            })),
          })
        await t.termsImport.update({
          where: { id: importId },
          data: {
            status: failed ? 'failed' : 'ready',
            failureNote: v.out.problem,
            actionId: ctx.actionId,
            offerRef: v.out.offerRef,
          },
        })
      }
    )
    return {
      note: failed
        ? `Not read: ${v.out.problem}`
        : `${v.out.candidates.length} candidate clauses to review`,
    }
  },
}

registerAction(definition)
export default definition
