'use client'

import type { Result } from '@indus/ops-core'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AUTOSAVE_MS } from './CompanyForm'
import { useSaveStatus } from './SaveStatus'

/**
 * Autosave of one versioned setting, Setup 1's pattern (CompanyForm) as a hook for Setup 4: 800 ms after
 * the last change the value is saved with the version it was read at. Saves never overlap: a change
 * during a save is saved right after it. An invalid value is kept on screen and not saved ("· not saved"
 * in the foot) until it is fixed. A refused save (another tab or person changed it) stops autosaving and
 * returns the message, so the form can offer Reload and nothing is silently overwritten.
 */
export type SettingSave<T> = (
  value: T,
  expectedVersion: number
) => Promise<Result<{ version: number; savedAt: string }>>

export function useSettingAutosave<T>({
  initial,
  version: initialVersion,
  save,
  valid,
}: {
  initial: T
  version: number
  save: SettingSave<T>
  /** A value that fails this is shown but not saved. */
  valid: (value: T) => boolean
}): { value: T; set: (next: T) => void; conflict: string | null } {
  const status = useSaveStatus()
  const [value, setValue] = useState(initial)
  const [conflict, setConflict] = useState<string | null>(null)
  const version = useRef(initialVersion)
  const latest = useRef(initial)
  const dirty = useRef(false)
  const inFlight = useRef(false)
  const stopped = useRef(false)
  const timer = useRef<number | null>(null)
  const saveAgain = useRef<(() => Promise<void>) | null>(null)

  const run = useCallback(async () => {
    if (stopped.current) return
    if (inFlight.current) {
      dirty.current = true
      return
    }
    if (!valid(latest.current)) {
      status.report('error')
      return
    }
    inFlight.current = true
    dirty.current = false
    status.report('saving')
    const res = await save(latest.current, version.current)
    inFlight.current = false
    if (res.success) {
      version.current = res.data.version
      status.report(dirty.current ? 'saving' : 'saved', res.data.savedAt)
      if (dirty.current) void saveAgain.current?.()
    } else {
      status.report('error')
      stopped.current = true
      setConflict(res.error)
    }
  }, [save, status, valid])

  useEffect(() => {
    saveAgain.current = run
  }, [run])

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    },
    []
  )

  const set = useCallback(
    (next: T) => {
      latest.current = next
      setValue(next)
      if (stopped.current) return
      status.report('saving')
      if (timer.current !== null) window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => {
        timer.current = null
        void run()
      }, AUTOSAVE_MS)
    },
    [run, status]
  )

  return { value, set, conflict }
}
