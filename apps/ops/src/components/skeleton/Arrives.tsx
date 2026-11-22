import { EmptyState } from '@indus/ops-ui/states'
import type { ReactNode } from 'react'

/** A sprint of the Ops plan (10-architecture §9.4): "S09". */
export type Sprint = `S${number}`

export interface ArrivesProps {
  /** The sprint that builds the page, from 10-architecture §9.4. */
  sprint: Sprint
  /** What the page will hold, in one sentence (the board it implements). */
  what: string
  /** Buttons that already work (links to a sibling page). At most one primary per view. */
  actions?: ReactNode
  headingLevel?: 2 | 3
}

/**
 * The S02 route skeleton's placeholder (S02-T07): every page of the route tree exists from S02 and says
 * which sprint fills it, so later sprints only fill pages. `data-arrives` names the sprint for tests.
 */
export default function Arrives({ sprint, what, actions, headingLevel = 2 }: ArrivesProps) {
  return (
    <div data-arrives={sprint} className="min-w-0">
      <EmptyState
        mark={sprint}
        title={`This page arrives in ${sprint}`}
        text={what}
        headingLevel={headingLevel}
        {...(actions ? { actions } : {})}
      />
    </div>
  )
}
