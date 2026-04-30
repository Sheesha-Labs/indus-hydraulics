import crypto from 'node:crypto'

const ITERATIONS = 310_000
const KEY_LEN = 32
const DIGEST = 'sha256'

export function hash(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hashBuf = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, DIGEST)
  return `${salt}:${hashBuf.toString('hex')}`
}

export function verify(password: string, stored: string): boolean {
  if (!stored || !stored.includes(':')) return false
  const [salt, hashHex] = stored.split(':') as [string, string]
  const hashBuf = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, DIGEST)
  return hashBuf.toString('hex') === hashHex
}
