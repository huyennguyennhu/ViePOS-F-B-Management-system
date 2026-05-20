# ViePOS — Project Roadmap

**Last Updated:** 2026-05-20  
**Status:** Planning Phase → Phase 1 Kickoff

---

## Phase Overview

| Phase | Title | Status | Duration | Deliverables |
|-------|-------|--------|----------|--------------|
| **Phase 1** | Setup & Authentication | 📋 Planned | 3 weeks | Auth system, login flows, role-based access |
| **Phase 2** | POS Sales & Payments | 📋 Planned | 3 weeks | Menu, cart, payment (cash/QR), receipts |
| **Phase 3** | Table Management | 📋 Planned | 2 weeks | Tables, realtime sync, table orders |
| **Phase 4+** | Analytics & Multi-branch | 🔮 Future | TBD | Advanced features, scaling |

---

## Phase 1: Setup & Authentication (Week 1–3)

**Goal:** Establish secure, multi-role login system with device fingerprinting and quick login.

### Deliverables
- [ ] Next.js 15 + React 19 + TypeScript + Tailwind setup
- [ ] Better Auth integration (email/password + PIN + OTP + device fingerprint)
- [ ] PostgreSQL + Prisma schema (User, Session, Device models)
- [ ] Redis cache layer
- [ ] Login screens (11 flows from Figma wireframe)
- [ ] Role-based route protection (Quản Lý vs Nhân Viên)
- [ ] PIN rate-limiting (5 attempts → 5 min lockout)
- [ ] Device quick-login ("Đăng nhập nhanh" — 7 day remembrance)
- [ ] Session management (4h Nhân Viên, 8h Quản Lý)
- [ ] E2E tests for auth flows

### Dependencies
- None (phase 1 is foundational)

### Success Criteria
- [ ] All 11 login flows match Figma wireframe pixel-perfect
- [ ] PIN entry auto-advances 6 cells correctly
- [ ] Device fingerprint survives browser restart
- [ ] "Đăng nhập nhanh" works on same device without re-entering PIN
- [ ] Failed login attempts locked out correctly
- [ ] OTP email delivery tested (transactional email service)
- [ ] Quản Lý can reset Nhân Viên PIN
- [ ] E2E test coverage >90% for auth flows

### Estimated Effort
- Setup + scaffolding: 3 days
- Better Auth integration: 2 days
- UI implementation (11 screens): 5 days
- Testing + polish: 2 days
- **Total: ~12 days (2 weeks with buffers)**

### Risk Mitigation
- Better Auth may need custom middleware for PIN integration → plan early
- Email delivery (OTP) requires transactional email service (SendGrid, Resend) → confirm provider in Week 1
- Device fingerprint security edge case (user agent spoofing) → mitigate with IP-based secondary check

---

## Phase 2: POS Sales & Payments (Week 4–6)

**Goal:** Full point-of-sale flow: menu browsing, cart, dual payment methods (cash + VietQR), receipt printing.

### Deliverables
- [ ] Menu management (Quản Lý: CRUD categories & items)
- [ ] Menu caching (Redis, 5-min TTL)
- [ ] POS main interface (3-zone layout: sidebar + menu grid + cart)
- [ ] Menu grid component (4 columns, item cards 75×75 with thumbnail + price)
- [ ] Cart state (Zustand + localStorage persistence)
- [ ] Cart panel (view items, adjust quantities, apply promotions)
- [ ] Promotion system (% or fixed discount)
- [ ] Payment flow (dual method selector)
- [ ] Cash payment (3×3 numpad with VND denominations, change calculation)
- [ ] QR payment (SePay integration, VietQR generation, webhook validation)
- [ ] Payment success modal ("Thanh toán hoàn tất")
- [ ] Receipt generation (ESC/POS format 80mm thermal)
- [ ] Print queue (BullMQ, retry logic)
- [ ] Print to PDF fallback
- [ ] Realtime payment status (Pusher/Soketi broadcast)
- [ ] E2E tests for order-to-payment flow

### Dependencies
- Phase 1 complete (auth system required for context)

### Success Criteria
- [ ] Add item to cart <100ms (optimistic UI)
- [ ] Payment processing <3s (SePay callback included)
- [ ] VND currency formatting correct (123.456 ₫ format)
- [ ] Cash change calculation accurate (including edge cases)
- [ ] QR code displays correctly, payment webhook validates
- [ ] Receipt prints without errors, UTF-8 Vietnamese text renders
- [ ] Cart persists across refresh (localStorage)
- [ ] Offline cart recoverable on reconnect
- [ ] SePay webhook HMAC signature validated
- [ ] E2E test coverage >85%

