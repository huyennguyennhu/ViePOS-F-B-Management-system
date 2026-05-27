---
phase: 6
title: "Data Exposure and API Contracts"
status: pending
priority: P2
effort: "0.75d"
dependencies: [2, 3]
---

# Phase 6: Data Exposure and API Contracts

## Overview

Remove stack trace leaks, neutralize CSV export risks, bound exports, and fix dead frontend API wrappers.

## Requirements

- Functional: API errors return sanitized messages and trace IDs.
- Functional: exported CSV cannot execute formulas in spreadsheet apps.
- Functional: frontend wrappers match backend routes.
- Non-functional: export remains downloadable with stable filename behavior.

## Architecture

Use one `@RestControllerAdvice` for errors. Use a CSV escaping utility. Keep frontend API service as thin route map.

## Related Code Files

- Modify: `backend/src/main/java/com/viepos/backend/controllers/OrderController.java`
- Modify: `backend/src/main/java/com/viepos/backend/controllers/CardController.java`
- Modify: `backend/src/main/java/com/viepos/backend/controllers/DataManagementController.java`
- Create: `backend/src/main/java/com/viepos/backend/controllers/GlobalExceptionHandler.java` or similar
- Create: `backend/src/main/java/com/viepos/backend/util/CsvExportUtil.java` or similar
- Modify: `frontend/src/services/api.ts`
- Modify: `frontend/src/pages/StaffLoginPage.tsx`
- Create/modify tests under backend/frontend test locations

## Implementation Steps

1. Tests Before: malformed checkout response does not include `stackTrace`.
2. Tests Before: CSV field beginning `=`, `+`, `-`, `@` is neutralized.
3. Tests Before: broad export range rejected/bounded.
4. Remove local `@ExceptionHandler` stack trace bodies from controllers.
5. Add global sanitized exception handler with server-side logging.
6. Add CSV escape/neutralization helper and use it for exports.
7. Add export max range/streaming or pagination guard.
8. Fix `authAPI.adminLogin` to `/api/auth/login` or remove it.
9. Fix `productAPI.getCategories` to `/api/categories` or remove it.
10. Align forgot-PIN UI with Phase 3 policy: hide logged-out reset or replace it with a non-submitting "contact manager" flow.
11. Regression Gate: backend targeted tests + frontend build/type-check.

## Success Criteria

- [ ] No API response exposes stack trace.
- [ ] CSV formula injection blocked.
- [ ] Export cannot load unbounded dataset into memory.
- [ ] API wrappers no longer point to nonexistent routes.
- [ ] Staff login page no longer submits logged-out forgot-PIN `{ email, newPin }`.

## Risk Assessment

Forgot-PIN UI must follow the settled Phase 3 policy. Keep the frontend change minimal: remove the logged-out PIN reset submit path and use a non-submitting contact-manager fallback if UI copy is needed.
