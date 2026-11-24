import 'server-only'
import { opsDb } from '@indus/ops-db'
import { BannerAction, type SystemBanner } from '@indus/ops-ui/status'
import type { OpsUser } from '../lib/access-core'
import { bannerSpecs, type BannerMailbox, type BannerSpec } from '../lib/system-banner-rules'
import { assistantPauseState } from '../server/assistant/pause'
import { sentInCapDay } from '../server/mail-send/slot'
import { getSetting } from '../server/settings/get'

/**
 * Board 89 system banners for the shell strip (S04-T08, C23): ONE query over the mailboxes (with sync state and
 * the outbound rows that matter: held for the cap, failed in the last day), plus the pause row and the timing
 * setting from the settings cache. The shell shows the most severe banner with "+n more".
 */
export async function getSystemBanners(
  user: Pick<OpsUser, 'id' | 'initials'>,
  now = new Date()
): Promise<SystemBanner[]> {
  const since = new Date(now.getTime() - 24 * 3_600_000)
  const [rows, pause, timing] = await Promise.all([
    opsDb.mailbox.findMany({
      select: {
        id: true,
        address: true,
        role: true,
        status: true,
        pausedAt: true,
        pausedById: true,
        disconnectedAt: true,
        updatedAt: true,
        dailySendCap: true,
        owner: { select: { id: true, initials: true } },
        syncState: {
          select: {
            lastSuccessfulSyncAt: true,
            backfillState: true,
            sentToday: true,
            sentTodayDate: true,
          },
        },
        outbound: {
          where: {
            OR: [
              { status: 'held', holdReason: 'cap' },
              { status: 'failed', updatedAt: { gte: since }, failureReason: { not: null } },
              { status: 'sent', deliveryStatus: 'bounced', updatedAt: { gte: since } },
            ],
          },
          select: { status: true, deliveryStatus: true, toAddresses: true },
          take: 200,
        },
      },
      orderBy: { createdAt: 'asc' },
    }),
    assistantPauseState(),
    getSetting('send.timing'),
  ])
  const initialsOf = (id: string | null, ownerId: string | undefined, ownerInitials: string | undefined) =>
    id === null ? null : id === user.id ? user.initials : id === ownerId ? (ownerInitials ?? null) : null

  const mailboxes: BannerMailbox[] = rows.map((r) => ({
    id: r.id,
    address: r.address,
    role: r.role,
    status: r.status,
    brokenAt: r.disconnectedAt ?? r.updatedAt,
    pausedAt: r.pausedAt,
    pausedByInitials: initialsOf(r.pausedById, r.owner?.id, r.owner?.initials),
    lastSuccessfulSyncAt: r.syncState?.lastSuccessfulSyncAt ?? null,
    backfillPhase: (r.syncState?.backfillState as { phase?: string } | null)?.phase ?? null,
    heldForCap: r.outbound.filter((o) => o.status === 'held').length,
    failedRecently: r.outbound.filter((o) => o.status === 'failed').length,
    bouncedRecently: r.outbound.filter((o) => o.deliveryStatus === 'bounced').length,
    bouncedTo: r.outbound.find((o) => o.deliveryStatus === 'bounced')?.toAddresses[0] ?? null,
    sentToday: sentInCapDay(r.syncState ?? null, now, timing.capReset),
    dailySendCap: r.dailySendCap,
  }))
  const specs = bannerSpecs({
    mailboxes,
    assistantPause: pause
      ? {
          pausedAt: pause.pausedAt,
          byInitials: pause.pausedById === user.id ? user.initials : null,
        }
      : null,
    capReset: timing.capReset,
    now,
  })
  return specs.map(toBanner)
}

export function toBanner(spec: BannerSpec): SystemBanner {
  return {
    kind: spec.kind,
    props: {
      tone: spec.tone,
      title: spec.title,
      children: spec.text,
      ...(spec.action
        ? { actions: <BannerAction href={spec.action.href}>{spec.action.label}</BannerAction> }
        : {}),
    },
  }
}
