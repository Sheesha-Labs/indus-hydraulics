import { ButtonLink } from '@indus/ops-ui/controls'
import { PageHeader } from '@indus/ops-ui/shell'
import { Banner } from '@indus/ops-ui/status'
import { T7Settings } from '@indus/ops-ui/templates'
import { notFound } from 'next/navigation'
import ActionDrawer from '../../../../components/autopilot/ActionDrawer'
import ActionTable from '../../../../components/autopilot/ActionTable'
import ModesHelp from '../../../../components/autopilot/ModesHelp'
import MasterCard from '../../../../components/autopilot/ModeSwitch'
import WeekStats, { LevelLegend } from '../../../../components/autopilot/WeekStats'
import { getActionDetail, getAutopilotPage } from '../../../../data/autopilot'
import { getHelpArticle } from '../../../../data/help'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { requestTime } from '../../../../lib/request-time'

/**
 * Board 98 · Autopilot and board 99 · one action (`?action=<key>`, a drawer over the page), S07-T02. T7 without
 * the sub-nav, as drawn. The Owner changes levels, the mode and rules; the Helper reads, and edits #13's rules
 * when allowed (board 102 state 6).
 */
export default async function AssistantAutopilotPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await requireOpsUser().catch(signInFor('/assistant/autopilot'))
  const params = await searchParams
  const now = requestTime()
  const actionKey = typeof params.action === 'string' ? params.action : null
  const [page, detail, help] = await Promise.all([
    getAutopilotPage(user, now),
    actionKey ? getActionDetail(actionKey, user, now) : Promise.resolve(null),
    params.help === 'modes' ? getHelpArticle('autopilot-modes') : Promise.resolve(null),
  ])
  if (actionKey && !detail) notFound()
  return (
    <T7Settings
      header={
        <PageHeader
          crumb="Assistant"
          title="Autopilot"
          actions={
            <>
              <ButtonLink href="/assistant/guardrails">Guardrails</ButtonLink>
              <ButtonLink href="/assistant/cost">Cost & limits</ButtonLink>
            </>
          }
        />
      }
    >
      <div data-built="autopilot" className="flex flex-col gap-5">
        {!page.isOwner ? (
          <Banner tone="info" title="Read only">
            You can see Autopilot but not change it. Krishan can let you edit chaser rules and
            templates. You cannot pause or resume the Assistant.
          </Banner>
        ) : null}
        <div className="flex items-stretch gap-[18px]">
          <MasterCard
            isOwner={page.isOwner}
            pausedAt={page.pausedAt}
            mode={page.mode}
            preview={page.modePreview}
            firstDay={page.firstDay}
          />
          <WeekStats week={page.week} />
        </div>
        <div className="flex items-start justify-between gap-4">
          <LevelLegend />
          <ButtonLink href="/assistant/autopilot?help=modes" variant="link" className="flex-none">
            Compare modes
          </ButtonLink>
        </div>
        <ActionTable groups={page.groups} system={page.system} canEdit={page.isOwner} />
      </div>
      {detail ? (
        <ActionDrawer detail={detail} isOwner={page.isOwner} firstDay={page.firstDay} />
      ) : null}
      {help ? <ModesHelp article={help} /> : null}
    </T7Settings>
  )
}