### Estimated Effort
- Menu CRUD + caching: 2 days
- POS UI layout: 2 days
- Cart state + persistence: 1 day
- Promotion logic: 1 day
- Cash payment UI + math: 1 day
- SePay integration: 2 days
- Receipt formatting: 1 day
- Print queue setup: 1 day
- Testing + polish: 2 days
- **Total: ~13 days (2 weeks with buffers)**

### Risk Mitigation
- SePay API may differ from docs → allot extra testing time, coordinate with SePay support
- Thermal printer WebUSB may have driver issues → have cloud print fallback ready
- VND currency edge cases (rounding) → write comprehensive unit tests early

---

## Phase 3: Table Management (Week 7–8)

**Goal:** Table-based ordering with realtime status sync across staff devices.

### Deliverables
- [ ] Table management (Quản Lý: CRUD tables, bulk import from CSV)
- [ ] Table status tracking (EMPTY → OCCUPIED → REQUESTING → COMPLETED)
- [ ] Table grid view (cards with status badges, seat count)
- [ ] Tap-table → separate order interface
- [ ] Multi-table order aggregation (combined bill option)
- [ ] Realtime table status broadcast (Pusher/Soketi)
- [ ] Multi-device sync (all staff see same table state)
- [ ] Table settlement UI (mark done → reset to EMPTY)
- [ ] "Requesting" status (customer calls for service)
- [ ] E2E tests for table workflows

### Dependencies
- Phase 1 (auth) + Phase 2 (orders & payments) complete

### Success Criteria
- [ ] Table grid updates realtime (<500ms) across 5+ concurrent staff
- [ ] Table status transitions correct (no invalid state changes)
- [ ] Multi-staff race condition handled (advisory lock or optimistic locking)
- [ ] Offline table grid recoverable on sync
- [ ] Table CSV import validates & rolls back on error
- [ ] Combined bill aggregates multiple orders correctly
- [ ] Payment from table view settles all pending orders
- [ ] E2E test coverage >80%

### Estimated Effort
- Table CRUD + schema: 1.5 days
- Table grid UI: 1 day
- Realtime sync setup (Pusher/Soketi): 1 day
- Table order interface: 1 day
- Settlement logic: 1 day
- Multi-device testing: 1 day
- Testing + polish: 1 day
- **Total: ~8 days (1.5 weeks with buffers)**

### Risk Mitigation
- Realtime race conditions (concurrent updates) → implement advisory locks or version-based optimistic locking early
- Soketi (self-hosted) vs Pusher cost → decide in Week 6; Soketi for cost-effective self-host, Pusher for reliability

---

## Phase 4 & Beyond: Future Enhancements

### Phase 4: Analytics & Reporting
- Revenue dashboard (daily/weekly/monthly)
- Top items by sales volume
- Staff performance metrics (orders per hour, avg payment time)
- Hourly transaction graphs
- **Estimated:** 2 weeks (after Phase 3)

### Phase 5: Multi-Branch Management
- Organization model (support 2+ store locations)
- Centralized menu, but per-branch overrides
- Cross-branch reporting
- Staff assignment to branch
- **Estimated:** 2 weeks

### Phase 6: Kitchen Display System (KDS)
- Kitchen screen (monitor orders real-time)
- Category-based lanes (Drinks, Food, Desserts)
- Mark item ready → notify POS
- Integration with table orders
- **Estimated:** 2 weeks

### Phase 7: Inventory & Suppliers
- Stock tracking per item
- Low-stock alerts
- Supplier order creation
- Purchase order history
- **Estimated:** 2 weeks

### Phase 8: Customer Loyalty
- QR code per customer (linked phone)
- Point accumulation per order
- Redeem promotions with points
- Member discounts
- **Estimated:** 2 weeks

### Phase 9: Advanced Promotions
- Combo deals (item A + B = discount)
- Time-based promotions (happy hour)
- Conditional discounts (spend X → discount Y%)
- Multi-use vouchers
- **Estimated:** 1 week

### Phase 10: Accounting & VAT
- Daily/monthly P&L reports
- VAT calculation & reporting
- Export for accountant (PDF/Excel)
- Tax authority compliance
- **Estimated:** 1 week

---

## Out of Scope (Explicitly Deferred)

