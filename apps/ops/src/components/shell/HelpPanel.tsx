'use client'

import { List, type ListItem } from '@indus/ops-ui/card'
import { Button, Kbd, SearchInput } from '@indus/ops-ui/controls'
import { Field } from '@indus/ops-ui/form'
import {
  formatHotkey,
  useEscapeLayer,
  useHotkeyList,
  type HotkeyListing,
} from '@indus/ops-ui/lib/use-hotkeys'
import { Drawer, useToast } from '@indus/ops-ui/overlay'
import { InlineState } from '@indus/ops-ui/states'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { getHelpForPage, type HelpArticleRow } from '../../actions/read/shell-panels'
import { useShell } from './Providers'
import { useReturnFocus } from './use-return-focus'

/**
 * The person who answers console questions. Content, not code (CLAUDE.md §6.10): S35 reads the name from
 * settings; until then the button says what it does without naming anyone.
 */
export const HELP_CONTACT_LABEL = 'Message support'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="io-eyebrow m-0">{title}</h3>
      {children}
    </section>
  )
}

/** The registry's shortcuts by heading, in registration order (05 §7.7: Help lists the registry). */
function groupShortcuts(list: readonly HotkeyListing[]): Array<[string, HotkeyListing[]]> {
  const groups = new Map<string, HotkeyListing[]>()
  for (const h of list) {
    const g = h.group ?? 'Other'
    groups.set(g, [...(groups.get(g) ?? []), h])
  }
  return [...groups]
}

/**
 * S06 · Help panel (board S06a): docked on the right (no scrim, no trap). Search help, the articles for this
 * page, ask the Assistant about the console itself, the keyboard shortcuts (generated from the hotkey
 * registry, so they cannot drift) and a message to support. Escape closes it; focus goes back to `?` or
 * whatever opened it. Articles come from getHelpForPage(), empty until S35.
 */
export default function HelpPanel() {
  const shell = useShell()
  const open = shell.panels.help
  const panel = useRef<HTMLDivElement>(null)
  useReturnFocus(open, { restore: true, within: panel })
  useEscapeLayer(open, () => shell.close('help'))
  const pathname = usePathname()
  const shortcuts = useHotkeyList()
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [articles, setArticles] = useState<HelpArticleRow[] | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    searchRef.current?.querySelector('input')?.focus()
    let live = true
    void getHelpForPage(pathname).then((r) => {
      if (live) setArticles(r.success ? r.data : [])
    })
    return () => {
      live = false
    }
  }, [open, pathname])

  const items: ListItem[] = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (articles ?? [])
      .filter((a) => !q || a.title.toLowerCase().includes(q))
      .map((a) => ({ key: a.slug, mark: null, title: a.title, right: `${a.minutes} min` }))
  }, [articles, query])

  return (
    <div ref={panel} className="contents">
      <Drawer
        open={open}
        onOpenChange={(next) => (next ? shell.open('help') : shell.close('help'))}
        modal={false}
        // 400, as the S03/S06 boards draw the docked panels (README: 400–460); the kit's ladder starts at 420.
        className="w-[400px]"
        variant="shell"
        title="Help"
        footer={
          <Button
            onClick={() =>
              toast({ kind: 'info', title: 'Messages to support are switched on with Help.' })
            }
          >
            {HELP_CONTACT_LABEL}
          </Button>
        }
      >
        <div ref={searchRef}>
          <SearchInput
            placeholder="Search help"
            aria-label="Search help"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Section title="On this page">
          {articles === null ? (
            <InlineState kind="loading" />
          ) : items.length === 0 ? (
            <p className="text-io-ink-3 m-0 text-[12.5px]">
              {query ? 'No help article matches.' : 'No articles for this page yet.'}
            </p>
          ) : (
            <List items={items} />
          )}
        </Section>
        <Section title="Ask the Assistant">
          <Field
            type="textarea"
            name="help-question"
            label="Ask the Assistant about the console"
            placeholder="How do I quote one line later without a second enquiry?"
            hint="Answers about using the console. It cannot change anything from here."
            state="readonly"
            className="[&>label]:sr-only"
          />
        </Section>
        <Section title="Keyboard shortcuts">
          <dl className="m-0 flex flex-col gap-3">
            {groupShortcuts(shortcuts).map(([group, keys]) => (
              <div key={group} className="flex flex-col gap-1">
                <dt className="text-io-ink-2 text-[12px] font-medium">{group}</dt>
                {keys.map((h) => (
                  <dd
                    key={h.keys}
                    className="text-io-ink-2 m-0 flex items-center justify-between gap-3 text-[12.5px]"
                  >
                    <span>{h.label}</span>
                    <Kbd keys={formatHotkey(h.keys, true)} />
                  </dd>
                ))}
              </div>
            ))}
          </dl>
        </Section>
      </Drawer>
    </div>
  )
}
