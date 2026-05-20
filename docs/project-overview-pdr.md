# ViePOS — Product Development Requirements

## Vision & Value Proposition

**ViePOS** is a desktop web POS (Point-of-Sale) system built for Vietnamese food & beverage businesses—cafés, restaurants, eateries. Designed specifically for cashier counters (quầy thu ngân).

**Tagline:** "Vừa - Đủ - Tinh Gọn" (Just right - Complete - Lean)  
**Slogan:** "Từ bán hàng đến vận hành trong một hệ thống" (From sales to operations in one system)

### Core Promise

- **Lean:** Minimal, focused feature set—no bloat.
- **Fast:** Sub-100ms tap-to-add-cart, instant feedback.
- **Local-first:** Works offline; syncs when online.
- **VN-native:** VND pricing, thermal receipt printing, Vietnamese banking (SePay VietQR).

---

## Target Users & Personas

### Persona 1: Quản Lý (Manager)
- **Role:** Store owner or shift manager
- **Login:** Email + Password
- **Responsibilities:** Staff management, menu configuration, reports, cash reconciliation
- **Pain points:** Manual order tracking, paper receipts, no visibility into sales
- **Needs:** Simple setup, quick troubleshooting, PIN management for staff

### Persona 2: Nhân Viên (Staff / Cashier)
- **Role:** Counter cashier, order taker
- **Login:** PIN (6-digit) + email (fast path) or email + PIN (first-time)
- **Responsibilities:** Ring up orders, collect payment, print receipts
- **Pain points:** Slow POS, manual math errors, table order confusion
- **Needs:** One-hand operation, fast PIN entry, clear order status, "Đăng nhập nhanh" (quick login on remembered device)

---

## Functional Requirements by Phase

### Phase 1: Authentication & Authorization (MVP Sprint 1)

**FR-1.1: Manager Login**
- Email + password login form (left form panel, right hero with slogan on green gradient bg)
- Password reset via email (OTP flow)
- Role: Quản Lý dashboard access

**FR-1.2: Staff PIN Login**
- 6-digit PIN entry interface with focus-advancing cells
- Email lookup before PIN entry
- First-time staff: set new PIN (confirm PIN, both rows × 3 cells)
- Forgot PIN flow: email verification → new PIN setup
- Change PIN: old PIN → new PIN
- Role: Nhân Viên dashboard access

**FR-1.3: Quick Login (Đăng nhập nhanh)**
- "Remember this device" checkbox (device fingerprint)
- Skip email/PIN on trusted devices for 7 days
- Session persistence in localStorage + secure cookie

**FR-1.4: Role-Based Access Control (RBAC)**
- Quản Lý: full menu/staff/settings access
- Nhân Viên: POS & table management only
- No cross-role visibility

**FR-1.5: Session Management**
- Better Auth for multi-factor support
- Session timeout: 8 hours (Quản Lý), 4 hours (Nhân Viên, auto-logout on inactivity)

### Phase 2: POS Sales (MVP Sprint 2)

**FR-2.1: Menu Management (Quản Lý only)**
- Create/edit/delete menu categories
- Create/edit/delete menu items: name, price (VND), image, stock (optional)
- Promote items (featured section in menu grid)
- Search/filter menu by category

**FR-2.2: Point-of-Sale Interface**
- 3-zone layout: sidebar + menu grid center + cart right panel
- Menu grid: items as cards (75×75 thumbnail, name, price, quantity stepper)
- Category tabs in sidebar (dynamic from menu)
- Add/remove items from cart
- Quantity adjustments (stepper or number input)
- Special requests per item (e.g., "no ice", "extra hot")—text field in item detail popup

**FR-2.3: Promotions**
- Simple discount (% or fixed VND) per order
- Promotion picker modal (select from configured list or apply code)
- Display total, discount amount, final amount in cart

**FR-2.4: Payment Processing**
- Two payment methods:
  - **TIỀN MẶT (Cash):** Numpad (3×3 grid, 1k→200k VND denominations) + change calculation
  - **CHUYỂN KHOẢN (Bank Transfer):** SePay VietQR → QR image → webhook callback on payment
