'use client'

import { cva } from 'class-variance-authority'
import { Search as SearchGlyph } from 'lucide-react'
import { useId, type InputHTMLAttributes } from 'react'
import { cn } from '../lib/cn'
import Kbd from './Kbd'

export interface SearchTriggerProps {
  placeholder?: string
  /** e.g. '⌘K'. */
  kbd?: string
  onOpen: () => void
  className?: string
}

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'md' | 'lg'
  /** "also matches 6316C3, 6316-C3". */
  matchedSpellings?: string[]
  kbd?: string
}

/** Controls kit `kc-search`: h 36 (lg 44, 14px), stroke border, radius 6, 14px glyph. */
const field = cva(
  'border-io-stroke rounded-io-ctl bg-io-card flex w-full min-w-[200px] items-center gap-[9px] border',
  {
    variants: {
      size: { md: 'h-io-btn pr-2.5 pl-3 text-[13px]', lg: 'h-11 px-3.5 text-[14px]' },
    },
    defaultVariants: { size: 'md' },
  }
)

function Glyph() {
  return (
    <SearchGlyph
      aria-hidden="true"
      strokeWidth={1.75}
      className="text-io-ink-3 size-3.5 flex-none"
    />
  )
}

/** The sidebar's search: a <button> that opens the command bar, not an input. */
export function SearchTrigger({
  placeholder = 'Search…',
  kbd,
  onOpen,
  className,
}: SearchTriggerProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      {...(kbd ? { 'aria-keyshortcuts': kbd.replace('⌘', 'Meta+') } : {})}
      className={cn(field({ size: 'md' }), 'io-focus cursor-pointer text-left', className)}
    >
      <Glyph />
      {/* ink-3, not the kit ph ink-4: here it is the button's visible name, not a placeholder, and ink-4 on
          white fails AA (axe color-contrast, serious). */}
      <span className="text-io-ink-3 flex-1">{placeholder}</span>
      {kbd ? <Kbd keys={kbd} /> : null}
    </button>
  )
}

/**
 * A search field (parts search is lg). The input sizes to its content so the matched-spellings hint sits
 * right after the typed value, as in the kit; the whole frame is a <label>, so a click anywhere focuses it.
 */
export function SearchInput({
  size = 'md',
  matchedSpellings,
  kbd,
  className,
  'aria-label': ariaLabel,
  ...rest
}: SearchInputProps) {
  const hintId = useId()
  const hint = matchedSpellings?.length ? `also matches ${matchedSpellings.join(', ')}` : ''
  return (
    <label className={cn(field({ size }), 'io-focus-field cursor-text', className)}>
      <Glyph />
      <span className="flex min-w-0 flex-1 items-baseline">
        <input
          type="search"
          aria-label={ariaLabel ?? (rest.placeholder ? undefined : 'Search')}
          {...(hint ? { 'aria-describedby': hintId } : {})}
          {...rest}
          className="placeholder:text-io-ink-4 field-sizing-content max-w-full min-w-[1ch] bg-transparent outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {hint ? (
          <small id={hintId} className="text-io-ink-3 ml-2 truncate text-[12px]">
            {hint}
          </small>
        ) : null}
      </span>
      {kbd ? <Kbd keys={kbd} /> : null}
    </label>
  )
}
