import { cn } from '../lib/cn'

interface SpinnerProps {
  className?: string
}

/**
 * Controls kit `kc-spin`: a 13px ring in the current text colour, three quarters drawn, turning at .8s.
 * Under reduced motion base.css stops it and draws a static faded ring. Decorative: the parent carries the
 * meaning (Button sets aria-busy and keeps its label, e.g. "Sending…").
 */
export default function Spinner({ className }: SpinnerProps) {
  return (
    <span
      aria-hidden="true"
      data-part="spinner"
      className={cn(
        'io-spin rounded-io-pill inline-block size-[13px] flex-none border-[1.5px] border-current border-r-transparent',
        className
      )}
    />
  )
}
