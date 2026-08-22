'use client'

import { useEffect, useState } from 'react'

export type ViewerNotification = {
  id: string
  kind: string
  payload: Record<string, unknown>
  readAt: Date | null
  createdAt: Date
}

export type Viewer = {
  signedIn: boolean
  name: string | null
  unreadCount: number
  notifications: ViewerNotification[]
  /** False until the first response lands. Lets callers avoid flashing UI. */
  loaded: boolean
}

const SIGNED_OUT: Viewer = {
  signedIn: false,
  name: null,
  unreadCount: 0,
  notifications: [],
  loaded: false,
}

/**
 * One in-flight request per page load, shared by every caller.
 *
 * The header renders the account button and the notification bell in two
 * different places in the markup, and both need the same answer. Without this
 * module-level cache each mount would fire its own /api/me.
 */
let inFlight: Promise<Viewer> | null = null

function fetchViewer(): Promise<Viewer> {
  if (inFlight) return inFlight
  inFlight = fetch('/api/me', { credentials: 'same-origin' })
    .then((r) => (r.ok ? r.json() : null))
    .then((data): Viewer => {
      if (!data?.signedIn) return { ...SIGNED_OUT, loaded: true }
      return {
        signedIn: true,
        name: data.name ?? null,
        unreadCount: data.unreadCount ?? 0,
        // JSON has no Date type. NotificationBell types these as Date and
        // reads createdAt through `new Date(...)` anyway, but revive them
        // here so the component's contract is honest rather than accidental.
        notifications: (data.notifications ?? []).map((n: ViewerNotification) => ({
          ...n,
          createdAt: new Date(n.createdAt),
          readAt: n.readAt ? new Date(n.readAt) : null,
        })),
        loaded: true,
      }
    })
    // A failed lookup must not break the header. Signed-out is the safe
    // reading: it renders a Sign in link, and every protected route still
    // enforces the session server-side.
    .catch((): Viewer => ({ ...SIGNED_OUT, loaded: true }))
  return inFlight
}

/**
 * Who is looking at the page, resolved after hydration.
 *
 * Server-side this is unknowable without reading the session cookie, and doing
 * that in the header made every storefront page dynamic — see app/api/me.
 * Signed-out is the first paint for everyone, including signed-in customers,
 * who see the account button appear a moment later. That flicker is the price
 * of a statically cacheable catalogue, and it is only ever additive: nothing
 * that matters is hidden behind it, and no gated content is exposed by it.
 */
export function useViewer(): Viewer {
  const [viewer, setViewer] = useState<Viewer>(SIGNED_OUT)

  useEffect(() => {
    let active = true
    fetchViewer().then((v) => {
      if (active) setViewer(v)
    })
    return () => {
      active = false
    }
  }, [])

  return viewer
}
