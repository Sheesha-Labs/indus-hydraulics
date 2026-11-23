import { SETUP_STEPS, type SetupStep } from './route-params'

/**
 * The six first-run steps as the boards draw them (78 welcome list, 79–83 rail): title, time, and the
 * word the previous step's primary uses ("Next: mailboxes"). Pure; the server and client parts share it.
 * Each step's status lives in `ops.checklist_item` (checklist `setup`), read by server/setup/progress.ts.
 *
 * `build` says which sprint draws the step's body: 'later' steps (2 and 3) show "Available in a later
 * update — skip for now" with Next enabled; 'pending' steps are built by another S03 task and show a
 * neutral placeholder until it lands in the step registry (components/setup/step-registry.tsx).
 */
export type SetupStepMeta = {
  title: string
  minutes: string
  /** After "Next: " on the step before this one. */
  nextLabel: string
  build: 'built' | 'pending' | 'later'
}

export const SETUP_STEP_META: Readonly<Record<SetupStep, SetupStepMeta>> = {
  company: {
    title: 'Company and documents',
    minutes: '5 min',
    nextLabel: 'company',
    build: 'built',
  },
  mailboxes: {
    title: 'Connect mailboxes',
    minutes: '3 min',
    nextLabel: 'mailboxes',
    build: 'later',
  },
  history: {
    title: 'Bring in your history',
    minutes: '2 min to choose',
    nextLabel: 'history',
    build: 'later',
  },
  money: {
    title: 'Money defaults',
    minutes: '4 min',
    nextLabel: 'money defaults',
    build: 'pending',
  },
  assistant: {
    title: 'How much should the Assistant do?',
    minutes: '1 min',
    nextLabel: 'Assistant',
    build: 'pending',
  },
  invite: { title: 'Invite your helper', minutes: '1 min', nextLabel: 'invite', build: 'pending' },
}

export const SETUP_TOTAL = SETUP_STEPS.length

/** "Invite Helper" with the Helper's first name once one exists, else "Invite your helper". */
export function stepTitle(step: SetupStep, helperFirstName?: string | null): string {
  if (step === 'invite' && helperFirstName) return `Invite ${helperFirstName}`
  return SETUP_STEP_META[step].title
}

export function stepIndex(step: SetupStep): number {
  return SETUP_STEPS.indexOf(step)
}

export function nextStep(step: SetupStep): SetupStep | null {
  return SETUP_STEPS[stepIndex(step) + 1] ?? null
}

export function previousStep(step: SetupStep): SetupStep | null {
  return SETUP_STEPS[stepIndex(step) - 1] ?? null
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name
}
