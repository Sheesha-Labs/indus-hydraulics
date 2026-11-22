import { useId, type ReactNode } from 'react'
import { cn } from '../lib/cn'
import Fields from './Fields'

export interface FormSectionProps {
  title: string
  /** Under the title, 12.5 ink-3, e.g. "Printed on every quotation, PO and invoice." */
  description?: ReactNode
  /** Columns of the field grid, default 2. */
  cols?: 1 | 2 | 3
  /** <Field/>s, laid out in a Fields grid. */
  children: ReactNode
  className?: string
}

/**
 * Form kit Section (`kf-sc`): a settings section, a 260px label column beside the field grid, gap 28,
 * 20px top and bottom, a rule above every section but the first. Shared. A group named by its title.
 */
export default function FormSection({
  title,
  description,
  cols = 2,
  children,
  className,
}: FormSectionProps) {
  const id = useId()
  return (
    <div
      role="group"
      aria-labelledby={id}
      data-part="form-section"
      className={cn(
        'border-io-line grid w-full grid-cols-[var(--io-w-label-col)_minmax(0,1fr)] gap-7 border-t py-5 first:border-t-0',
        className
      )}
    >
      <div>
        <h3 id={id} className="text-[14px] leading-[1.45] font-medium">
          {title}
        </h3>
        {description ? (
          <p className="text-io-ink-3 mt-1 text-[12.5px] leading-[1.5]">{description}</p>
        ) : null}
      </div>
      <Fields cols={cols}>{children}</Fields>
    </div>
  )
}
