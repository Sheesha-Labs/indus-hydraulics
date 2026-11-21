'use client'

import {
  Choices,
  PaneTabs,
  SearchTrigger,
  Toggle,
  type ChoiceOption,
  type TabItem,
} from '@indus/ops-ui/controls'
import { useState } from 'react'

// Client islands for the Controls specimen: parts whose API takes a function (a server component cannot
// pass one) get a little local state here. Everything else in the specimen renders from the server.

export function PaneTabsDemo({ items, initial }: { items: TabItem[]; initial: string }) {
  const [tab, setTab] = useState(initial)
  return (
    <PaneTabs items={items} value={tab} onValueChange={setTab} aria-label="Record panels">
      {null}
    </PaneTabs>
  )
}

export function PaneTabsWithPanels({ items }: { items: TabItem[] }) {
  const [tab, setTab] = useState(items[0]?.key ?? '')
  const current = items.find((t) => t.key === tab)
  return (
    <PaneTabs items={items} value={tab} onValueChange={setTab} aria-label="Drawer panels">
      <p className="text-io-ink-3 pt-3 text-[12.5px]">Panel for “{current?.label}”.</p>
    </PaneTabs>
  )
}

export function SearchTriggerDemo({ placeholder, kbd }: { placeholder: string; kbd: string }) {
  const [opened, setOpened] = useState(0)
  return (
    <SearchTrigger
      placeholder={placeholder}
      kbd={kbd}
      onOpen={() => setOpened((n) => n + 1)}
      {...(opened ? { className: 'border-io-stroke-hover' } : {})}
    />
  )
}

export function ChoicesButtonsDemo<V extends string>({
  options,
  initial,
}: {
  options: ChoiceOption<V>[]
  initial: V
}) {
  const [value, setValue] = useState<V>(initial)
  return (
    <Choices
      options={options}
      value={value}
      onValueChange={setValue}
      size="sm"
      aria-label="In-card filter"
    />
  )
}

export function ControlledToggleDemo() {
  const [on, setOn] = useState(true)
  return (
    <Toggle
      checked={on}
      onCheckedChange={setOn}
      label="Controlled"
      sub={on ? 'On: the parent holds the state' : 'Off: the parent holds the state'}
    />
  )
}
