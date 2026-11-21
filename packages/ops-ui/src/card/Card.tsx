import { useId, type ReactNode } from 'react'
import { cn } from '../lib/cn'
import type { LinkSpec } from '../types'
import CardLink from './CardLink'
import KeyValue from './KV'
import List from './List'
import type { KVLabelWidth, KVPair, ListItem } from './types'

export interface CardProps {
  eyebrow?: string
  /** "See all" beside the eyebrow. */
  link?: LinkSpec
  title?: string
  /** The title's heading level; callers set it from the page outline. Default h3. */
  titleAs?: 'h2' | 'h3'
  text?: ReactNode
  items?: ListItem[]
  pairs?: KVPair[]
  kvLabelWidth?: KVLabelWidth
  children?: ReactNode
  /** Default section. */
  as?: 'section' | 'div' | 'article'
  className?: string
}

/**
 * Card kit card (`kr-cd`): white, line, radius 10, p 16×18, gap 10; eyebrow + link row; title 15/500 as a
 * heading; text 12.5/1.55 ink-2; list rows; key–value pairs. Cards at rest have no shadow (there is no
 * shadow prop). The title, or else the eyebrow, names the section.
 */
export default function Card({
  eyebrow,
  link,
  title,
  titleAs: Title = 'h3',
  text,
  items,
  pairs,
  kvLabelWidth,
  children,
  as: As = 'section',
  className,
}: CardProps) {
  const id = useId()
  const titleId = `${id}-title`
  const eyebrowId = `${id}-eyebrow`
  const labelledBy = title ? titleId : eyebrow ? eyebrowId : undefined
  return (
    <As
      data-part="card"
      {...(labelledBy ? { 'aria-labelledby': labelledBy } : {})}
      className={cn(
        'rounded-io-card border-io-line bg-io-card flex w-full min-w-0 flex-col gap-2.5 border px-[18px] py-4',
        className
      )}
    >
      {eyebrow || link ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span id={eyebrowId} className="io-eyebrow">
            {eyebrow}
          </span>
          {link ? (
            <CardLink
              href={link.href}
              external={link.external}
              className="text-[12.5px] whitespace-nowrap"
            >
              {link.label}
            </CardLink>
          ) : null}
        </div>
      ) : null}
      {title ? (
        <Title id={titleId} className="text-io-card-title m-0 leading-[1.45]">
          {title}
        </Title>
      ) : null}
      {text ? <p className="text-io-ink-2 m-0 text-[12.5px] leading-[1.55]">{text}</p> : null}
      {items?.length ? <List items={items} className="gap-2.5" /> : null}
      {pairs?.length ? (
        <KeyValue pairs={pairs} {...(kvLabelWidth ? { labelWidth: kvLabelWidth } : {})} />
      ) : null}
      {children}
    </As>
  )
}
