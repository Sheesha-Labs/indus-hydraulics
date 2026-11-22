import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, test } from '../signed-in'

/**
 * The shell surfaces S01–S08 (S02-T06): every surface opens, traps focus where it should (command bar,
 * notifications, Why?), does not where it should not (Assistant, Help), closes on Escape (the top-most layer
 * only) and returns focus to what opened it. Needs the seeded demo users.
 */

const FIXTURE_EVIDENCE = '00000000-0000-7000-8000-00000000e001'
const UNKNOWN_EVIDENCE = '00000000-0000-7000-8000-00000000ffff'

/** Today streamed in and the client islands hydrated (the sidebar's search trigger has its handler). */
async function ready(page: Page, path = '/today') {
  await page.goto(path)
  await expect(page.locator('main#content').getByRole('heading').first()).toBeVisible()
  await page.waitForFunction(() =>
    ['[data-part="sidebar-toggle"]', '[data-part="skip-link"]'].every((sel) => {
      const el = document.querySelector(sel)
      return el !== null && Object.keys(el).some((k) => k.startsWith('__reactProps'))
    })
  )
}

const searchTrigger = (page: Page) =>
  page.locator('[data-part="sidebar"]').getByRole('button', { name: /^Search/ })

const commandBar = (page: Page) => page.getByRole('dialog', { name: 'Command bar' })
const combobox = (page: Page) => commandBar(page).getByRole('combobox')

/** An in-app (soft) navigation, as a Link click makes: the @drawer slot intercepts it. */
async function softNavigate(page: Page, href: string) {
  await page.evaluate((url) => {
    ;(window as unknown as { next: { router: { push: (u: string) => void } } }).next.router.push(url)
  }, href)
}

async function openFromTrigger(page: Page) {
  const trigger = searchTrigger(page)
  await trigger.click()
  await expect(combobox(page)).toBeFocused()
  return trigger
}

test.describe('command-bar', () => {
  test('⌘K opens it with the combobox focused; Escape closes it and focus returns', async ({
    page,
    signedInAs,
  }) => {
    await signedInAs('owner')
    await ready(page)
    const trigger = searchTrigger(page)
    await trigger.focus()
    await page.keyboard.press('ControlOrMeta+k')
    const input = combobox(page)
    await expect(input).toBeFocused()
    await expect(commandBar(page)).toHaveAttribute('aria-modal', 'true')
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    const listId = await input.getAttribute('aria-controls')
    await expect(page.locator(`[id="${listId}"]`)).toHaveAttribute('role', 'listbox')
    // With nothing typed: the board's three actions, with their shortcuts.
    const actions = page.getByRole('group', { name: 'Actions' })
    await expect(actions.getByRole('option')).toHaveText([/New enquiry\s*N/, /Pause Assistant/, /Go to Review\s*G R/])
    await page.keyboard.press('Escape')
    await expect(commandBar(page)).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })

  test('a typed reference is recognised at once; ↑↓ move one active row across groups', async ({
    page,
    signedInAs,
  }) => {
    await signedInAs('owner')
    await ready(page)
    await openFromTrigger(page)
    const input = combobox(page)
    await input.fill('indus/q10001-r2')
    const ref = page.getByRole('group', { name: 'Recognised reference' })
    await expect(ref.getByRole('option')).toHaveText([/INDUS\/Q10001-R2\s*Quotation/])
    await expect(ref.getByRole('option').first()).toHaveAttribute('aria-selected', 'true')

    // A bare five-digit number is a quotation and a part number.
    await input.fill('10001')
    const options = ref.getByRole('option')
    await expect(options).toHaveText([/INDUS\/Q10001\s*Quotation/, /10001\s*Part number/])
    await expect(options.first()).toHaveAttribute('aria-selected', 'true')
    await expect(input).toHaveAttribute('aria-activedescendant', (await options.first().getAttribute('id'))!)
    await page.keyboard.press('ArrowDown')
    await expect(options.nth(1)).toHaveAttribute('aria-selected', 'true')
    await expect(input).toHaveAttribute('aria-activedescendant', (await options.nth(1).getAttribute('id'))!)
    // On into the next group (Actions match nothing here, so ↓ wraps past the disabled Ask row).
    await page.keyboard.press('ArrowDown')
    await expect(options.first()).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('ArrowUp')
    await expect(options.nth(1)).toHaveAttribute('aria-selected', 'true')
    // Typing resets the active row to the first one.
    await input.press('2')
    await expect(page.getByRole('option').first()).toHaveAttribute('aria-selected', 'true')
    // Words match actions: "open" finds the two panel actions.
    await input.fill('open')
    const acts = page.getByRole('group', { name: 'Actions' }).getByRole('option')
    await expect(acts).toHaveCount(2)
    await page.keyboard.press('ArrowDown')
    await expect(acts.nth(1)).toHaveAttribute('aria-selected', 'true')

    // Tab stays inside the dialog.
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    expect(
      await page.evaluate(() =>
        document.querySelector('[data-part="command-bar"]')!.contains(document.activeElement)
      )
    ).toBe(true)
  })

  test('↵ runs the active row: "Go to Review" navigates; N and G R are not shortcuts while typing', async ({
    page,
    signedInAs,
  }) => {
    await signedInAs('owner')
    await ready(page)
    await openFromTrigger(page)
    await page.keyboard.type('go review')
    await expect(page).toHaveURL(/\/today$/)
    await expect(page.getByRole('option', { name: /Go to Review/ })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/review$/)
    await expect(commandBar(page)).toHaveCount(0)
  })

  test('the Helper has no "Pause Assistant"', async ({ page, signedInAs }) => {
    await signedInAs('helper')
    await ready(page)
    await openFromTrigger(page)
    await page.keyboard.type('pause')
    await expect(page.getByRole('option', { name: /Pause Assistant/ })).toHaveCount(0)
  })

  test('axe finds nothing critical or serious with the command bar open', async ({
    page,
    signedInAs,
  }) => {
    await signedInAs('owner')
    await ready(page)
    await openFromTrigger(page)
    await combobox(page).fill('ENQ-2026-0001')
    await expect(page.getByRole('group', { name: 'Recognised reference' })).toBeVisible()
    // Let the open fade finish: mid-fade text is measured at part opacity.
    await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'))
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(
      violations
        .filter((v) => v.impact === 'critical' || v.impact === 'serious')
        .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
    ).toEqual([])
  })
})

