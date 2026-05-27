---
phase: 5
title: "Inventory and Session Consistency"
status: pending
priority: P1
effort: "1d"
dependencies: [4]
---

# Phase 5: Inventory and Session Consistency

## Overview

Fix manual inventory export, prevent negative/lost stock updates, prevent card double-booking, and make cancellation reconcile side effects.

## Requirements

- Functional: manual export request maps to valid backend transaction type.
- Functional: stock cannot become negative from export/sale.
- Functional: one card cannot have two active sessions.
- Functional: cancelling an order handles inventory/payment/session effects deliberately.
- Non-functional: concurrency behavior is guarded at DB/service boundary.

## Architecture

Add inventory mutation guard with lock/conditional update. Add card/session guard around startSession. Implement cancellation as a service method; start minimal with restock and session/card reconciliation. Preserve payment rows; add payment void/refund only if schema explicitly supports status.

## Related Code Files

- Modify: `backend/src/main/java/com/viepos/backend/models/enums/TransactionType.java`
- Modify: `backend/src/main/java/com/viepos/backend/controllers/InventoryController.java`
- Modify: `backend/src/main/java/com/viepos/backend/services/OrderCheckoutService.java`
- Modify: `backend/src/main/java/com/viepos/backend/controllers/CardController.java`
- Modify: `backend/src/main/java/com/viepos/backend/controllers/OrderController.java`
- Modify repositories for locking/conditional update as needed
- Create/modify tests under `backend/src/test/java/...`

## Implementation Steps

1. Tests Before: frontend `type=export` creates decrement transaction.
2. Tests Before: export/sale greater than stock returns 400 and leaves stock unchanged.
3. Tests Before: concurrent/duplicate startSession cannot create two active sessions for one card.
4. Tests Before: cancelling paid order creates compensating inventory action and preserves payment history.
5. Add `EXPORT` or explicit mapper for decrement transaction.
6. Add stock guard using pessimistic lock or conditional update.
7. Add card/session uniqueness guard and repository query for active session by card.
8. Implement cancellation service for status transition and side effects; if payment status is not modeled, leave payment immutable and document reconciliation behavior.
9. Regression Gate: inventory/session/order status tests pass.

## Success Criteria

- [ ] Manual export works and records correct transaction type.
- [ ] Negative stock path is impossible through API.
- [ ] Double-click/concurrent session start fails safely.
- [ ] Cancelled orders no longer silently leave inconsistent inventory/session state.

## Risk Assessment

Payment refund/void needs schema support. Current safe plan is preserve payment history and reconcile order/inventory/session state without deleting payment rows.