- Payment success modal: order ID, total, payment method, receipt preview
- Estimated payment timeout: 5 min (QR expires, order can be re-issued)

**FR-2.5: Receipt Printing**
- ESC/POS thermal printer (WebUSB or cloud print service)
- Compact 80mm format: store name, order ID, items, total, payment method, timestamp, thank-you message
- Reprint last receipt button
- Print to PDF (fallback)

**FR-2.6: Cart Persistence**
- Zustand + localStorage: cart survives browser refresh
- Clear cart after successful payment
- Abandon cart after 30 min inactivity

### Phase 3: Table Management (MVP Sprint 3)

**FR-3.1: Table Management (Quản Lý)**
- Create/edit/delete tables: name (e.g., "Bàn 1"), capacity, zone (optional)
- Bulk import from CSV

**FR-3.2: Table-Based Ordering (Nhân Viên)**
- Grid view: table cards showing name, current status (trống/occupied/requesting)
- Tap table → order for that table (separate order from main POS flow)
- Table order persists until marked "done"
- Move items between tables

**FR-3.3: Realtime Table Status Sync**
- Pusher or Soketi for realtime updates across staff devices
- Status changes broadcast: trống → occupied → completed → settled
- Multi-staff view: see which staff is working which table

**FR-3.4: Table Settlement**
- View all orders for table (multi-order aggregation)
- Combined bill option or separate per order
- Payment from table view
- Mark table as done → status resets to trống

---

## Non-Functional Requirements

### Performance
- **Page load:** <2s on 4G
- **Tap-to-add-cart:** <100ms visual feedback
- **Menu grid render:** <500ms (50+ items)
- **Payment processing:** <3s (SePay callback)
- **Realtime table sync:** <500ms broadcast

### Availability & Reliability
- **Offline support:** Cart & POS data persist locally; sync on reconnect
- **Graceful degradation:** Thermal printer unavailable → PDF fallback
- **Session resilience:** Survive tab reload, browser restart

### Security
- **Passwords:** bcrypt hash, min 8 chars, enforce complexity for Quản Lý
- **PINs:** 6-digit numeric, rate-limit attempts (5 wrong → 5 min lockout)
- **Device fingerprint:** User agent + device ID (no persistent tracking beyond 7 days)
- **SePay webhook:** HMAC signature validation
- **HTTPS only:** enforce in production

### Accessibility (WCAG AA)
- **Keyboard navigation:** Full POS flow navigable without mouse
- **Focus management:** Focus visible (green outline on primary color)
- **Color contrast:** 4.5:1 text, 3:1 UI components
- **Touch targets:** Numpad cells ≥44×44px
- **Screen reader:** ARIA labels on buttons, modals, form fields
- **Internationalization:** i18n ready (vi, en)

### Scalability
- Single business instance per deploy (no multi-tenancy in MVP)
- Support up to 50 concurrent staff sessions
- Menu caching (Redis) for <10ms item lookups

### Localization
- **Default:** Vietnamese (vi)
- **Supported:** English (en) via next-intl
- **VND formatting:** Intl.NumberFormat with VND locale
- **Thermal print:** UTF-8 support for Vietnamese diacritics

---

## Out of Scope (Future Phases)

- Analytics dashboards (revenue, top items, staff performance)
- Deep inventory management (stock alerts, purchase orders, suppliers)
- Multi-branch management
- Kitchen display system (KDS)
- Customer loyalty / membership programs
- Advanced promotions (combo deals, time-based)
- Accounting / VAT integration
- Mobile POS app (web-first only)

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to complete sale | <2 min (cash) / <5 min (QR) | Stopwatch from first item to receipt print |
| Error rate | <1% (wrong item, payment mismatch) | Bug reports / transaction logs |
| Staff adoption | >90% within 1 week | Login frequency, avoided support calls |
| Uptime | 99.5% during business hours | Sentry + custom metrics |
| Receipt print reliability | 99% | Print job success rate |
| Offline capability | Cart survives 30 min downtime | Browser dev tools, localStorage check |

---

## Unresolved Questions

None at this stage. Design & scope confirmed via Figma wireframe.
