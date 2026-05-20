# ViePOS — Codebase Summary

## Current State

**Status:** Greenfield (initialization phase)  
**Existing code:** None (only `.gitkeep`)  
**Package manager:** pnpm  
**Main framework:** Next.js 15 (App Router) + React 19 + TypeScript (strict)

---

## Planned Folder Structure

```
ViePOS/
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Auth group (login, setup)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── setup-pin/
│   │   │   └── page.tsx
│   │   ├── forgot-pin/
│   │   │   └── page.tsx
│   │   └── layout.tsx             # Auth layout (split hero panel)
│   │
│   ├── (pos)/                     # POS group (sales, protected)
│   │   ├── page.tsx               # Main POS dashboard
│   │   ├── menu/
│   │   │   └── [itemId]/
│   │   │       └── page.tsx
│   │   └── layout.tsx             # POS layout (sidebar + main)
│   │
│   ├── (admin)/                   # Manager group (settings, protected)
│   │   ├── page.tsx               # Manager dashboard
│   │   ├── menu/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── staff/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── tables/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── layout.tsx
│   │
│   ├── api/
│   │   ├── trpc/
│   │   │   └── [trpc]/route.ts    # tRPC handler
│   │   └── webhooks/
│   │       ├── sepay/
│   │       │   └── route.ts       # SePay payment callback
│   │       └── auth/
│   │           └── route.ts       # Better Auth webhook (if needed)
│   │
│   ├── layout.tsx                 # Root layout (providers)
│   └── page.tsx                   # Root redirect (/ → /login or /pos)
│
├── components/                    # Reusable React components
│   ├── ui/                        # shadcn/ui + custom wrappers
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   ├── status-badge.tsx
│   │   ├── pin-input.tsx          # 6-cell PIN/OTP input
│   │   ├── numpad.tsx             # 3×3 cash denominations
│   │   └── ...
│   │
│   ├── auth/
│   │   ├── login-form.tsx
│   │   ├── pin-setup-form.tsx
│   │   └── forgot-pin-form.tsx
│   │
│   ├── pos/
│   │   ├── menu-grid.tsx
│   │   ├── menu-item-card.tsx
│   │   ├── cart-panel.tsx
│   │   ├── cart-item-row.tsx
│   │   ├── payment-method-selector.tsx
│   │   ├── cash-payment-panel.tsx
│   │   ├── qr-payment-panel.tsx
│   │   ├── receipt-preview.tsx
│   │   └── promotion-picker.tsx
│   │
│   ├── tables/
│   │   ├── table-grid.tsx
│   │   ├── table-card.tsx
│   │   └── table-order-modal.tsx
│   │
│   └── layout/
│       ├── sidebar.tsx
│       ├── header.tsx
│       └── footer.tsx
│
├── lib/                           # Utilities & helpers
│   ├── api/
│   │   └── trpc.ts                # tRPC client/server setup
│   │
│   ├── auth/
│   │   ├── better-auth-config.ts  # Better Auth initialization
│   │   ├── session-utils.ts       # Session helpers
│   │   └── device-fingerprint.ts  # Device ID generation
│   │
│   ├── utils/
│   │   ├── format-vnd.ts          # VND currency formatting
│   │   ├── calculate-change.ts    # Cash payment math
│   │   ├── validators.ts          # Zod schemas
│   │   └── error-handler.ts       # Consistent error responses
│   │
│   ├── hooks/
│   │   ├── use-cart.ts            # Zustand cart hook
│   │   ├── use-session.ts         # Session hook (auth state)
│   │   ├── use-realtime.ts        # Pusher/Soketi subscription
│   │   └── use-local-storage.ts   # Persist state
│   │
│   └── constants/
│       ├── payment-denominations.ts
│       ├── routes.ts
│       └── config.ts
│
├── server/                        # Server-only code
│   ├── trpc/
│   │   ├── router.ts              # Root tRPC router
│   │   ├── procedures/
│   │   │   ├── auth.ts            # Auth procedures (login, PIN verify, etc.)
│   │   │   ├── menu.ts            # Menu CRUD
│   │   │   ├── cart.ts            # Cart validation
│   │   │   ├── orders.ts          # Order creation & status
│   │   │   ├── payments.ts        # Payment intent, SePay integration
│   │   │   ├── tables.ts          # Table CRUD & status
│   │   │   ├── staff.ts           # Staff management (Quản Lý only)
│   │   │   └── receipts.ts        # Receipt generation & printing
│   │   └── context.ts             # tRPC context (session, user)
│   │
│   ├── services/
│   │   ├── auth-service.ts        # Auth business logic
│   │   ├── menu-service.ts        # Menu lookups & caching
│   │   ├── order-service.ts       # Order orchestration
│   │   ├── payment-service.ts     # SePay API client
│   │   ├── printer-service.ts     # ESC/POS receipt formatting
│   │   ├── realtime-service.ts    # Pusher event broadcasting
│   │   └── redis-service.ts       # Cache layer
│   │
│   ├── db/
│   │   ├── client.ts              # Prisma client
│   │   └── seeding/
│   │       ├── seed.ts            # Seed script
│   │       └── mock-data.ts       # Test fixtures
│   │
│   └── queue/
│       ├── print-queue.ts         # BullMQ print jobs
│       └── webhook-queue.ts       # Retry SePay webhooks
│
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/
│       └── (auto-generated)
│
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   ├── logo-white.svg
│   │   ├── brand-gradient.svg
│   │   └── no-image-placeholder.svg
│   │
│   └── fonts/
│       ├── inter/
│       ├── sf-pro/
│       ├── lexend/
│       └── poppins/
│
├── styles/
│   ├── globals.css
│   ├── tailwind.config.ts         # Tailwind tokens + Figma colors
│   └── variables.css              # CSS custom properties
│
├── e2e/                           # Playwright tests
│   ├── auth.spec.ts               # Login flows
│   ├── pos-sales.spec.ts          # Add-to-cart, payment
│   ├── table-management.spec.ts   # Table ordering
│   └── fixtures/
│       └── auth-helper.ts
│
├── __tests__/                     # Vitest unit tests
│   ├── lib/
│   │   ├── format-vnd.test.ts
│   │   ├── calculate-change.test.ts
│   │   └── validators.test.ts
│   ├── server/
│   │   ├── auth-service.test.ts
│   │   └── order-service.test.ts
│   └── components/
│       ├── pin-input.test.tsx
│       └── numpad.test.tsx
│
├── docs/
│   ├── project-overview-pdr.md
│   ├── codebase-summary.md
│   ├── code-standards.md
│   ├── system-architecture.md
│   ├── design-guidelines.md
│   ├── project-roadmap.md
│   └── deployment-guide.md
│
├── plans/                         # Project planning & reports
│   └── reports/
│
├── .env.example
├── .eslintrc.json
├── .prettierrc.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── pnpm-workspace.yaml (if monorepo)
├── package.json
├── README.md
└── .gitignore
```

