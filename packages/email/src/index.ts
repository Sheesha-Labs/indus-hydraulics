export { sendEmail, sendEmailBatch, sendCampaignBatch, sendingDomainStatus, BATCH_LIMIT } from './send'
export type { SendingDomainStatus, CampaignBatchResult } from './send'
export type {
  SendEmailInput,
  SendEmailResult,
  EmailKind,
  EmailAttachment,
  RetryablePayload,
  SendEmailBatchResult,
} from './send'
export {
  retryFailedEmail,
  findRetryableEmailIds,
  isEligibleForRetry,
  RETRY_BACKOFF_MS,
  MAX_RETRIES,
  type RetryOutcome,
} from './retry'
export { renderRfqConfirmation } from './templates/rfq-confirmation'
export { renderRfqInternalAlert } from './templates/rfq-internal-alert'
export { renderQuoteSent } from './templates/quote-sent'
export { renderQuoteAck } from './templates/quote-ack'
export { renderQuoteExpiryReminder } from './templates/quote-expiry-reminder'
export { renderQuoteExpired } from './templates/quote-expired'
export { renderStaffInvitation } from './templates/staff-invitation'
export { renderNewsletterConfirmation } from './templates/newsletter-confirmation'
export { renderNewsletterWelcome } from './templates/newsletter-welcome'
export { renderCallbackSalesAlert, renderCallbackConfirmation } from './templates/callback'
export { renderLegalFooterText, type LegalFooter } from './templates/_layout'
export type { RfqConfirmationProps } from './templates/rfq-confirmation'
export type { RfqInternalAlertProps } from './templates/rfq-internal-alert'
export type { QuoteSentProps } from './templates/quote-sent'
export type { QuoteAckProps } from './templates/quote-ack'
export type { QuoteExpiryReminderProps } from './templates/quote-expiry-reminder'
export type { QuoteExpiredProps } from './templates/quote-expired'
export type { StaffInvitationProps } from './templates/staff-invitation'
export type { NewsletterConfirmationProps, NewsletterBranding } from './templates/newsletter-confirmation'
export type { NewsletterWelcomeProps } from './templates/newsletter-welcome'
export type { CallbackSalesAlertProps, CallbackConfirmationProps } from './templates/callback'
