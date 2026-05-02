/** Format an AED amount as "AED 35,250.00". */
export function formatAed(n: number): string {
  const fixed = n.toFixed(2)
  const [intPart, decPart] = fixed.split('.')
  const withCommas = intPart!.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `AED ${withCommas}.${decPart}`
}

/** Format a Date as "24 Apr 2026" (UTC). */
export function formatDayMonthYear(d: Date): string {
  const day = d.getUTCDate()
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()]
  const year = d.getUTCFullYear()
  return `${day} ${month} ${year}`
}
