'use server'

/**
 * Run the Search Console sync on demand.
 *
 * WHY THIS EXISTS
 *
 * `gsc.daily.sync` shipped cron-only, at 05:00. That is the right schedule for
 * steady state and the wrong one for the day you set the credential up: the
 * three setup steps each fail in a way the environment cannot distinguish —
 * a key that is set but not authorised on the property looks exactly like a
 * working one — so the first honest signal was tomorrow morning. Getting the
 * property form wrong then costs another day.
 *
 * The access check on the page beside this answers "can we reach the
 * property". This answers the other half: "does a real sync write rows".
 */

import { revalidatePath } from 'next/cache'

import { auth } from '../../../../../lib/admin-auth'
import { inngest } from '../../../../../inngest/client'
import { readGscConfig } from '../../../../../lib/gsc'
import { requireRole, ROLES } from '../../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../../lib/result'

export async function requestGscSync(): Promise<Result<void>> {
  try {
    // Same group that owns the rest of the SEO infrastructure surface. A sync
    // is read-only against Google but it writes our own metrics table, so it
    // is not a SEO_READ action.
    requireRole(await auth(), ROLES.SEO_INFRASTRUCTURE)

    // Refuse early rather than dispatching a job that will log "skipped" into
    // a queue nobody is watching. The button is for people who have just
    // configured this and want to know whether it worked.
    const config = readGscConfig()
    if (!config.ok) return fail('PRECONDITION_FAILED', config.reason)

    await inngest.send({ name: 'gsc/sync.requested', data: {} })

    revalidatePath('/admin/seo/gsc')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}
