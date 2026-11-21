import * as React from 'react'
import { cn } from './lib/utils'

export interface StepperStep {
  label: string
  description?: string
}

export interface StepperProps {
  steps: StepperStep[]
  currentStep: number // 1-indexed
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <nav aria-label="Progress" className={cn('flex items-center', className)}>
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isCompleted = stepNumber < currentStep
        const isActive = stepNumber === currentStep
        const isUpcoming = stepNumber > currentStep

        return (
          <React.Fragment key={step.label}>
            <div className="flex items-center gap-2.5">
              {/* Step indicator */}
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center border font-mono text-xs font-semibold',
                  isCompleted && 'bg-ih-navy border-ih-ink text-white',
                  isActive && 'bg-ih-accent text-ih-accent-fg border-ih-accent',
                  isUpcoming && 'bg-ih-surface text-ih-muted-2 border-ih-border'
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                {isCompleted ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>

              {/* Label */}
              <div className="min-w-0">
                <p
                  className={cn('text-xs font-medium', isActive ? 'text-ih-ink' : 'text-ih-muted')}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-ih-muted-2 text-[10px]">{step.description}</p>
                )}
              </div>
            </div>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div
                className={cn('mx-3 h-px flex-1', isCompleted ? 'bg-ih-navy' : 'bg-ih-border')}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
