// Status kit (S01-T04): `@indus/ops-ui/status`. Every part renders from the server except BannerSlot (client:
// it discloses the banners it is not showing). The tone map itself is ../status.ts, re-exported here.
export {
  ASSISTANT_PILL,
  KIT_STATUS_FAMILIES,
  MAIL_ROLE_TONE,
  MAIL_TYPE_TONE,
  STATUS_FAMILY_META,
  STATUS_VOCABULARY,
  statusTone,
  statusToneLoose,
  TONE_CLASS,
  type StatusFamily,
  type StatusWord,
} from '../status'
export type { MailRole, MailType } from '../mail/types'
export { default as Chip, type ChipProps } from './Chip'
export { default as Check, type CheckProps } from './Check'
export { default as Tag, type TagKind, type TagProps } from './Tag'
export {
  default as Banner,
  BannerAction,
  type BannerActionProps,
  type BannerIcon,
  type BannerProps,
  type BannerTone,
} from './Banner'
export {
  default as BannerSlot,
  orderBanners,
  SYSTEM_BANNER_ORDER,
  type BannerSlotProps,
  type SystemBanner,
  type SystemBannerKind,
} from './BannerSlot'
export {
  default as StageTrack,
  ENQUIRY_STAGES,
  ORDER_STAGES,
  type EnquiryStage,
  type OrderStage,
  type StageTrackProps,
} from './StageTrack'
export { default as AssistantPill, type AssistantPillProps } from './AssistantPill'
export { default as ProgressBar, type ProgressBarProps } from './ProgressBar'
export { default as StatusVocabulary, type StatusVocabularyProps } from './StatusVocabulary'
