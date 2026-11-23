import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import SettingField from './SettingField'

describe('SettingField', () => {
  it('adds "Default · awaiting sign-off" only while the row awaits sign-off', () => {
    const field = {
      type: 'number',
      label: 'Default margin',
      name: 'marginPct',
      suffix: '%',
    } as const
    const awaiting = renderToStaticMarkup(
      <SettingField {...field} defaultValue="18" signoff="awaiting" />
    )
    expect(awaiting).toContain('Default · awaiting sign-off')
    expect(awaiting).toContain('This value has not been confirmed by the Owner yet.')
    expect(awaiting).toContain('data-signoff="awaiting"')
    expect(awaiting).toContain('Default margin')

    for (const signoff of ['signed_off', 'not_required'] as const) {
      const html = renderToStaticMarkup(
        <SettingField {...field} defaultValue="18" signoff={signoff} />
      )
      expect(html).not.toContain('awaiting sign-off')
      expect(html).toContain('Default margin')
    }
  })
})
