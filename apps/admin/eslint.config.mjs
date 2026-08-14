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
