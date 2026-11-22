import type { ReactNode } from 'react'

interface T9Base {
  /** The step track: Timeline `WizardSteps` (centred) or the vertical step list (rail). */
  steps: ReactNode
  /** The step's heading, the page's h1 (Instrument Serif: record 30 in the card, section 40 on the rail). */
  title: string
  /** Fields, the Form `Dropzone`, any note. */
  children: ReactNode
  /** Controls `Button` ghost "Back". */
  back?: ReactNode
  /** Controls `Button` secondary: "Skip for now" (centred), "Save and finish later" (rail). */
  skip?: ReactNode
  /** The one primary: "Start import", "Next: mailboxes". */
  next: ReactNode
  /** "Step n of 6 · saved 2 s ago", in the foot at the left. */
  saved?: ReactNode
  /** The product mark (logo slot + "Operations"). */
  brand?: ReactNode
}

/**
 * 'centred' (L2 t9a: new supplier, history import): a 760 card on paper; brand and progress over the step
 * track, the fields, back · skip · next in the foot. 'rail' (boards 79–83: first-run setup): the step list in
 * a 280 rail at the left, the fields with an optional live-preview aside, and a foot bar across the page.
 */
export type T9WizardProps = T9Base &
  (
    | {
        layout?: 'centred'
        /** "Step 3 of 5", right of the brand. */
        progress?: ReactNode
        aside?: never
        eyebrow?: never
        railFoot?: never
      }
    | {
        layout: 'rail'
        /** "Setup 1 of 6" above the title. */
        eyebrow?: string
        /** The live letterhead preview (setup 1), right of the fields, 3 : 2. */
        aside?: ReactNode
        asideLabel?: string
        /** Under the step list: "Progress saves as you go…". */
        railFoot?: ReactNode
        progress?: never
      }
  )

/** Template T9 · Wizard (L2 t9a; boards 79–83 for the rail layout). Layout only. */
export default function T9Wizard(props: T9WizardProps) {
  return props.layout === 'rail' ? <Rail {...props} /> : <Centred {...props} />
}

function Centred({
  steps,
  title,
  children,
  back,
  skip,
  next,
  saved,
  brand,
  progress,
}: Extract<T9WizardProps, { layout?: 'centred' }>) {
  return (
    <div
      data-template="T9"
      data-layout="centred"
      className="bg-io-paper flex min-h-screen w-full items-center justify-center p-8"
    >
      <div className="bg-io-card border-io-line rounded-io-dialog shadow-io-e1 w-io-wizard flex max-w-full flex-col border">
        <div
          data-slot="head"
          className="border-io-line flex flex-col gap-4 border-b px-7 py-[22px]"
        >
          {brand || progress ? (
            <div className="flex items-center gap-2.5">
              {brand}
              {progress ? (
                <div data-slot="progress" className="ml-auto">
                  {progress}
                </div>
              ) : null}
            </div>
          ) : null}
          <div data-slot="steps">{steps}</div>
        </div>
        <div data-slot="body" className="flex flex-col gap-4 px-7 py-6">
          <h1 className="io-display text-io-record">{title}</h1>
          {children}
        </div>
        <div
          data-slot="foot"
          className="border-io-line flex items-center gap-2 border-t px-7 py-3.5"
        >
          {back}
          {saved ? <div data-slot="saved">{saved}</div> : null}
          <span aria-hidden="true" className="flex-1" />
          {skip}
          {next}
        </div>
      </div>
    </div>
  )
}

function Rail({
  steps,
  title,
  children,
  back,
  skip,
  next,
  saved,
  brand,
  eyebrow,
  aside,
  asideLabel = 'Live preview',
  railFoot,
}: Extract<T9WizardProps, { layout: 'rail' }>) {
  return (
    <div
      data-template="T9"
      data-layout="rail"
      className="bg-io-paper grid h-screen min-h-0 w-full grid-cols-[var(--io-w-wizard-rail)_minmax(0,1fr)]"
    >
      <div
        data-slot="rail"
        className="bg-io-card border-io-line flex min-h-0 flex-col gap-5 overflow-y-auto border-r p-5"
      >
        {brand}
        <nav data-slot="steps" aria-label="Setup steps">
          {steps}
        </nav>
        {railFoot ? (
          <div data-slot="rail-foot" className="mt-auto">
            {railFoot}
          </div>
        ) : null}
      </div>
      <div className="flex min-h-0 min-w-0 flex-col">
        <div
          data-slot="body"
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-10 py-8"
        >
          <div className="flex flex-col gap-2">
            {eyebrow ? <span className="io-eyebrow">{eyebrow}</span> : null}
            <h1 className="io-display text-io-section">{title}</h1>
          </div>
          {aside ? (
            <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start gap-7">
              <div data-slot="fields" className="flex min-w-0 flex-col gap-4">
                {children}
              </div>
              <aside
                data-slot="aside"
                aria-label={asideLabel}
                className="flex min-w-0 flex-col gap-3"
              >
                {aside}
              </aside>
            </div>
          ) : (
            <div data-slot="fields" className="flex min-w-0 flex-col gap-4">
              {children}
            </div>
          )}
        </div>
        <div
          data-slot="foot"
          className="bg-io-card border-io-line flex flex-none items-center gap-2 border-t px-10 py-3.5"
        >
          {saved ? <div data-slot="saved">{saved}</div> : null}
          <span aria-hidden="true" className="flex-1" />
          {skip}
          {back}
          {next}
        </div>
      </div>
    </div>
  )
}
