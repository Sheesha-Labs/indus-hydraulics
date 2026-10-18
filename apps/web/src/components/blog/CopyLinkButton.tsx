'use client'

import { useEffect, useState } from 'react'
import { CheckIcon, LinkIcon } from '../designed/icons'

function legacyCopy(text: string): boolean {
  const previous = document.activeElement as HTMLElement | null
  const field = document.createElement('textarea')
  field.value = text
  field.setAttribute('readonly', '')
  field.className = 'fixed -left-[9999px] top-0'
  document.body.appendChild(field)
  field.select()
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  field.remove()
  previous?.focus({ preventScroll: true })
  return ok
}

/**
 * "Copy link" in the article's document-control strip. Copies the canonical
 * URL handed in from the server — not `location.href`, which can carry a
 * `#section` hash or tracking parameters the reader did not mean to share.
 *
 * Confirms with a two-second "Copied" state, announced politely. If the
 * clipboard is refused (an insecure context, a denied permission) the label
 * says so rather than pretending it worked.
 */
export default function CopyLinkButton({ url }: { url: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')

  useEffect(() => {
    if (state === 'idle') return
    const t = window.setTimeout(() => setState('idle'), 2000)
    return () => window.clearTimeout(t)
  }, [state])

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setState('copied')
    } catch {
      // The async clipboard API is refused in some embedded browsers and
      // permission setups. The legacy selection copy still works in most.
      setState(legacyCopy(url) ? 'copied' : 'failed')
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md border border-ih-border-strong bg-ih-surface px-3.5 text-[13px] font-medium text-ih-ink transition-colors duration-150 hover:border-ih-accent hover:text-ih-accent motion-reduce:transition-none"
    >
      {state === 'copied' ? <CheckIcon size={16} /> : <LinkIcon />}
      <span aria-live="polite">{state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : 'Copy link'}</span>
    </button>
  )
}
