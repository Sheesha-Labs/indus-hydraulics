'use client'

import { Segmented } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import { useState } from 'react'
import { translateAction } from '../../app/(console)/mail/actions/translate'
import { AssistantTag } from './AssistantCard'

/**
 * Board 97 (9): Original / English for an email mostly in another script. English is made once on demand
 * (mail.translate) and cached on the message; it is a reading aid, labelled as the Assistant's.
 */
type View = 'original' | 'english'

export default function TranslationToggle({
  messageId,
  english: cached,
  languageName: cachedName,
  initialView = 'original',
}: {
  messageId: string
  english: string | null
  languageName: string | null
  /** The kit specimen opens on English. */
  initialView?: View
}) {
  const { toast } = useToast()
  const [view, setView] = useState<View>(initialView)
  const [english, setEnglish] = useState(cached)
  const [languageName, setLanguageName] = useState(cachedName)
  const [loading, setLoading] = useState(false)

  async function show(v: View) {
    setView(v)
    if (v !== 'english' || english) return
    setLoading(true)
    try {
      const res = await translateAction({ messageId })
      if (!res.success) {
        toast({ kind: 'error', title: res.error })
        setView('original')
        return
      }
      setEnglish(res.data.english)
      setLanguageName(res.data.languageName)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section aria-label="Translation" className="flex flex-col gap-2">
      <Segmented<View>
        aria-label="Show the email"
        size="sm"
        value={view}
        onValueChange={(v) => void show(v)}
        options={[
          { value: 'original', label: 'Original' },
          { value: 'english', label: 'English' },
        ]}
        className="self-start"
      />
      {view === 'english' ? (
        loading ? (
          <p className="text-io-ink-3 text-[12px]" aria-live="polite">
            Translating…
          </p>
        ) : english ? (
          <>
            <blockquote className="border-io-line rounded-io-ctl border px-3 py-2.5 text-[13px] leading-[1.55] whitespace-pre-line">
              {english}
            </blockquote>
            <p className="text-io-ink-3 flex items-start gap-2 text-[11.5px]">
              <AssistantTag />
              <span>Summary in English · translated from {languageName ?? 'another language'}</span>
            </p>
          </>
        ) : null
      ) : null}
    </section>
  )
}
