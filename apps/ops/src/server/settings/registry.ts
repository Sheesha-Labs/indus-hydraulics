import { z } from 'zod'

/**
 * The settings registry (S03-T04, ADR-01, ADR-28): one entry per `ops.settings_entry` key, with the
 * strict Zod schema its value must satisfy, who may change it, whether its seeded default waits for
 * the Owner's sign-off, and where Settings shows it.
 *
 * The VALUES live in the database (seeded by `…_ops_settings_defaults_seed.sql`, edited in Settings
 * and the setup wizard). Nothing here is a default: a component or service that needs a threshold
 * reads it with `getSetting(key)`, never from a constant (apps/ops/CLAUDE.md §6.10).
 *
 * Pure (Zod only, no server imports), so client forms may reuse a schema for inline validation.
 * The server always validates again (`updateSetting`).
 */

/** Mirrors `ops."SignoffStatus"` (get.ts asserts the two stay equal). */
export type SignoffStatus = 'awaiting' | 'signed_off' | 'not_required'

/** Settings home groups (board 84 sidebar and the Settings home list). */
export type SettingSection =
  | 'company'
  | 'money'
  | 'assistant'
  | 'documents'
  | 'enquiries'
  | 'access'
  | 'sending'
  | 'data'
  | 'setup'

// ── Shared field schemas ────────────────────────────────────────────────────────────────────

/** A percentage written as a number of percent (18 = 18 %). */
const pct = z
  .number()
  .finite()
  .min(0, 'Use a percentage from 0 to 100.')
  .max(100, 'Use a percentage from 0 to 100.')

/** ISO 4217 shape. Membership of `ops.currency` (active) is checked by `updateSetting`. */
const ccy = z.string().regex(/^[A-Z]{3}$/, 'Use a three-letter currency code, e.g. AED.')

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use a 24-hour time, e.g. 06:00.')

const positiveAmount = z.number().finite().positive('Use an amount above zero.')

const wording = z.string().trim().min(1, 'Write the wording.').max(200)

function wholeNumber(min: number, max: number, unit: string) {
  return z
    .number()
    .int('Use a whole number.')
    .min(min, `Use ${min} to ${max} ${unit}.`)
    .max(max, `Use ${min} to ${max} ${unit}.`)
}

function unique<T>(list: readonly T[]): boolean {
  return new Set(list).size === list.length
}

function isTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz })
    return true
  } catch {
    return false
  }
}

// ── Schemas per key ─────────────────────────────────────────────────────────────────────────

const companyProfile = z.strictObject({
  legalName: z.string().trim().max(200),
  tradingName: z.string().trim().max(200),
  /** UAE TRN: 15 digits, or empty until Setup 1 fills it. */
  trn: z.string().regex(/^(\d{15})?$/, 'A TRN is 15 digits.'),
  addressLines: z.array(z.string().trim().min(1).max(200)).max(6),
  phone: z.string().trim().max(40),
  website: z.string().trim().max(200),
  /** Where the copy script took the values from ("Copied from previous setup — check"). */
  copiedFrom: z.string().trim().min(1).max(200).nullable(),
  /** When the Owner confirmed the copied values on Setup 1. */
  confirmedAt: z.iso.datetime({ offset: true }).nullable(),
})

const companyAssets = z.strictObject({
  logoFileId: z.uuid().nullable(),
  stampFileId: z.uuid().nullable(),
  /** userId → file id of that person's signature image. */
  signatures: z.record(z.uuid(), z.uuid()),
})

const currency = z
  .strictObject({
    book: ccy,
    quotation: z.array(ccy).min(1, 'Choose at least one quotation currency.').max(13),
    defaultQuotation: ccy,
  })
  .superRefine((v, ctx) => {
    if (!unique(v.quotation)) {
      ctx.addIssue({ code: 'custom', path: ['quotation'], message: 'Each currency once.' })
    }
    if (!v.quotation.includes(v.defaultQuotation)) {
      ctx.addIssue({
        code: 'custom',
        path: ['defaultQuotation'],
        message: 'The default must be one of the quotation currencies.',
      })
    }
  })

const fx = z
  .strictObject({
    source: z.enum(['CBUAE']),
    fetchTimes: z.array(hhmm).min(1).max(6),
    timezone: z.string().refine(isTimeZone, 'Use a time zone such as Asia/Dubai.'),
    lockAt: z.enum(['capture']),
    repriceThresholdPct: pct.refine((n) => n > 0, 'Use a threshold above zero.'),
  })
  .superRefine((v, ctx) => {
    const sorted = [...v.fetchTimes].sort()
    if (!unique(v.fetchTimes) || sorted.some((t, i) => t !== v.fetchTimes[i])) {
      ctx.addIssue({
        code: 'custom',
        path: ['fetchTimes'],
        message: 'List each fetch time once, earliest first.',
      })
    }
  })

