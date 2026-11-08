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
      // pathname is '/'). The only Auth.js instance is the staff one, mounted
      // at /admin/api/auth, so those helpers address a route that does not
      // exist. Use the admin server actions instead.
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next-auth/react",
              message:
                "Use the server actions (adminSignInAction / adminSignOutAction) — next-auth/react resolves to /api/auth, and the only Auth.js instance lives at /admin/api/auth.",
            },
          ],
        },
      ],
    },
  },
  {
    // Storefront code must never reach for the STAFF Auth.js instance. A
    // session read in a storefront page would also make it render dynamically
    // — the storefront is fully public and has no sign-in of its own since
    // customer accounts were removed (2026-11).
    files: ["src/app/(storefront)/**", "src/components/*.tsx", "src/actions/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/lib/admin-auth", "**/lib/staff-session", "**/lib/rbac"],
              message:
                "Storefront code has no session — lib/admin-auth, lib/staff-session and lib/rbac belong to the STAFF Auth.js instance.",
            },
          ],
          paths: [
            {
              name: "next-auth/react",
              message:
                "Use the admin server actions — next-auth/react resolves to /api/auth, which does not exist.",
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
