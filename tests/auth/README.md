# Session and access-display regression

Run `node tests/auth/build.mjs && node tests/auth/test.mjs` from the repository root, then `npx tsc -b`.

Tests render the real useAuth/useAdmin hooks, Navbar and account control. Privy and Supabase are synthetic, all external requests are blocked, and the test never signs out a production account or writes to the production database. This suite verifies client session state only, not backend authorization.

Checks cover configured email-only owner access without database promotion, identity-switch masking, delayed profile results after logout, unknown roles, shared pending logout, failed logout recovery, provider readiness, login cancellation and profile read denial. Saved screenshot is synthetic.

Backend permissions, verified identity tokens, deployed policies, function authorization and production sign-in/logout need independent live verification before any claim that admin access is secured.