- **Mobile app:** Web-first only (desktop POS). Mobile responsiveness deferred to Phase 11.
- **Kitchen display (KDS):** Separate system, Phase 6. Not in MVP.
- **Inventory management:** Deep stock tracking deferred to Phase 7.
- **Multi-branch:** Single-location MVP. Phase 5 adds org support.
- **Customer loyalty:** No member system in MVP. Deferred to Phase 8.
- **Advanced analytics:** MVP only has simple transaction logs. Phase 4 adds dashboards.
- **Integration with external systems:** ERPNext, Xero, etc. deferred to Phase 11+.

---

## Milestone Timeline

```
2026-05-20 ──────────────────────────────────────────── Now (Project Start)
           │
           ├─ Phase 1 (Auth) ─────────────────────────── Week 1-3
           │                 ├─ Setup Done: 2026-05-24
           │                 ├─ Auth UI: 2026-05-31
           │                 └─ Phase 1 Complete: 2026-06-07
           │
           ├─ Phase 2 (POS) ────────────────────────── Week 4-6
           │                 ├─ Menu System: 2026-06-14
           │                 ├─ Payments: 2026-06-21
           │                 └─ Phase 2 Complete: 2026-06-28
           │
           ├─ Phase 3 (Tables) ──────────────────────── Week 7-8
           │                  ├─ Table UI: 2026-07-05
           │                  └─ Phase 3 Complete: 2026-07-12
           │
           ├─ Testing & QA ──────────────────────────── Week 9
           │
           ├─ MVP Release ───────────────────────────── 2026-07-19
           │
           └─ Phase 4+ (Future Phases) ──────────────── TBD

```

---

## Success Metrics

### Phase 1 (Auth)
- Auth tests pass: 100%
- E2E flow execution time <2s
- Zero session collision bugs (multi-device login)

### Phase 2 (POS)
- Order creation <100ms
- Payment processing <3s
- Receipt print success rate >99%
- Cart persistence: 100% on browser refresh
- SePay webhook validation: 100% success

### Phase 3 (Tables)
- Realtime sync latency <500ms
- Multi-device concurrent orders: no race conditions
- Table state consistency across 5+ devices: 100%

### End-to-End (MVP)
- User can complete full order (menu → payment → receipt) in <2 min
- System uptime during business hours: >99.5%
- Error rate <0.1% (per transaction)
- Staff adoption rate >90% within 1 week of launch

---

## Dependencies & Blockers

### Critical Path
1. **PostgreSQL + Prisma schema** (blocks all phases)
2. **Better Auth setup** (blocks Phase 1)
3. **SePay API credentials & sandbox** (blocks Phase 2 QR payment)
4. **Thermal printer driver** (blocks Phase 2 printing)
5. **Realtime service (Pusher or Soketi)** (blocks Phase 3)

### Unresolved Items
- [ ] Confirm SePay sandbox environment availability
- [ ] Select transactional email provider (SendGrid vs Resend)
- [ ] Decide: Pusher (managed) vs Soketi (self-hosted)
- [ ] Thermal printer integration strategy (WebUSB vs cloud)
- [ ] Confirm PostgreSQL hosting (Neon, Supabase, RDS)

---

## Notes for Implementation Teams

### Handoff Protocol
1. Each phase completion triggers feature branch → pull request → code review
2. Phase 2 kickoff waits for Phase 1 PR merge to `main`
3. Parallel work: Phase 2 dev in `feat/pos-sales` branch while Phase 3 planning in progress
4. Docs updated in tandem with code (not post-release)

### Testing Strategy
- Phase 1: Unit tests (auth logic) + E2E (login flows)
- Phase 2: Unit (cart math, VND formatting) + E2E (order to receipt)
- Phase 3: Integration (realtime sync) + E2E (multi-device table ordering)

### Monitoring Post-Launch
- Error tracking: Sentry
- Performance monitoring: Web Vitals (Vercel Analytics)
- User session tracking: Hotjar (optional, privacy-compliant)
- Database queries: Prisma Studio (dev only), production slow-query log

---

## Unresolved Questions

1. **Launch date:** Target date for MVP launch? (Current estimate: 2026-07-19)
2. **Production environment:** Will MVP run on Vercel + Neon, or self-hosted Docker?
3. **Disaster recovery:** Backup strategy for PostgreSQL? (Daily snapshots?)
4. **Support SLA:** After launch, what's the bug fix SLA? (1h? 4h?)
5. **Monitoring alerts:** Who monitors production? When do we page on-call?
