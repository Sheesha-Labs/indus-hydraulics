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
      'flex border-b border-ih-border gap-0',
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
      'text-ih-muted border-b-2 border-transparent -mb-px',
      'hover:text-ih-ink-2 transition-colors',
      'data-[state=active]:text-ih-ink data-[state=active]:border-ih-ink',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent',
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
      'inline-flex items-center bg-ih-surface-2 border border-ih-border p-0.5 gap-0.5',
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
      'text-ih-muted transition-colors',
      'data-[state=active]:bg-ih-surface data-[state=active]:text-ih-ink data-[state=active]:border data-[state=active]:border-ih-border',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent',
      'disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  />
))
SegmentedTabsTrigger.displayName = 'SegmentedTabsTrigger'

export { Tabs, TabsList, TabsTrigger, TabsContent, SegmentedTabsList, SegmentedTabsTrigger }
