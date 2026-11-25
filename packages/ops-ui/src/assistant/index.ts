// Assistant kit (S01-T09b): `@indus/ops-ui/assistant`. ProposalCard is the one card every Assistant
// proposal renders through (ADR-09); its verbs are server actions passed in by the page (S05+).
// Client parts: ProposalCard, ProposalActions (+ useProposalActions), OptionCard, OptionGroup.
// Shared: WhyList, CheckList, ProposalPreview, ConfidenceLine, Highlight, SourceQuote, UnsureRow.
export { default as ProposalCard } from './ProposalCard'
export {
  default as ProposalActions,
  canApproveFromKeyboard,
  isActionable,
  LATER_PRESETS,
  REJECT_REASONS,
  useProposalActions,
  type ProposalActionsProps,
  type ProposalController,
} from './ProposalActions'
export { default as WhyList, evidenceHref, type WhyListProps } from './WhyList'
export { default as CheckList, CHECK_MARK_LABEL, type CheckListProps } from './CheckList'
export { default as ProposalPreview, type ProposalPreviewProps } from './ProposalPreview'
export { default as ConfidenceLine } from './ConfidenceLine'
export { default as OptionCard } from './OptionCard'
export { default as OptionGroup, type OptionGroupProps } from './OptionGroup'
export { default as Highlight } from './Highlight'
export { default as SourceQuote } from './SourceQuote'
export { default as UnsureRow } from './UnsureRow'
export { default as WhyDate, type WhyDateProps } from './WhyDate'
export { formatAge, formatLaterUntil } from './age'
export type {
  AutonomyLevel,
  CheckItem,
  ConfidenceLineProps,
  EvidenceLink,
  HighlightProps,
  LaterUntil,
  OptionCardProps,
  OptionItem,
  PreviewLine,
  ProposalActionsInput,
  ProposalCardProps,
  ProposalState,
  Result,
  SourceQuoteProps,
  UnsureRowProps,
  WhyReason,
} from './types'
