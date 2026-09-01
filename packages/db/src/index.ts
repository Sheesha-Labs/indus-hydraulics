import { PrismaClient, Prisma } from '@prisma/client'
import { buildDatasourceUrl } from './datasource-url'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const datasourceUrl = buildDatasourceUrl()

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    ...(datasourceUrl ? { datasourceUrl } : {}),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export { buildDatasourceUrl } from './datasource-url'
export { Prisma }
export type {
  Redirect,
  SeoSetting,
  StoreSettings,
  EmailTemplate,
  ServiceCase,
} from '@prisma/client'
export {
  ServiceCaseStatus,
  ServiceCaseCategory,
  ServiceCaseCardTagStyle,
} from '@prisma/client'
export {
  nextRfqCode,
  nextAccountCode,
  nextQuoteCodeForRfq,
  nextScrapeCode,
  formatScrapeCode,
  quoteCodeToSlug,
  COUNTER_SCOPES,
  QUOTE_CODE_BASE,
  type NextQuoteCode,
  nextEnquiryCode,
  formatEnquiryCode,
} from './codes'
export { recordSlugRedirect } from './slug-redirect'
