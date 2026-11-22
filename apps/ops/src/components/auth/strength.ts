/**
 * A rough strength guide for the board's four-segment meter, computed in the browser without the
 * zxcvbn dictionaries (they are large). It only guides: the server's rule (12+ characters, zxcvbn
 * score ≥ 3, not one of the last five) decides, and its sentence replaces the hint when it refuses.
 */
export function roughStrength(password: string): number {
  if (!password) return 0
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(password)).length
  let score = password.length >= 12 ? 2 : 1
  if (password.length >= 16) score += 1
  if (kinds >= 3) score += 1
  if (/^(.)\1+$/.test(password)) score = 1
  return Math.min(4, score)
}
