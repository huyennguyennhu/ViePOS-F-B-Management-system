---
phase: 2
title: "Authorization Boundary"
status: pending
priority: P1
effort: "1d"
dependencies: [1]
---

# Phase 2: Authorization Boundary

## Overview

Move all management authorization to backend and prevent STAFF from using admin/settings/product/category/staff mutation APIs.

## Requirements

- Functional: STAFF can use POS flows only.
- Functional: ADMIN can manage staff/products/categories/inventory only where business policy allows.
- Functional: ROOT_ADMIN required for settings export/delete and role elevation.
- Non-functional: frontend route guards remain UX only.

## Architecture

Tighten `SecurityConfig` route matchers and add controller/service-level actor checks for target-sensitive actions. Prefer one policy helper over repeated inline role branching.

Authorization policy:
- Public: `/api/ping`, `/error`, `/api/auth/login`, `/api/staff/login`, `/api/staff/register` only.
- STAFF: explicit POS and self-service endpoints only. Keep selling/session flows and product/category read endpoints required by POS.
- ADMIN: staff/product/category/inventory management where target role is STAFF only.
- ROOT_ADMIN: `/api/settings/data`, `/api/settings/export/zip`, role elevation, and admin/root target management.
- Fallback: unknown or unlisted `/api/**` routes are not STAFF-accessible. Prefer deny-by-default for write/management routes and explicit read allowlist for POS data.

Route matrix deliverable before implementation:
- List method + path + allowed roles for staff management, settings data, products/categories, inventory, orders, cards/sessions, auth/PIN, and POS reads.
- Include at least one regression row for an unlisted management route to prove broad `.anyRequest().authenticated()` does not reopen STAFF access.

## Related Code Files

- Modify: `backend/src/main/java/com/viepos/backend/security/SecurityConfig.java`
- Modify: `backend/src/main/java/com/viepos/backend/controllers/StaffController.java`
- Modify: `backend/src/main/java/com/viepos/backend/controllers/DataManagementController.java`
- Possibly create: `backend/src/main/java/com/viepos/backend/security/AuthorizationPolicy.java`
- Create/modify tests under `backend/src/test/java/...`

## Implementation Steps

1. Tests Before: write the backend route matrix and role tests for STAFF/ADMIN/ROOT_ADMIN on `/api/staff/**`, product/category mutations, inventory mutations, order status, `/api/settings/**`, POS order/card/session endpoints, and POS read endpoints.
   - Use direct backend calls; do not depend on frontend route guards.
2. Tests Before: add a regression proving STAFF cannot access an unlisted management `/api/**` endpoint through fallback authentication.
3. Update `SecurityConfig` so STAFF cannot call management routes and unlisted management routes cannot fall through to broad authenticated access.
4. Add actor-target checks:
   - STAFF cannot manage users.
   - ADMIN cannot create/edit/disable ADMIN or ROOT_ADMIN.
   - ROOT_ADMIN controls admin/root-level operations.
5. Require ROOT_ADMIN for `/api/settings/data` and `/api/settings/export/zip`.
6. Keep explicit POS endpoints available to STAFF.
7. Tests After: add direct-call tests proving localStorage role changes cannot grant backend rights.
8. Regression Gate: backend compile + targeted security tests.

## Success Criteria

- [ ] STAFF receives 403 for staff CRUD/approve/reject/role change/settings export/delete.
- [ ] ADMIN cannot create/promote/admin-root targets.
- [ ] ROOT_ADMIN can perform root-only operations.
- [ ] POS STAFF flows still authenticate.
- [ ] Unknown/unlisted management `/api/**` routes are not STAFF-accessible through fallback auth.

## Risk Assessment

Over-tightening can break POS endpoints currently living under broad authenticated routes. Mitigate with explicit route matrix before implementation and one STAFF POS smoke test.
