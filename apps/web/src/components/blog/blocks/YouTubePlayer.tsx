'use client'

import Image from 'next/image'
import { useState } from 'react'

type Props = {
  videoId: string
  title: string
}

/**
 * A YouTube thumbnail that becomes the player when pressed.
 *
 * The iframe is not mounted until a reader asks for it. A YouTube embed costs
 * roughly a megabyte of script and a dozen third-party requests before anyone
 * presses play, on a page whose whole job is to be read — and the thumbnail is
 * what a reader looks at either way. The privacy-enhanced host sets no cookies
 * until playback starts.
 *
 * `autoplay=1` is safe here only because the iframe exists as the result of a
 * click: the press IS the user gesture the browser's autoplay policy wants.
 */
export default function YouTubePlayer({ videoId, title }: Props) {
  const [playing, setPlaying] = useState(false)

  if (playing) {
    return (
      <iframe
        className="absolute inset-0 h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${title}`}
      className="group focus-visible:ring-ih-accent-soft absolute inset-0 h-full w-full cursor-pointer focus-visible:ring-[3px] focus-visible:outline-none"
    >
      <Image
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 780px) 100vw, 780px"
      />
      <span
        aria-hidden="true"
        className="bg-ih-ink/80 group-hover:bg-ih-accent absolute top-1/2 left-1/2 flex h-14 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg text-white transition-colors motion-reduce:transition-none"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  )
}
