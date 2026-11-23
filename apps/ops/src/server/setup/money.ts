import 'server-only'
import type { ActionContext } from '../../lib/define-action'
import { revalidateSettings, updateSettingInTx } from '../settings/update'
import type { MoneySettingKey, MoneySettingValue } from '../../lib/money-defaults'
import { markStep } from './progress'

/**
 * Setup 4 saves (board 82). One transaction per save: the version-checked settings update and its
 * activity_event (updateSettingInTx, the same service as updateSettingAction), then the checklist row
 * 'money' done on the first save. The cache tag is purged after the commit.
 */
export type MoneySaveResult = { version: number; savedAt: string }

export async function saveMoneySetting<K extends MoneySettingKey>(
  ctx: ActionContext,
  key: K,
  value: MoneySettingValue<K>,
  expectedVersion: number
): Promise<MoneySaveResult> {
  const result = await ctx.withTx(async (tx) => {
    const change = await updateSettingInTx(tx, key, value, expectedVersion, ctx.user)
    await markStep('money', 'done', ctx.user.id, tx)
    return { version: change.version, savedAt: new Date().toISOString() }
  })
  revalidateSettings([key])
  return result
}
