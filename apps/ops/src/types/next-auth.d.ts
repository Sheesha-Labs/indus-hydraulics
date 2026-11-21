import 'next-auth'
import 'next-auth/jwt'

type OpsRole = 'owner' | 'helper'

declare module 'next-auth' {
  interface Session {
    user: { id: string; role: OpsRole; name: string; initials: string }
    sid: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    kind?: 'ops'
    role?: OpsRole
    sid?: string
    name?: string | null
    initials?: string
  }
}