const vat = z.strictObject({
  standardRatePct: pct,
  localWording: wording,
  exportWording: wording,
})

const pricingDefaults = z
  .strictObject({
    /** sell = landed / (1 − margin), so 100 % is impossible. */
    marginPct: pct.refine((n) => n < 100, 'Use a margin below 100%.'),
    floorPct: pct,
    hardMinPct: pct,
    rounding: z.strictObject({
      stepAed: positiveAmount,
      above: z.strictObject({ thresholdAed: positiveAmount, stepAed: positiveAmount }),
    }),
    priceGuardPct: pct.refine((n) => n > 0, 'Use a guard above zero.'),
  })
  .superRefine((v, ctx) => {
    if (v.floorPct > v.marginPct) {
      ctx.addIssue({
        code: 'custom',
        path: ['floorPct'],
        message: 'The floor cannot be above the default margin.',
      })
    }
    if (v.hardMinPct > v.floorPct) {
      ctx.addIssue({
        code: 'custom',
        path: ['hardMinPct'],
        message: 'The hard minimum cannot be above the floor.',
      })
    }
  })

const landedDefaults = z.strictObject({
  freightPct: pct,
  insurancePct: pct,
  dutyPct: pct,
  bankPct: pct,
})

const assistantMode = z.strictObject({ mode: z.enum(['careful', 'balanced', 'hands_off']) })

const assistantBudget = z.strictObject({ monthlyUsd: positiveAmount.max(100_000) })

const researchCap = z.strictObject({
  perEnquiryUsd: positiveAmount.max(1_000),
  allowMoreUsd: z.number().finite().min(0).max(1_000),
})

const links = z.strictObject({ expiryDays: wholeNumber(1, 365, 'days') })

const intake = z.strictObject({
  callbackAlertMinutes: wholeNumber(1, 1440, 'minutes'),
  duplicateWindowDays: wholeNumber(1, 90, 'days'),
  /** C19: 20 MB per upload; Gmail's own 25 MB is the ceiling. */
  maxUploadMb: wholeNumber(1, 25, 'MB'),
})

const retention = z.strictObject({ years: wholeNumber(1, 20, 'years') })

const auth = z.strictObject({
  /** Display only: Auth.js reads 8 h from code; making it live is an S34 item. */
  sessionHours: wholeNumber(1, 24, 'hours'),
  lockAttempts: wholeNumber(3, 20, 'attempts'),
  lockMinutes: wholeNumber(1, 1440, 'minutes'),
  inviteDays: wholeNumber(1, 30, 'days'),
  resetMinutes: wholeNumber(5, 1440, 'minutes'),
})

const undo = z.strictObject({ sendWindowMinutes: wholeNumber(1, 60, 'minutes') })

/** `Name <address>` or a bare address. */
const mailbox = z
  .string()
  .trim()
  .max(200)
  .refine((s) => {
    const m = /^(?:[^<>@]{1,100} <([^<>\s]+)>|([^<>\s]+))$/.exec(s)
    const address = m?.[1] ?? m?.[2]
    return address !== undefined && z.email().safeParse(address).success
  }, 'Use an address, or a name and an address: Name <address>.')

const systemEmailSender = z.strictObject({ from: mailbox, replyTo: z.email() })

const setupProgress = z.strictObject({
  /** Users who have seen the first-run welcome (board 78). */
  welcomeSeenBy: z
    .array(z.uuid())
    .max(20)
    .refine((ids) => unique(ids), 'Each person once.'),
})

/** S04-T02: the Indus/* labels Ops creates in each mailbox (08-map-integrations §1.8; P02 sign-off). */
const LABEL_KEYS = [
  'enquiry',
  'clientReply',
  'po',
  'supplierQuote',
  'supplierQuestion',
  'needsOwner',
  'notBusiness',
  'ignore',
] as const
const indusLabel = z
  .string()
  .trim()
  .regex(/^Indus\/[^/\s][^/]{0,39}$/, 'Labels start with "Indus/" and are at most 40 characters.')
const mailLabelNames = z
  .strictObject(
    Object.fromEntries(LABEL_KEYS.map((k) => [k, indusLabel])) as Record<
      (typeof LABEL_KEYS)[number],
      typeof indusLabel
    >
  )
  .refine((v) => unique(Object.values(v)), 'Each label name once.')

