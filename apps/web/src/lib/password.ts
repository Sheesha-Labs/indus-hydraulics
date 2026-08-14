import crypto from 'node:crypto'
import { promisify } from 'node:util'

const pbkdf2 = promisify(crypto.pbkdf2)

// 100k iterations is OWASP's older minimum for PBKDF2-SHA256 and is fast
// enough on a small Vercel lambda (~150ms). New hashes encode the iteration
// count in the stored format so we can change it again later without locking
// existing users out. Switched from pbkdf2Sync to async pbkdf2 so the event
// loop isn't blocked during sign-in.
const ITERATIONS = 100_000
const KEY_LEN = 32
const DIGEST = 'sha256'

// Iteration count used for hashes created before we started encoding the
// count in the stored value. Anything in the legacy "salt:hash" format
// (no leading "<iters>$") is verified at this iteration count.
const LEGACY_ITERATIONS = 310_000

export async function hash(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex')
  const hashBuf = await pbkdf2(password, salt, ITERATIONS, KEY_LEN, DIGEST)
  return `${ITERATIONS}$${salt}:${hashBuf.toString('hex')}`
}

export async function verify(password: string, stored: string): Promise<boolean> {
  if (!stored) return false

  let iterations = LEGACY_ITERATIONS
  let saltAndHash = stored

  // New format encodes the iteration count: "<iters>$<salt>:<hash>"
  const dollarIdx = stored.indexOf('$')
  if (dollarIdx > 0) {
    const itersPart = stored.slice(0, dollarIdx)
    const parsed = Number.parseInt(itersPart, 10)
    if (Number.isFinite(parsed) && parsed > 0) {
      iterations = parsed
      saltAndHash = stored.slice(dollarIdx + 1)
    }
  }

  if (!saltAndHash.includes(':')) return false
  const [salt, hashHex] = saltAndHash.split(':') as [string, string]
  if (!salt || !hashHex) return false

  const hashBuf = await pbkdf2(password, salt, iterations, KEY_LEN, DIGEST)
  return hashBuf.toString('hex') === hashHex
}