test.describe('why-drawer', () => {
  test('an in-app evidence link opens the drawer over the page; Escape goes back and returns focus', async ({
    page,
    signedInAs,
  }) => {
    await signedInAs('owner')
    await ready(page)
    const trigger = searchTrigger(page)
    await trigger.focus()
    await softNavigate(page, `/why/${FIXTURE_EVIDENCE}`)
    const drawer = page.getByRole('dialog', { name: /Line 1 · AED 125\.00/ })
    await expect(drawer).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`/why/${FIXTURE_EVIDENCE}$`))
    // The page underneath is still Today (hidden from the accessibility tree while the drawer is modal).
    await expect(page.locator('main#content h1', { hasText: 'Today' })).toBeAttached()
    await expect(drawer.getByRole('tab', { name: 'Reasons' })).toHaveAttribute('aria-selected', 'true')
    await expect(drawer.getByRole('tab', { name: /Sources/ })).toContainText('2')
    await expect(drawer.getByRole('button', { name: 'Keep' })).toBeVisible()
    await drawer.getByRole('tab', { name: 'History' }).click()
    await expect(drawer).toContainText('has not changed')
    await page.keyboard.press('Escape')
    await expect(drawer).toHaveCount(0)
    await expect(page).toHaveURL(/\/today$/)
    await expect(trigger).toBeFocused()
  })

  test('the same URL loaded directly is a full page with a way back', async ({
    page,
    signedInAs,
  }) => {
    await signedInAs('owner')
    await page.goto(`/why/${FIXTURE_EVIDENCE}?returnTo=%2Freview`)
    const content = page.locator('main#content')
    await expect(content.getByRole('heading', { level: 1, name: /Line 1 · AED 125\.00/ })).toBeVisible()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(content.getByRole('link', { name: '← Back' })).toHaveAttribute('href', '/review')
    await expect(content.getByRole('link', { name: 'Keep' })).toHaveAttribute('href', '/review')
  })

  test('an unknown or malformed evidence id is "We can’t find that evidence"', async ({
    page,
    signedInAs,
  }) => {
    await signedInAs('owner')
    for (const id of [UNKNOWN_EVIDENCE, 'not-a-uuid']) {
      await page.goto(`/why/${id}`)
      await expect(
        page.locator('main#content').getByRole('heading', { name: 'We can’t find that evidence' })
      ).toBeVisible()
    }
    await ready(page)
    await softNavigate(page, `/why/${UNKNOWN_EVIDENCE}`)
    await expect(page.getByRole('dialog', { name: 'We can’t find that evidence' })).toBeVisible()
  })
})