/** S04-T02: the consent explainer's data-location line (ADR-32; board 86 said "EU region"). */
const mailboxConsent = z.strictObject({ dataLocation: z.string().trim().min(10).max(240) })

/** S04-T05: senders past mail never imports (P07 owns the full UI). Lower-case addresses and domains. */
const backfillExclusions = z.strictObject({
  addresses: z.array(z.email().transform((v) => v.toLowerCase())).max(500),
  domains: z
    .array(
      z
        .string()
        .trim()
        .toLowerCase()
        .regex(/^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/, 'Use a domain such as example.com.')
    )
    .max(500),
})

/** S04-T06: send timing (boards 87, 99, 100). Times are local clock "HH:MM" (the shared `hhmm` above). */
const span = z
  .strictObject({ start: hhmm, end: hhmm })
  .refine((v) => v.start < v.end, 'The end must be after the start.')
const sendTiming = z.strictObject({
  clientHours: span,
  window: z.strictObject({ after: hhmm, releaseAt: hhmm }),
  ramadanHours: span,
  supplierMorning: span,
  chaserNoFridayAfter: hhmm,
  capReset: hhmm,
  // S04-T07 board 87 "Send window". Optional so the S04-T06 seed row still parses (absent = next_morning).
  clientWindow: z.enum(['next_morning', 'immediately']).optional(),
})

/** S04-T07: signature blocks by sender (board 87). Sanitised HTML + its text, keyed by ops.user id. */
const signatureBlock = z.strictObject({
  html: z.string().max(10_000),
  text: z.string().max(5_000),
})
const sendSignatures = z.record(z.uuid(), signatureBlock)

/** S04-T07: attachment file names (board 87). `{n}` the document number, `{ref}` the RFQ reference. */
const fileNamePattern = z
  .string()
  .trim()
  .min(5)
  .max(80)
  .regex(/^[A-Za-z0-9 ._{}-]+\.pdf$/, 'Use letters, digits, - and _ only, ending in .pdf.')
const attachmentNames = z.strictObject({
  quotation: fileNamePattern.refine((v) => v.includes('{n}'), 'Include {n} for the number.'),
  supplierRfq: fileNamePattern.refine(
    (v) => v.includes('{ref}'),
    'Include {ref} for the reference.'
  ),
})

/** S04-T07: internal addresses the Owner's diagnostic "Send a test email…" may send to. */
const testAllowlist = z.strictObject({
  addresses: z.array(z.email().trim().toLowerCase()).max(10),
})
const weekday = z.number().int().min(0).max(6)
const countryWeekends = z.strictObject({
  default: z.array(weekday).min(1).max(3),
  byCountry: z.record(z.string().regex(/^[A-Z]{2}$/), z.array(weekday).min(1).max(3)),
})

// ── The registry ───────────────────────────────────────────────────────────────────────────

export type SettingDef<S extends z.ZodType = z.ZodType> = {
  schema: S
  /** Only the Owner may change it (`can(user, 'change_settings')`). */
  ownerOnly: boolean
  /** Seeded as `awaiting`: the Owner must confirm the default (ADR-28). */
  signoff: boolean
  label: string
  section: SettingSection
  /** Currency codes in the value, checked against `ops.currency` (active) before a save. */
  currencies?: (value: z.output<S>) => readonly string[]
  /** Margins or costs: its history rows are hidden from a Helper without canSeeMargins. */
  sensitive?: boolean
}

function def<S extends z.ZodType>(d: SettingDef<S>): SettingDef<S> {
  return d
}

