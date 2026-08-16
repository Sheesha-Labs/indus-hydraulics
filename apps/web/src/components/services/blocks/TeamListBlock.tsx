import type { TeamListBlock } from '@indus/domain'

export default function TeamListBlockView({ block }: { block: TeamListBlock }) {
  return (
    <div className="my-4">
      {block.intro ? <p>{block.intro}</p> : null}
      <ul>
        {block.members.map((m, i) => (
          <li key={i}>
            <strong>{m.name}</strong> — {m.role}
            {m.location ? `, ${m.location}` : ''}. {m.scope}
          </li>
        ))}
      </ul>
      {block.caseFileMeta ? (
        <p className="mono mt-8 text-sm tracking-[0.04em] text-ih-muted">
          {block.caseFileMeta}
        </p>
      ) : null}
    </div>
  )
}
