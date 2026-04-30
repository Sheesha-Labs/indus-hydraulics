'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from './lib/utils'

const Tabs = TabsPrimitive.Root

// ── Underline-style tabs (storefront + admin detail pages) ───────────────────

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'flex border-b border-[var(--color-border)] gap-0',
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium',
      'text-[var(--color-muted)] border-b-2 border-transparent -mb-px',
      'hover:text-[var(--color-body)] transition-colors',
      'data-[state=active]:text-[var(--color-primary)] data-[state=active]:border-[var(--color-primary)]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
      'disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn('mt-4 focus-visible:outline-none', className)}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

// ── Segmented tabs (compact, inline style) ────────────────────────────────────

const SegmentedTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex items-center bg-[var(--color-deep)] border border-[var(--color-border)] p-0.5 gap-0.5',
      className
    )}
    {...props}
  />
))
SegmentedTabsList.displayName = 'SegmentedTabsList'

const SegmentedTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium',
      'text-[var(--color-muted)] transition-colors',
      'data-[state=active]:bg-[var(--color-elevated)] data-[state=active]:text-[var(--color-primary)] data-[state=active]:border data-[state=active]:border-[var(--color-border)]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
      'disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  />
))
SegmentedTabsTrigger.displayName = 'SegmentedTabsTrigger'

export { Tabs, TabsList, TabsTrigger, TabsContent, SegmentedTabsList, SegmentedTabsTrigger }