---

## Key Entry Points

| File | Purpose | Startup sequence |
|------|---------|------------------|
| `app/page.tsx` | Root route—redirects to `/login` or `/pos` based on session | 1st load |
| `app/api/trpc/[trpc]/route.ts` | tRPC handler (all RPC calls) | All client RPC |
| `app/(auth)/login/page.tsx` | Manager & staff login | Unauthenticated users |
| `app/(pos)/page.tsx` | Main POS dashboard (Nhân Viên, Phase 2) | After login (Nhân Viên) |
| `app/(admin)/page.tsx` | Manager dashboard (menu, staff, tables setup) | After login (Quản Lý) |
| `server/trpc/router.ts` | Root tRPC router—aggregates all procedures | All API calls |
| `lib/hooks/use-cart.ts` | Zustand cart store (global state) | POS load |
| `prisma/schema.prisma` | Database schema—single source of truth | Build time |
| `server/services/payment-service.ts` | SePay VietQR integration | Payment flow |
| `app/api/webhooks/sepay/route.ts` | SePay callback handler | External payment callback |

---

## Module Boundaries

### Auth Module (`lib/auth/`, `server/services/auth-service.ts`)
- Better Auth config
- PIN hashing & verification
- Device fingerprint
- Session validation
- OTP generation & verification

### Menu & Cart Module (`components/pos/`, `lib/hooks/use-cart.ts`, `server/procedures/menu.ts`, `server/procedures/cart.ts`)
- Menu items CRUD (Quản Lý)
- Menu caching (Redis)
- Cart state (Zustand + localStorage)
- Special requests handling
- Promotion selection

### Payment Module (`server/services/payment-service.ts`, `server/procedures/payments.ts`, `app/api/webhooks/sepay/route.ts`)
- Payment intent creation
- SePay API client
- Webhook signature validation
- Payment status tracking
- Cash/QR flow orchestration

### Printing Module (`server/services/printer-service.ts`, `server/queue/print-queue.ts`)
- ESC/POS receipt formatting
- WebUSB driver (or cloud print fallback)
- BullMQ print job queue
- Receipt history & reprint

### Realtime Module (`server/services/realtime-service.ts`, `lib/hooks/use-realtime.ts`)
- Pusher/Soketi channels (org:<id>:tables, org:<id>:orders)
- Table status broadcast
- Multi-device sync
- Connection resilience

### Prisma Schema (Database)
Key models to define:
- **User** (email, passwordHash, role, lastLogin)
- **Role** (enum: MANAGER, STAFF)
- **MenuItem** (name, price, imageUrl, category, stock)
- **Order** (userId, status, total, paymentMethod, createdAt)
- **OrderItem** (orderId, menuItemId, quantity, specialRequests)
- **Table** (name, capacity, status, lastOrderId)
- **Payment** (orderId, method, amount, status, sepayTxnId, webhookTimestamp)
- **Promotion** (code, type, value, expiresAt)
- **Session** (userId, token, deviceFingerprint, expiresAt)
- **Device** (userId, fingerprint, rememberFor7Days, createdAt)

---

## Tech Stack Recap

| Layer | Tech | Purpose |
|-------|------|---------|
| Frontend | Next.js 15 + React 19 + TS | UI & routing |
| Styling | Tailwind CSS + shadcn/ui | Design system |
| State | Zustand + TanStack Query | Client state & server cache |
| Backend | Route Handlers + tRPC | Type-safe RPC |
| Database | Prisma + PostgreSQL | ACID persistence |
| Cache | Redis + BullMQ | Menu cache & print queue |
| Auth | Better Auth | Multi-factor sessions |
| Realtime | Pusher or Soketi | Table sync |
| Payments | SePay API | Vietnamese banking |
| Printing | ESC/POS + WebUSB | Thermal receipts |
| i18n | next-intl | Vietnamese + English |
| Testing | Vitest + Playwright | Unit + E2E |
| CI/CD | GitHub Actions | Automated tests & deploy |

---

## Unresolved Questions

None at this stage. Architecture aligns with Figma wireframe and tech stack confirmed.
