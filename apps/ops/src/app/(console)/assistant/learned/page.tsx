import { Segmented } from '@indus/ops-ui/controls'
import { PageHeader } from '@indus/ops-ui/shell'
import { Tag } from '@indus/ops-ui/status'
import { T7Settings } from '@indus/ops-ui/templates'
import AddRule from '../../../../components/learned/AddRule'
import LearnedList from '../../../../components/learned/LearnedList'
import SidePanels from '../../../../components/learned/SidePanels'
import { getLearnedPage } from '../../../../data/preferences'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { requestTime } from '../../../../lib/request-time'

/**
 * Board 115 · What the Assistant has learned (S07-T05, T7 full width): the preferences learned from edits,
 * rejections and choices, by group, each switchable and removable; tone samples and the phrase list on the
 * right. Preferences shape wording and choices only (never a level, check or guardrail).
 */
export default async function AssistantLearnedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await requireOpsUser().catch(signInFor('/assistant/learned'))
  const { filter } = await searchParams
  const page = await getLearnedPage(user, requestTime())
  const onlyNew = filter === 'new'
  const rows = onlyNew ? page.rows.filter((r) => r.isNew) : page.rows
  return (
    <T7Settings
      header={
        <PageHeader
          crumb="Assistant / Autopilot"
          title="What the Assistant has learned"
          actions={page.isOwner ? <AddRule companies={page.companies} /> : null}
        />
      }
    >
      <div data-built="learned" className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Tag kind="assistant">Assistant</Tag>
          <p className="m-0 flex-1 text-[13px]">
            {page.total} {page.total === 1 ? 'preference' : 'preferences'} learned from your edits,
            rejections and choices. Each one is used until you change or remove it.
          </p>
          <Segmented<'all' | 'new'>
            aria-label="Show"
            value={onlyNew ? 'new' : 'all'}
            hrefFor={(v) => (v === 'new' ? '/assistant/learned?filter=new' : '/assistant/learned')}
            options={[
              { value: 'all', label: `All ${page.total}` },
              { value: 'new', label: `New this week ${page.newThisWeek}` },
            ]}
          />
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-[18px]">
          <LearnedList rows={rows} canEdit={page.isOwner} />
          <SidePanels page={page} />
        </div>
      </div>
    </T7Settings>
  )
}
