import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // `next-auth/react`'s signIn/signOut resolve their base path from
      // NEXTAUTH_URL at build time (parseUrl returns '/api/auth' whenever the
      // pathname is '/'), so they always address the CUSTOMER Auth.js
      // instance. Once the storefront and admin share an origin that means
      // staff credentials posted to the customer authorize(), and an admin
      // "sign out" clearing the customer cookie while the staff session lives
      // on. Use the server actions in each app instead.
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next-auth/react",
              message:
                "Use the server actions (adminSignInAction / adminSignOutAction / signInAction / signOutAction) — next-auth/react cannot address the right Auth.js instance on a shared origin.",
            },
          ],
        },
      ],
    },
  },
  {
    // Storefront code must never reach for the STAFF Auth.js instance, and
    // admin code must never reach for the CUSTOMER one. Both export `auth`,
    // so a wrong import type-checks cleanly and fails only at runtime — which
    // is exactly how lib/staff-session.ts ended up calling the customer
    // instance during the merge, silently locking every staff member out of
    // /admin while the proxy still let them through.
    files: ["src/app/admin/**", "src/components/admin/**", "src/inngest/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/lib/auth", "**/lib/customer-session"],
              message:
                "Admin code must use lib/admin-auth and lib/staff-session — lib/auth is the CUSTOMER Auth.js instance.",
            },
          ],
          paths: [
            {
              name: "next-auth/react",
              message:
                "Use the server actions — next-auth/react cannot address the right Auth.js instance on a shared origin.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/app/(storefront)/**", "src/components/*.tsx", "src/actions/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/lib/admin-auth", "**/lib/staff-session", "**/lib/rbac"],
              message:
                "Storefront code must use lib/auth and lib/customer-session — lib/admin-auth is the STAFF Auth.js instance.",
            },
          ],
          paths: [
            {
              name: "next-auth/react",
              message:
                "Use the server actions — next-auth/react cannot address the right Auth.js instance on a shared origin.",
            },
          ],
        },
      ],
    },
  },
  {
    /*
     * The incremental cache handler is CommonJS, and has to be.
     *
     * Next loads `cacheHandler` by path at runtime with `require`, outside the
     * bundler and outside the module graph — so it cannot be ESM, and the
     * project-wide ban on `require()` does not apply to it. Scoped to this one
     * directory rather than relaxed globally.
     */
    files: ["cache/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
