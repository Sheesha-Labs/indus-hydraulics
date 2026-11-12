import type { ReactNode } from 'react'

import type { SketchBand } from '../../../lib/newsletter/template-catalogue'

type Props = { bands: readonly SketchBand[]; className?: string }

/**
 * A template's stack drawn as a tiny email — navy masthead, stripe, poster,
 * rows of products — so the dialog's cards can be told apart at a glance.
 * Each band takes a share of a fixed height (its `grow`), so a long template
 * is drawn compressed rather than cut off. Decorative: the card's title and
 * description say what it is.
 */
export default function TemplateSketch({ bands, className = '' }: Props) {
  return (
    <span aria-hidden="true" className={`flex h-[120px] w-[72px] shrink-0 flex-col overflow-hidden rounded-[4px] border border-ih-border bg-ih-surface shadow-sm ${className}`}>
      {bands.map((b, i) => (
        <Band key={i} band={b} />
      ))}
    </span>
  )
}

// Text lines and blocks inside a band.
const line = (w: string, tone = 'bg-ih-border-strong') => <span className={`block h-[2px] rounded-full ${tone} ${w}`} />
const box = (cls: string) => <span className={`block rounded-[1.5px] ${cls}`} />

function Band({ band }: { band: SketchBand }) {
  const [grow, cls, inner] = BANDS[band]
  return <span className={`flex min-h-0 basis-0 flex-col justify-center gap-[2px] overflow-hidden px-[5px] ${grow} ${cls}`}>{inner}</span>
}

