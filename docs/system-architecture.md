# ViePOS - System Architecture

## Current Architecture

Only the auth, registration, RBAC, and dashboard shell slice is live now. POS, payments, and table workflows are planned, but the active runtime path is:

```
Browser
  -> Next.js App Router
  -> Better Auth routes + app auth routes
  -> Prisma/PostgreSQL
  -> Dashboard shell with server-side module filtering
```

## Request Routing

| Route | Behavior |
|---|---|
| `/` | Redirects to `/login` |
| `/login` | Public auth entry |
| `/api/auth/[...all]` | Better Auth session handler; direct credential signup/signin are blocked |
| `/api/app-auth/register` | Public registration API with app role/status policy |
| `/api/app-auth/login` | Login API with credential-first status gating |
| `/api/app-auth/logout` | Logout API that clears Better Auth cookies |
| `/dashboard` | Authenticated shell |
| `/dashboard/*` | Module pages behind server access checks |
| `/admin` | Redirects to `/dashboard` |
| `/pos` | Redirects to `/dashboard` |

## Authentication Flow

### Registration

1. Public form posts to `POST /api/app-auth/register`.
2. The handler rate limits by client IP with `AuthRateLimit` rows in PostgreSQL.
3. `server/auth/register-user.ts` normalizes the email and validates input.
4. The reserved root email `nguyennlt.ncc@gmail.com` is rejected.
5. A new Prisma `User` row is created with a linked `Account` row and an `AppUserProfile`.
6. New public accounts default to `STAFF` + `PENDING`.

### Login

1. Public form posts to `POST /api/app-auth/login`.
2. The handler rate limits by email plus client IP with `AuthRateLimit` rows in PostgreSQL.
3. `server/auth/auth-repository.ts` loads the user, linked credential account, and app profile.
4. Password verification uses the stored credential hash.
5. `server/auth/login-policy.ts` blocks `PENDING` and `DISABLED` users after valid credentials.
6. Better Auth creates the session through `app/api/auth/[...all]/route.ts`.
7. Successful logins redirect to `/dashboard`.

Direct Better Auth credential endpoints `/api/auth/sign-up/email` and `/api/auth/sign-in/email` are blocked so callers cannot bypass root-email rejection, pending-staff creation, rate limits, or status checks.

## RBAC Flow

The authenticated dashboard is server enforced.

1. `lib/auth/require-session.ts` loads the current session through Better Auth.
2. `requireActiveUser()` redirects unauthenticated or inactive users back to `/login`.
3. `requireModuleAccess(module)` redirects unauthorized users to `/dashboard`.
4. `lib/auth/permissions.ts` maps roles to visible modules.
5. `components/layout/dashboard-shell.tsx` renders the module nav from that server-side module list.

### Role To Module Map

| Role | Visible modules |
|---|---|
| `ROOT_ADMIN` | `sales`, `orders`, `menu`, `staff`, `staff-approvals`, `staff-roles`, `settings` |
| `ADMIN` | `sales`, `orders`, `menu`, `staff`, `staff-approvals`, `settings` |
| `STAFF` | `sales`, `orders` |

## Account Transition Rules

`server/auth/user-admin-service.ts` applies server-side transitions through `lib/auth/user-transitions.ts`.

| Action | Allowed path |
|---|---|
| Approve account | `STAFF` + `PENDING` -> `ACTIVE`, actor must be `ROOT_ADMIN` or `ADMIN` |
| Update role | Only `ROOT_ADMIN`, and only between `ADMIN` and `STAFF` |
| Disable account | `ROOT_ADMIN` can disable `ADMIN` or `STAFF`; `ADMIN` can disable `STAFF` |

The root admin target is immutable. `lib/auth/auth-roles.ts` treats the reserved root email as the root admin identity.

## Data Model

### Prisma Models

| Model | Purpose |
|---|---|
| `User` | Core account identity and Better Auth user record |
| `Session` | Better Auth session records |
| `Account` | Credential/provider linkage |
| `Verification` | Better Auth verification entries |
| `AppUserProfile` | App-level role and status |
| `AuthRateLimit` | Durable login/register rate-limit counters |

### Enums

| Enum | Values |
|---|---|
| `Role` | `ROOT_ADMIN`, `ADMIN`, `STAFF` |
| `UserStatus` | `PENDING`, `ACTIVE`, `DISABLED` |

## Server Responsibilities

| Area | Module |
|---|---|
| Auth config | `server/auth/better-auth.ts` |
| User lookup / creation | `server/auth/auth-repository.ts` |
| Public registration | `server/auth/register-user.ts` |
| Login policy | `server/auth/login-policy.ts` |
| Rate-limit storage | `server/auth/rate-limit-store.ts` |
| Raw credential endpoint guard | `server/auth/better-auth-route-policy.ts` |
| User transitions | `server/auth/user-admin-service.ts` |
| Access guards | `lib/auth/require-session.ts` |
| Permissions | `lib/auth/permissions.ts` |

## Legacy And Planned Surfaces

- `app/admin/page.tsx` and `app/pos/page.tsx` are compatibility redirects only.
- `lib/auth/demo-auth.ts`, `browser-accounts.ts`, and `browser-session.ts` are legacy scaffold helpers, not the production auth path.
- POS, payment, and table architecture should be documented separately once those routes are implemented.

## Unresolved Questions

None.