export const SETTINGS = {
  'company.profile': def({
    schema: companyProfile,
    ownerOnly: true,
    signoff: false,
    label: 'Company details',
    section: 'company',
  }),
  'company.assets': def({
    schema: companyAssets,
    ownerOnly: true,
    signoff: false,
    label: 'Logo, stamp and signatures',
    section: 'company',
  }),
  currency: def({
    schema: currency,
    ownerOnly: true,
    signoff: false,
    label: 'Currencies',
    section: 'money',
    currencies: (v) => [v.book, ...v.quotation, v.defaultQuotation],
  }),
  fx: def({
    schema: fx,
    ownerOnly: true,
    signoff: true,
    label: 'Exchange rates',
    section: 'money',
  }),
  vat: def({ schema: vat, ownerOnly: true, signoff: true, label: 'VAT', section: 'money' }),
  'pricing.defaults': def({
    schema: pricingDefaults,
    ownerOnly: true,
    signoff: true,
    label: 'Margin, floor and rounding',
    section: 'money',
    sensitive: true,
  }),
  'landed.defaults': def({
    schema: landedDefaults,
    ownerOnly: true,
    signoff: true,
    label: 'Landed cost fallback rates',
    section: 'money',
    sensitive: true,
  }),
  'assistant.mode': def({
    schema: assistantMode,
    ownerOnly: true,
    signoff: false,
    label: 'How much the Assistant does',
    section: 'assistant',
  }),
  'assistant.budget': def({
    schema: assistantBudget,
    ownerOnly: true,
    signoff: true,
    label: 'Monthly AI budget',
    section: 'assistant',
  }),
  'research.cap': def({
    schema: researchCap,
    ownerOnly: true,
    signoff: true,
    label: 'Supplier research cap',
    section: 'assistant',
  }),
  links: def({
    schema: links,
    ownerOnly: true,
    signoff: true,
    label: 'Client link expiry',
    section: 'documents',
  }),
  intake: def({
    schema: intake,
    ownerOnly: true,
    signoff: true,
    label: 'Website enquiries and call-backs',
    section: 'enquiries',
  }),
  retention: def({
    schema: retention,
    ownerOnly: true,
    signoff: true,
    label: 'How long records are kept',
    section: 'data',
  }),
  auth: def({
    schema: auth,
    ownerOnly: true,
    signoff: true,
    label: 'Sign-in and invitations',
    section: 'access',
  }),
  undo: def({
    schema: undo,
    ownerOnly: true,
    signoff: false,
    label: 'Undo window for sends',
    section: 'sending',
  }),
  'system_email.sender': def({
    schema: systemEmailSender,
    ownerOnly: true,
    signoff: true,
    label: 'System email sender',
    section: 'sending',
  }),
  'mail.label_names': def({
    schema: mailLabelNames,
    ownerOnly: true,
    signoff: true,
    label: 'Gmail label names',
    section: 'sending',
  }),
  'mailbox.consent': def({
    schema: mailboxConsent,
    ownerOnly: true,
    signoff: true,
    label: 'Mailbox consent wording',
    section: 'sending',
  }),
  'mail.backfill_exclusions': def({
    schema: backfillExclusions,
    ownerOnly: true,
    signoff: true,
    label: 'Never import from these senders',
    section: 'sending',
  }),
  'send.timing': def({
    schema: sendTiming,
    ownerOnly: true,
    signoff: true,
    label: 'When emails are sent',
    section: 'sending',
  }),
  'calendar.country_weekends': def({
    schema: countryWeekends,
    ownerOnly: true,
    signoff: true,
    label: 'Weekends by country',
    section: 'sending',
  }),
  'send.signatures': def({
    schema: sendSignatures,
    ownerOnly: true,
    signoff: false,
    label: 'Signatures',
    section: 'sending',
  }),
  'send.attachment_names': def({
    schema: attachmentNames,
    ownerOnly: true,
    signoff: true,
    label: 'Attachment file names',
    section: 'sending',
  }),
  'mail.test_allowlist': def({
    schema: testAllowlist,
    ownerOnly: true,
    signoff: false,
    label: 'Test email addresses',
    section: 'sending',
  }),
  'setup.progress': def({
    schema: setupProgress,
    ownerOnly: false,
    signoff: false,
    label: 'First-run progress',
    section: 'setup',
  }),
} as const

export type Settings = typeof SETTINGS
export type SettingKey = keyof Settings
export type SettingValue<K extends SettingKey> = z.output<Settings[K]['schema']>

export const SETTING_KEYS = Object.keys(SETTINGS) as SettingKey[]

export function isSettingKey(key: string): key is SettingKey {
  return Object.hasOwn(SETTINGS, key)
}

/** The registry entry for a key, typed loosely for code that handles any key. */
export function settingDef(key: SettingKey): SettingDef {
  return SETTINGS[key] as unknown as SettingDef
}

// Named value types for the callers that read one key often.
export type AuthSettings = SettingValue<'auth'>
export type SystemEmailSender = SettingValue<'system_email.sender'>
export type CompanyProfile = SettingValue<'company.profile'>
export type MailLabelNames = SettingValue<'mail.label_names'>
export type MailLabelKey = keyof MailLabelNames
export type SendTiming = SettingValue<'send.timing'>
export type CountryWeekends = SettingValue<'calendar.country_weekends'>
export type SendSignatures = SettingValue<'send.signatures'>
export type AttachmentNames = SettingValue<'send.attachment_names'>
