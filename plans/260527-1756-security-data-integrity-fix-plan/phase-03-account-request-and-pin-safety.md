---
phase: 3
title: "Account Request and PIN Safety"
status: pending
priority: P1
effort: "1d"
dependencies: [2]
---

# Phase 3: Account Request and PIN Safety

## Overview

Fix admin-role smuggling, PIN reset takeover, request-type confusion, and non-transactional approval flows.

## Requirements

- Functional: display name cannot encode role.
- Functional: PIN reset/change requests are bound to intended principal and policy.
- Functional: approval endpoint validates request type and target role.
- Non-functional: approval changes are atomic.

## Architecture

Use typed request intent, explicit role policy, and transactional approval methods. Policy for this plan: logged-out forgot-PIN is disabled; authenticated PIN change/request remains and must be bound to the authenticated principal. Defer email-token unauthenticated reset to a future issue because it needs token storage, expiry, delivery, rate limiting, and audit.

## Related Code Files

- Modify: `backend/src/main/java/com/viepos/backend/controllers/AuthController.java`
- Modify: `backend/src/main/java/com/viepos/backend/controllers/StaffController.java`
- Modify: `backend/src/main/java/com/viepos/backend/models/AccountRequest.java` if typed requested role is needed
- Modify: `backend/src/main/java/com/viepos/backend/repositories/AccountRequestRepository.java`
- Create/modify tests under `backend/src/test/java/...`

## Implementation Steps

1. Tests Before: admin-smuggling regression: `name = "Eve [ADMIN]"` still creates STAFF/pending staff only.
2. Tests Before: wrong request type cannot be approved through PIN endpoints.
3. Tests Before: unauthenticated `/api/staff/forgot-pin` is rejected or removed from the API contract.
4. Tests Before: authenticated STAFF cannot request or approve PIN change/reset for another user.
5. Remove role inference from `requestFullName`.
6. Add explicit server-controlled role handling for manager registration/admin registration.
7. Bind PIN change to authenticated principal and ignore/reject target email from request body.
8. Disable logged-out forgot-PIN in backend and align frontend to hide it or show "contact manager" instead of accepting a new PIN.
9. Move approve/reject flows into transactional service methods with status re-check.
10. Add lockout/rate-limit parity for staff PIN login/verify if feasible in this phase.
11. Regression Gate: targeted auth/staff tests pass.

## Success Criteria

- [ ] Name suffix cannot create ADMIN.
- [ ] PIN change/reset cannot target arbitrary account by body email.
- [ ] Logged-out forgot-PIN cannot set or request a new PIN.
- [ ] Forgot-PIN UI no longer submits `{ email, newPin }` without authentication.
- [ ] PIN approval validates `CHANGE_PIN` vs `RESET_PIN`.
- [ ] Approval leaves no partial request/user state on failure.

## Risk Assessment

Forgotten PIN UX will change in this plan. Document "contact manager" or equivalent operational fallback; do not build full email-token flow unless a later plan explicitly chooses it.
