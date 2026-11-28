import { Fragment } from 'react'

/**
 * A clause body as it prints (upper case) with its `{variables}` shown as small tags (board 39). Text only: the
 * printed form is renderClause in ops-core.
 */
export default function ClauseBody({ body }: { body: string }) {
  const parts = body.split(/(\{[a-z_][a-z0-9_]*\})/g)
  return (
    <p className="m-0 text-[13px] leading-[1.6]">
      {parts.map((part, i) =>
        /^\{[a-z_][a-z0-9_]*\}$/.test(part) ? (
          <span
            key={i}
            className="bg-io-warn-tint text-io-ink-2 rounded-io-tag mx-0.5 px-1.5 py-0.5 text-[11.5px]"
          >
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part.toUpperCase()}</Fragment>
        )
      )}
    </p>
  )
}
