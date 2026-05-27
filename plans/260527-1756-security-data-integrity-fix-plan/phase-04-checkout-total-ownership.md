---
phase: 4
title: "Checkout Total Ownership"
status: pending
priority: P1
effort: "1d"
dependencies: [2]
---

# Phase 4: Checkout Total Ownership

## Overview

Make backend own POS pricing, totals, and payment reconciliation. Fix append-items double counting.

## Requirements

- Functional: unit prices come from product/category pricing and service type.
- Functional: order totals equal persisted order item totals.
- Functional: append-items adds line subtotal once and creates payment for addon once.
- Non-functional: reject impossible/mismatched client totals with clear 400 errors.

## Architecture

Extend `OrderCheckoutService` to resolve price from `ProductPriceService`. Treat frontend price/paymentAmount as requested tender info, not source of truth.

Checkout money policy:
- Server total wins. Backend calculates `unitPrice`, `lineTotal`, `subtotalAmount`, and `totalAmount` from catalog/category pricing and service type.
- Ignore client `item.price` for persistence; keep it only as optional telemetry/debug input if needed.
- `paymentAmount` must equal the server-calculated order total for new checkout, or server-calculated addon subtotal for append-items.
- Non-cash/transfer mismatch returns 400. Do not silently normalize mismatched client payment totals.
- Cash uses `cashReceived` as tender amount: `cashReceived >= serverTotal` is valid, `cashReceived < serverTotal` returns 400.
- Append-items calculates `addonSubtotal` server-side, adds it to `order.totalAmount` exactly once, and creates one payment row with amount `addonSubtotal`.
- Frontend should refresh cart/order pricing from backend after a 400 mismatch, not retry with client-side prices.

## Related Code Files

- Modify: `backend/src/main/java/com/viepos/backend/services/OrderCheckoutService.java`
- Modify: `backend/src/main/java/com/viepos/backend/controllers/OrderController.java`
- Modify: `backend/src/main/java/com/viepos/backend/controllers/CardController.java`
- Modify: `backend/src/main/java/com/viepos/backend/services/ProductPriceService.java` if helper missing
- Modify frontend only if response contract changes: `frontend/src/pages/PosSalesPage.tsx`
- Create/modify tests under `backend/src/test/java/...`

## Implementation Steps

1. Tests Before: tampered item `price: 1` persists catalog-derived unit price.
2. Tests Before: append-items total increases by addon subtotal exactly once.
3. Tests Before: `paymentAmount < serverTotal` returns 400.
4. Tests Before: `paymentAmount > serverTotal` returns 400 for transfer/non-cash.
5. Tests Before: cash `cashReceived > serverTotal` succeeds and persists tender separately.
6. Tests Before: append-items payment row amount equals server-calculated addon subtotal.
7. Refactor `parseItems` to parse product/service/quantity only; price resolved after product load.
8. Use `ProductPriceService` to resolve `TAKEAWAY`, `PACKAGE_4H/FOUR_HOURS`, `FULL_DAY/FULLTIME`.
9. Remove controller total overrides from client `paymentAmount`.
10. For payments, use server-calculated order/addon amount; compare cash received separately.
11. Regression Gate: checkout/order tests pass.

## Success Criteria

- [ ] Client cannot undercharge by editing item price/paymentAmount.
- [ ] Transfer/non-cash payment mismatch returns 400.
- [ ] Cash over-tender is allowed through `cashReceived`; under-tender returns 400.
- [ ] Existing order append no longer double-counts total.
- [ ] Append-items creates payment amount equal to server-calculated addon subtotal.
- [ ] Revenue stats derive from consistent order/payment rows.

## Risk Assessment

Legacy frontend may send stale price names/durations. Keep service type normalization backwards-compatible.
