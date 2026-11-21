// Controls kit (S01-T03): the base every other kit mounts. `@indus/ops-ui/controls`.
// Client parts: SegmentedRadios (via Segmented), PaneTabs, Toggle, CheckboxInput (via Checkbox), ModKey
// (via Kbd), SearchTrigger and SearchInput. Everything else is shared and renders from the server.
export {
  default as Button,
  buttonVariants,
  type ButtonOwnProps,
  type ButtonProps,
  type ButtonSize,
  type Labelled,
} from './Button'
export { default as ButtonLink, type ButtonLinkProps } from './ButtonLink'
export { default as Segmented, type SegmentOption, type SegmentedProps } from './Segmented'
export { default as LinkTabs, type LinkTabsProps, type TabItem, type TabsStyle } from './LinkTabs'
export { default as PaneTabs, type PaneTabsProps } from './PaneTabs'
export { default as Toggle, type ToggleProps } from './Toggle'
export { default as Checkbox, type CheckboxProps } from './Checkbox'
export {
  default as RadioGroup,
  Radio,
  type RadioGroupProps,
  type RadioOption,
  type RadioProps,
} from './Radio'
export { default as Select, type SelectProps } from './Select'
export { default as Choices, choiceText, type ChoiceOption, type ChoicesProps } from './Choices'
export { default as Kbd, type KbdProps } from './Kbd'
export {
  SearchInput,
  SearchTrigger,
  type SearchInputProps,
  type SearchTriggerProps,
} from './Search'
export { default as Spinner } from './Spinner'
export { default as Count, type CountTone } from './Count'
