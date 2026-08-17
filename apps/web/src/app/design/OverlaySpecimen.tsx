'use client'

import { useState } from 'react'
import { MoreHorizontal, Trash2 } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Pagination,
  ToastProvider,
  Tooltip,
  useToast,
} from '@indus/ui'

/**
 * Specimen for the overlay primitives. A client island because every one of
 * them is stateful, and the foundation board itself is a server component.
 *
 * The pagination demo drives real state rather than static markup so the
 * active/disabled edges at page one and page ten are actually reachable here —
 * they are exactly where an off-by-one in `pageRange` would show.
 */
export default function OverlaySpecimen() {
  return (
    <ToastProvider>
      <OverlayRow />
    </ToastProvider>
  )
}

function OverlayRow() {
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const totalPages = 10

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-3">
        {/* ── Dialog ─────────────────────────────────────────────── */}
        <Dialog>
          <DialogTrigger asChild>
            <Button kind="outline" size="sm">
              Open dialog
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Move 3 files to trash?</DialogTitle>
              <DialogDescription>
                They stay restorable for 30 days, then are removed and the storage is reclaimed.
              </DialogDescription>
            </DialogHeader>
            <DialogBody className="text-ih-ink-2">
              Nothing currently references these files. Anything still in use is skipped.
            </DialogBody>
            <DialogFooter>
              <Button kind="ghost" size="sm">
                Cancel
              </Button>
              <Button kind="primary" size="sm">
                Move to trash
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Dropdown ───────────────────────────────────────────── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button kind="outline" size="sm" aria-label="Row actions">
              <MoreHorizontal size={14} strokeWidth={1.8} aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Asset</DropdownMenuLabel>
            <DropdownMenuItem>Where is this used?</DropdownMenuItem>
            <DropdownMenuItem>Edit alt text</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive>Move to trash</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ── Tooltip, over an ENABLED control ───────────────────── */}
        <Tooltip label="Opens the file in its own detail panel.">
          <Button kind="ghost" size="sm">
            Hover me
          </Button>
        </Tooltip>

        {/* ── Tooltip, over a DISABLED control ───────────────────── */}
        <Tooltip
          label="In use — detach it first. Used in 3 products · 1 blog post."
          disabledChild
        >
          <Button kind="ghost" size="sm" disabled icon={<Trash2 size={13} strokeWidth={1.7} />}>
            Delete
          </Button>
        </Tooltip>

        {/* ── Toasts ─────────────────────────────────────────────── */}
        <Button
          kind="ghost"
          size="sm"
          onClick={() => toast({ title: 'Alt text saved.', tone: 'success' })}
        >
          Toast · success
        </Button>
        <Button
          kind="ghost"
          size="sm"
          onClick={() =>
            toast({
              title: "Couldn't reach storage.",
              description: 'Nothing was deleted. Try again in a moment.',
              tone: 'danger',
            })
          }
        >
          Toast · failure
        </Button>
      </div>

      {/* ── Pagination ───────────────────────────────────────────── */}
      <div className="border-t border-ih-border pt-6">
        <p className="mb-1 text-[12px] text-ih-muted">
          Page {page} of {totalPages} — walk to either end to see the disabled edges.
        </p>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          buildUrl={(n) => `#page-${n}`}
          linkComponent={function SpecimenLink({ href, className, children, ...rest }) {
            const n = Number(String(href).replace('#page-', ''))
            return (
              <a
                href={href}
                className={className}
                onClick={(e) => {
                  e.preventDefault()
                  setPage(n)
                }}
                {...rest}
              >
                {children}
              </a>
            )
          }}
        />
      </div>
    </div>
  )
}
