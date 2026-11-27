import { parseDecimal, round, type DecimalString } from '../money/decimal'

/**
 * Amount in words for the documents (S11-T01): "US Dollars One Hundred Fifty-Seven Thousand Five Hundred
 * Eighty-Seven and Eight Cents only", "UAE Dirham Twelve Thousand and Fifty Fils only". Rounded to 2 dp
 * first; negatives are refused (a credit note states its amount positive).
 */

const ONES = [
  'Zero',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
]
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
const SCALES: Array<[bigint, string]> = [
  [1_000_000_000_000n, 'Trillion'],
  [1_000_000_000n, 'Billion'],
  [1_000_000n, 'Million'],
  [1_000n, 'Thousand'],
]

function below1000(value: number): string {
  const out: string[] = []
  let n = value
  if (n >= 100) {
    out.push(`${ONES[Math.floor(n / 100)]} Hundred`)
    n %= 100
  }
  if (n >= 20) {
    out.push(n % 10 ? `${TENS[Math.floor(n / 10)]}-${ONES[n % 10]}` : TENS[Math.floor(n / 10)]!)
  } else if (n > 0) out.push(ONES[n]!)
  return out.join(' ')
}

/** A whole number in words: 157587 → "One Hundred Fifty-Seven Thousand Five Hundred Eighty-Seven". */
export function integerInWords(n: bigint): string {
  if (n < 0n) throw new RangeError('negative amounts are not written in words')
  if (n === 0n) return ONES[0]!
  const out: string[] = []
  let rest = n
  for (const [size, name] of SCALES) {
    if (rest >= size) {
      out.push(`${integerInWords(rest / size)} ${name}`)
      rest %= size
    }
  }
  if (rest > 0n) out.push(below1000(Number(rest)))
  return out.join(' ')
}

const UNITS: Record<string, [major: string, minor: string]> = {
  AED: ['UAE Dirham', 'Fils'],
  USD: ['US Dollars', 'Cents'],
  EUR: ['Euro', 'Cents'],
  GBP: ['Pounds Sterling', 'Pence'],
  SAR: ['Saudi Riyals', 'Halalas'],
  OMR: ['Omani Rials', 'Baisa'],
  QAR: ['Qatari Riyals', 'Dirhams'],
  KWD: ['Kuwaiti Dinars', 'Fils'],
  BHD: ['Bahraini Dinars', 'Fils'],
  INR: ['Indian Rupees', 'Paise'],
  CNY: ['Chinese Yuan', 'Fen'],
}

export function amountInWords(value: DecimalString, currency: string): string {
  const fixed = round(parseDecimal(value), 2)
  if (fixed < 0n) throw new RangeError('negative amounts are not written in words')
  const cents = (fixed % 10_000n) / 100n
  const whole = fixed / 10_000n
  const [major, minor] = UNITS[currency.toUpperCase()] ?? [currency.toUpperCase(), 'Cents']
  const head = `${major} ${integerInWords(whole)}`
  return cents === 0n ? `${head} only` : `${head} and ${integerInWords(cents)} ${minor} only`
}
