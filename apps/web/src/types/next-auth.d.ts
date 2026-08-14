import type { DefaultSession } from 'next-auth'

/**
 * The single `next-auth` module augmentation for this app.
 *
 * The storefront and admin apps are being merged into one Next.js program.
 * Until now each declared its own `Session["user"]` shape — `{ id, accountId,
 * role }` on the storefront, `{ id, role }` in admin. Interface declaration
 * merging only permits duplicate members when their types are identical, so
 * two different shapes in one program is a hard `TS2717`, not a silent
 * widening. Both apps therefore declare this identical superset now, which
 * makes the merge a no-op for types.
 *
 * Deliberately a superset, not a discriminated union. `user: CustomerUser |
 * StaffUser` would turn every one of the ~207 existing `session.user.role` /
 * `session.user.accountId` reads into a narrowing error. The runtime narrowing
 * lives in `isStaffSession` / `isCustomerSession` instead, where it can
 * actually be enforced.
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      /**
       * Which Auth.js instance minted this session. Always present — the two
       * instances set it unconditionally, and the cookie rename means no
       * pre-split token is decryptable. Guards must REJECT a missing `kind`
       * rather than defaulting it.
       */
      kind: 'customer' | 'staff'
      /** `ContactRole` on customer sessions, `StaffRole` on staff sessions. */
      role: string
      /** Customer sessions only. Empty string on staff sessions. */
      accountId: string
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    /** Optional here: `getToken` reads raw, possibly-hostile input in proxy.ts, so the type forces a check. */
    kind?: 'customer' | 'staff'
    role?: string
    accountId?: string
  }
}

export {}
