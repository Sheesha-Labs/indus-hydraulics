import { OAuth2Server } from 'oauth2-mock-server'
import { GOOGLE_MOCK_PORT, readGoogleClaims } from './google-mock'

/**
 * Starts the mock Google issuer for the whole run (S03-T07). If the port is taken (another run, or a
 * mock already up for a hand-started dev server), the existing one is reused.
 */
export default async function globalSetup() {
  const server = new OAuth2Server()
  await server.issuer.keys.generate('RS256')
  server.service.on('beforeTokenSigning', (token) => {
    const claims = readGoogleClaims()
    if (!claims) return
    const { email, hd, email_verified } = claims
    token.payload.email = email
    token.payload.email_verified = email_verified ?? true
    token.payload.name = email.split('@')[0]
    token.payload.sub = `e2e-${email}`
    if (hd) token.payload.hd = hd
    else delete token.payload.hd
  })
  try {
    await server.start(GOOGLE_MOCK_PORT, 'localhost')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EADDRINUSE') return
    throw error
  }
  return async () => {
    await server.stop()
  }
}
