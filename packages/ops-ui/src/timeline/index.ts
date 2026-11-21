// Timeline kit (K-08, 05 §3.8). All parts are shared (no client state).
export {
  default as Timeline,
  TIMELINE_MARK_TEXT,
  type TimelineItem,
  type TimelineMark,
  type TimelineProps,
} from './Timeline'
export {
  default as ActivityFeed,
  ACTIVITY_MARK_TEXT,
  type ActivityItem,
  type ActivityMark,
  type ActivityProps,
} from './ActivityFeed'
export {
  default as Gantt,
  barLabel,
  ganttSummary,
  GANTT_STATE_TEXT,
  type GanttBar,
  type GanttBarKind,
  type GanttLabelWidth,
  type GanttMilestone,
  type GanttMilestoneKind,
  type GanttProps,
  type GanttRow,
} from './Gantt'
export { default as Diff, type DiffProps, type DiffRow } from './Diff'
export { default as WizardSteps, type WizardStepsProps } from './WizardSteps'
