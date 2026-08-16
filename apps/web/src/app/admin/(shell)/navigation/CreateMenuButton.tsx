'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MENU_LOCATION_LABELS, type MenuLocation } from '@indus/domain'
import { createMenu } from './actions'

interface Props {
  missing: readonly MenuLocation[]
}

export default function CreateMenuButton({ missing }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [location, setLocation] = useState<MenuLocation>(missing[0]!)
  const [name, setName] = useState('')

  function defaultSlug(loc: MenuLocation): string {
    return loc.replace(/_/g, '-')
  }

  function submit() {
    setError(null)
    const slug = defaultSlug(location)
    const finalName = name.trim() || MENU_LOCATION_LABELS[location]
    startTransition(async () => {
      const result = await createMenu({ slug, name: finalName, location })
      if (!result.success) {
        setError(result.message)
        return
      }
      setOpen(false)
      router.refresh()
      router.push(`/admin/navigation/${result.data.slug}`)
    })
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-9 px-4 bg-ih-accent text-white text-[13px] font-medium hover:opacity-90"
      >
        + New menu
      </button>
    )
  }

  return (
    <div className="bg-white border border-ih-border p-4 flex flex-col gap-3 w-[420px]">
      <div className="text-[14px] font-medium">Create menu</div>
      <label className="flex flex-col gap-1 text-[12px]">
        <span className="text-ih-muted">Location</span>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value as MenuLocation)}
          className="h-9 px-3 border border-ih-border bg-white text-[13px]"
        >
          {missing.map((loc) => (
            <option key={loc} value={loc}>
              {MENU_LOCATION_LABELS[loc]}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-[12px]">
        <span className="text-ih-muted">Name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={MENU_LOCATION_LABELS[location]}
          className="h-9 px-3 border border-ih-border bg-white text-[13px]"
        />
      </label>
      {error ? (
        <p role="alert" className="text-[12px] text-ih-danger">
          {error}
        </p>
      ) : null}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-9 px-4 border border-ih-border text-[13px]"
          disabled={pending}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="h-9 px-4 bg-ih-accent text-white text-[13px] disabled:opacity-50"
        >
          {pending ? 'Creating…' : 'Create'}
        </button>
      </div>
    </div>
  )
}
