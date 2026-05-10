// Shared domain types used across storefront and admin

export type Locale = 'en' | 'ar'

export type AccountTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export type RfqUrgency = 'routine' | 'priority' | 'plant_down'

export type Currency = 'USD' | 'EUR' | 'AED' | 'SAR'

export const SUPPORTED_LOCALES: Locale[] = ['en', 'ar']
export const DEFAULT_LOCALE: Locale = 'en'

export const TIER_COLORS: Record<AccountTier, string> = {
  bronze: 'text-amber-700 bg-amber-50 border-amber-200',
  silver: 'text-slate-600 bg-slate-50 border-slate-200',
  gold: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  platinum: 'text-purple-700 bg-purple-50 border-purple-200',
}

export const URGENCY_COLORS: Record<RfqUrgency, string> = {
  routine: 'text-slate-600 bg-slate-50',
  priority: 'text-amber-700 bg-amber-50',
  plant_down: 'text-red-700 bg-red-50',
}