test.describe('overlays', () => {
  test('Escape closes only the top-most layer: the command bar over the Why? drawer', async ({
    page,
    signedInAs,
  }) => {
    await signedInAs('owner')
    await ready(page)
    await softNavigate(page, `/why/${FIXTURE_EVIDENCE}`)
    const drawer = page.getByRole('dialog', { name: /Line 1/ })
    await expect(drawer).toBeVisible()
    const keep = drawer.getByRole('button', { name: 'Keep' })
    await keep.focus()
    await page.keyboard.press('ControlOrMeta+k')
    await expect(combobox(page)).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(commandBar(page)).toHaveCount(0)
    await expect(drawer).toBeVisible()
    await expect(keep).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(drawer).toHaveCount(0)
    await expect(page).toHaveURL(/\/today$/)
  })

  test('notifications: a modal drawer from the command bar; Escape returns focus to the opener', async ({
    page,
    signedInAs,
  }) => {
    await signedInAs('owner')
    await ready(page)
    const trigger = await openFromTrigger(page)
    await page.keyboard.type('notifications')
    await page.keyboard.press('Enter')
    const panel = page.getByRole('dialog', { name: 'Notifications' })
    await expect(panel).toBeVisible()
    await expect(panel).toHaveAttribute('aria-modal', 'true')
    await expect(panel.getByRole('tab')).toHaveText(['All', 'Needs you', 'Done for you'])
    await expect(panel.getByRole('button', { name: 'Mark all read' })).toBeVisible()
    await expect(panel.getByRole('link', { name: 'Notification settings →' })).toBeVisible()
    await expect(panel).toContainText('No notifications yet')
    // Focus is trapped: Tab never leaves the panel.
    for (let i = 0; i < 6; i++) await page.keyboard.press('Tab')
    expect(
      await panel.evaluate((el) => el.contains(document.activeElement))
    ).toBe(true)
    await page.keyboard.press('Escape')
    await expect(panel).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })

  test('help: docked, not trapped; ? opens it, Escape closes it and focus returns', async ({
    page,
    signedInAs,
  }) => {
    await signedInAs('owner')
    await ready(page)
    const trigger = searchTrigger(page)
    await trigger.focus()
    await page.keyboard.press('?')
    const help = page.getByRole('complementary', { name: 'Help' })
    await expect(help).toBeVisible()
    await expect(help.getByRole('searchbox', { name: 'Search help' })).toBeFocused()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    // The shortcut list is the hotkey registry.
    await expect(help).toContainText('Open the command bar')
    await expect(help).toContainText('Previous record tab')
    // The page is not pushed under a scrim: it keeps its width beside the dock.
    const mainRight = await page.locator('main#content').evaluate((el) => el.getBoundingClientRect().right)
    expect(mainRight).toBeLessThanOrEqual(1440 - 400 + 1)
    // Not trapped: Tab walks out of the panel.
    let left = false
    for (let i = 0; i < 12 && !left; i++) {
      await page.keyboard.press('Tab')
      left = !(await help.evaluate((el) => el.contains(document.activeElement)))
    }
    expect(left).toBe(true)
    await help.getByRole('searchbox', { name: 'Search help' }).focus()
    await page.keyboard.press('Escape')
    await expect(help).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })

  test('assistant panel: docked, focus moves to the ask box; Escape closes it and focus returns', async ({
    page,
    signedInAs,
  }) => {
    await signedInAs('owner')
    await ready(page)
    const trigger = await openFromTrigger(page)
    await page.keyboard.type('assistant panel')
    await page.keyboard.press('Enter')
    const panel = page.getByRole('complementary', { name: 'Everywhere' })
    await expect(panel).toBeVisible()
    const ask = panel.getByRole('textbox', { name: 'Ask or instruct the Assistant' })
    await expect(ask).toBeFocused()
    await expect(panel).toContainText('Instructions come back as a proposal for you to approve')
    await expect(panel.getByRole('heading', { name: 'Waiting on you' })).toBeVisible()
    // Help shares the dock: opening it closes the Assistant panel.
    await page.locator('#content').focus()
    await page.keyboard.press('?')
    await expect(page.getByRole('complementary', { name: 'Help' })).toBeVisible()
    await expect(panel).toHaveCount(0)
    await page.keyboard.press('Escape')
    await expect(page.getByRole('complementary', { name: 'Help' })).toHaveCount(0)
  })

  test('assistant panel: Escape from the ask box closes it and focus returns', async ({
    page,
    signedInAs,
  }) => {
    await signedInAs('owner')
    await ready(page)
    const trigger = await openFromTrigger(page)
    await page.keyboard.type('assistant panel')
    await page.keyboard.press('Enter')
    const panel = page.getByRole('complementary', { name: 'Everywhere' })
    await expect(panel.getByRole('textbox')).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(panel).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })
})

test.describe('banners', () => {
  test('one banner at a time, the most severe, with "+n more" (C23)', async ({
    page,
    signedInAs,
  }) => {
    await signedInAs('owner')
    const base = new URL(process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3100')
    await page.context().addCookies([{ name: 'ops_fixture_banners', value: '1', domain: base.hostname, path: '/' }])
    await ready(page)
    const slot = page.locator('[data-part="banner-slot"]')
    await expect(slot.locator('[data-part="banner"]')).toHaveCount(1)
    await expect(slot).toContainText('sales@ disconnected.')
    const more = slot.getByRole('button', { name: '+2 more' })
    await more.click()
    const popover = page.getByRole('dialog', { name: '2 more notices' })
    await expect(popover).toContainText('purchase@ sync delayed.')
    await expect(popover).toContainText('Zoho Books last synced')
    await page.keyboard.press('Escape')
    await expect(popover).toHaveCount(0)
    await expect(more).toBeFocused()
  })

  test('going offline adds the offline banner; coming back removes it', async ({
    page,
    signedInAs,
  }) => {
    await signedInAs('owner')
    await ready(page)
    const slot = page.locator('[data-part="banner-slot"]')
    await expect(slot).toHaveCount(0)
    await page.context().setOffline(true)
    await expect(slot).toContainText('You’re offline.')
    await page.context().setOffline(false)
    await expect(slot).toHaveCount(0)
  })
})