const BANDS: Record<SketchBand, [string, string, ReactNode]> = {
  top: ['grow-[2]', 'bg-ih-accent', null],
  amber: ['grow-[2]', 'bg-ih-warning', null],
  mast: ['grow-[6]', 'bg-ih-navy', <span key="m" className="flex items-center justify-between">{box('h-[4px] w-[16px] bg-ih-surface')}{line('w-[14px]', 'bg-ih-on-navy-dim')}</span>],
  logo: ['grow-[5]', 'bg-ih-surface', box('h-[4px] w-[16px] bg-ih-accent')],
  stripe: ['grow-[2] px-0', 'bg-ih-accent border-b border-ih-steel', null],
  poster: [
    'grow-[9] items-center',
    'bg-ih-navy',
    <>
      {box('h-[4px] w-[44px] bg-ih-surface')}
      {box('h-[4px] w-[34px] bg-ih-steel')}
    </>,
  ],
  hero: ['grow-[10] items-center', 'bg-gradient-to-b from-ih-navy-2 to-ih-steel', <>{box('h-[4px] w-[38px] bg-ih-surface')}{line('w-[28px]', 'bg-ih-on-navy')}</>],
  image: ['grow-[9]', 'bg-gradient-to-br from-ih-steel to-ih-navy-2', null],
  heading: ['grow-[4]', 'bg-ih-surface', box('h-[3px] w-[40px] bg-ih-ink')],
  text: ['grow-[5]', 'bg-ih-surface', <>{line('w-full')}{line('w-[90%]')}{line('w-[70%]')}</>],
  grey: ['grow-[6] items-center', 'bg-ih-surface-2', <>{box('h-[3px] w-[34px] bg-ih-ink')}{line('w-[46px]')}{box('mt-[1px] h-[4px] w-[18px] bg-ih-accent')}</>],
  list: [
    'grow-[5]',
    'bg-ih-surface',
    <>
      {line('w-[80%]')}
      {line('w-[70%]')}
      {line('w-[75%]')}
    </>,
  ],
  pills: [
    'grow-[9] items-center',
    'bg-ih-navy',
    <>
      {[0, 1, 2].map((i) => (
        <span key={i} className="flex h-[5px] w-[48px] items-center gap-[2px] rounded-full bg-ih-surface px-[1px]">
          <span className="h-[3px] w-[3px] rounded-full bg-ih-accent" />
        </span>
      ))}
    </>,
  ],
  bars: ['grow-[8] items-center', 'bg-ih-navy', <>{[0, 1, 2].map((i) => <span key={i} className="block h-[4px] w-[46px] rounded-[1px] bg-ih-accent" />)}</>],
  'tiles-ticks': [
    'grow-[7]',
    'bg-ih-navy',
    <span key="t" className="grid grid-cols-2 gap-[2px]">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="block h-[6px] rounded-[1px] bg-ih-navy-2" />
      ))}
    </span>,
  ],
  grid: [
    'grow-[9]',
    'bg-ih-surface-2',
    <span key="g" className="grid grid-cols-2 gap-[3px]">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="flex flex-col overflow-hidden rounded-[1px]">
          <span className="block h-[8px] bg-ih-steel" />
          <span className="block h-[2px] bg-ih-navy" />
        </span>
      ))}
    </span>,
  ],
  rows: [
    'grow-[6]',
    'bg-ih-surface-2',
    <span key="r" className="flex items-center gap-[3px] rounded-[1.5px] bg-ih-surface p-[2px]">
      <span className="block h-[10px] w-[16px] rounded-[1px] bg-ih-steel-soft" />
      <span className="flex flex-1 flex-col gap-[2px]">
        {box('h-[2px] w-[22px] bg-ih-accent')}
        {line('w-[26px]')}
        {box('h-[3px] w-[10px] bg-ih-accent')}
      </span>
    </span>,
  ],
  tiles: [
    'grow-[7]',
    'bg-ih-surface-2',
    <span key="t" className="grid grid-cols-3 gap-[2px]">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`block h-[7px] rounded-[1px] ${i === 5 ? 'bg-ih-accent' : 'bg-ih-surface'}`} />
      ))}
    </span>,
  ],
  cards: ['grow-[7]', 'bg-ih-surface-2', <span key="c" className="flex flex-col overflow-hidden rounded-[1.5px] bg-ih-surface"><span className="block h-[9px] bg-ih-steel" />{line('m-[2px] w-[34px]')}</span>],
  stats: [
    'grow-[5]',
    'bg-ih-navy',
    <span key="s" className="flex justify-between">
      {[0, 1, 2].map((i) => (
        <span key={i} className="block h-[4px] w-[14px] rounded-[1px] bg-ih-surface" />
      ))}
    </span>,
  ],
  steps: [
    'grow-[6]',
    'bg-ih-surface',
    <span key="s" className="flex justify-between px-[2px]">
      {[0, 1, 2].map((i) => (
        <span key={i} className="block h-[7px] w-[7px] rounded-full bg-ih-accent" />
      ))}
    </span>,
  ],
  quote: ['grow-[5] items-center', 'bg-ih-surface', <>{box('h-[3px] w-[40px] bg-ih-ink-2')}{line('w-[20px]')}</>],
  kv: [
    'grow-[5]',
    'bg-ih-surface-2',
    <>
      {[0, 1, 2].map((i) => (
        <span key={i} className="flex justify-between">
          {line('w-[18px]')}
          {box('h-[2px] w-[14px] bg-ih-ink-2')}
        </span>
      ))}
    </>,
  ],
  offer: ['grow-[7]', 'bg-ih-surface-2', <span key="o" className="flex flex-col gap-[2px] rounded-[1.5px] border border-ih-border bg-ih-surface p-[3px]">{box('h-[3px] w-[12px] rounded-full bg-ih-accent')}{box('h-[3px] w-[34px] bg-ih-ink')}{line('w-[40px]')}</span>],
  person: ['grow-[5]', 'bg-ih-surface-2', <span key="p" className="flex items-center gap-[3px]"><span className="block h-[8px] w-[8px] rounded-full bg-ih-steel" />{line('w-[30px]')}</span>],
  button: ['grow-[3]', 'bg-ih-surface', box('h-[4px] w-[20px] bg-ih-accent')],
  cta: ['grow-[7] items-center', 'bg-ih-navy', <>{box('h-[3px] w-[36px] bg-ih-surface')}{box('mt-[1px] h-[5px] w-[22px] bg-ih-surface')}</>],
  footer: [
    'grow-[6] items-center',
    'bg-ih-navy',
    <span key="f" className="flex gap-[2px]">
      {[0, 1, 2].map((i) => (
        <span key={i} className="block h-[4px] w-[4px] rounded-full bg-ih-surface" />
      ))}
    </span>,
  ],
}
