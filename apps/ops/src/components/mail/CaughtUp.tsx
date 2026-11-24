/**
 * Board 97 (1): the folder is empty because everything is filed and nothing needs a person.
 */
export default function CaughtUp({ today }: { today: number }) {
  return (
    <section
      aria-label="All caught up"
      className="flex flex-col items-center gap-2 px-4 py-10 text-center"
    >
      <span
        aria-hidden
        className="bg-io-ok-tint text-io-ok rounded-io-pill grid size-10 place-items-center text-[18px]"
      >
        ✓
      </span>
      <h2 className="io-display text-[24px] leading-[1.2]">All caught up</h2>
      <p className="text-io-ink-2 text-[13px]">
        {today === 0
          ? 'No mail yet today. Nothing needs you.'
          : `${today} ${today === 1 ? 'email' : 'emails'} today, all filed. Nothing needs you.`}
      </p>
    </section>
  )
}
