import { LogoPlaceholder } from '@indus/ops-ui/shell'
import { T12Client } from '@indus/ops-ui/templates'
import Arrives, { type Sprint } from './Arrives'

export interface ClientSkeletonProps {
  eyebrow: string
  title: string
  sprint: Sprint
  what: string
}

/**
 * T12 Client page skeleton: the website look and no console chrome. It says nothing about the document:
 * until its sprint verifies the token, a page must not hint whether a token is valid.
 */
export default function ClientSkeleton({ eyebrow, title, sprint, what }: ClientSkeletonProps) {
  return (
    <T12Client
      brandBar={
        <span className="flex h-[34px] items-center overflow-hidden">
          <LogoPlaceholder />
        </span>
      }
      eyebrow={eyebrow}
      title={title}
      document={<Arrives sprint={sprint} what={what} />}
      actions={null}
    />
  )
}
