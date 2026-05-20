# ViePOS — System Architecture

## High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (Staff/Manager)                 │
│                    Next.js App Router (Client)                  │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTP/WebSocket
                     │ tRPC calls + Realtime events
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Next.js Server                             │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │  API Layer (Route Handlers + tRPC)                        │  │
│ │  ├─ app/api/trpc/[trpc]/route.ts (RPC handler)           │  │
│ │  ├─ app/api/webhooks/sepay/route.ts (Payment callbacks)  │  │
│ │  └─ app/api/webhooks/auth/route.ts (Better Auth)         │  │
│ └───────────────────────────────────────────────────────────┘  │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │  Business Logic Layer (tRPC Procedures + Services)        │  │
│ │  ├─ Auth: PIN verify, session management                 │  │
│ │  ├─ Menu: item CRUD, caching                             │  │
│ │  ├─ Orders: creation, status tracking                    │  │
│ │  ├─ Payments: SePay integration, webhooks                │  │
│ │  ├─ Tables: status sync via realtime                     │  │
│ │  └─ Printing: ESC/POS formatting, print queue            │  │
│ └───────────────────────────────────────────────────────────┘  │
└──┬──────────────────┬──────────────────┬──────────────────┬─────┘
   │                  │                  │                  │
   ▼                  ▼                  ▼                  ▼
┌─────────────┐  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│ PostgreSQL  │  │   Redis     │  │ Pusher/      │  │   SePay      │
│ (ACID)      │  │ (Cache +    │  │   Soketi     │  │   (VietQR    │
│             │  │  Queue)     │  │   (Realtime) │  │    Payment)  │
│ - Users     │  │             │  │              │  │              │
│ - Orders    │  │ - Menu      │  │ - Table      │  │ - VietQR     │
│ - Tables    │  │   cache     │  │   status     │  │   QR code    │
│ - Payments  │  │ - Print     │  │ - Order      │  │ - Webhook    │
│ - Sessions  │  │   jobs      │  │   updates    │  │   callback   │
└─────────────┘  └─────────────┘  └──────────────┘  └──────────────┘
```

---

## Component Architecture (Next.js App Router)

```
app/
├── (auth)/                          # Auth group (layout: split hero panel)
│   ├── login/page.tsx               # Manager/Staff role selection + login form
│   ├── setup-pin/page.tsx           # Staff first-time PIN setup
│   ├── forgot-pin/page.tsx          # PIN recovery
│   ├── forgot-password/page.tsx     # Manager password reset
│   └── layout.tsx                   # Auth layout (hero + form split)
│
├── (pos)/                           # POS group (layout: sidebar + main)
│   ├── page.tsx                     # Main POS (menu grid + cart)
│   ├── table/page.tsx               # Table management view
│   ├── layout.tsx                   # POS layout (sidebar + nav)
│   └── components/                  # POS-specific UI
│       ├── menu-grid.tsx
│       ├── cart-panel.tsx
│       └── payment-modal.tsx
│
├── (admin)/                         # Manager group (layout: sidebar + main)
│   ├── page.tsx                     # Manager dashboard (menu, staff, tables setup)
│   ├── menu/page.tsx                # Menu management (CRUD)
│   ├── staff/page.tsx               # Staff management (reset PIN, list)
│   ├── tables/page.tsx              # Table setup (CRUD)
│   ├── layout.tsx                   # Admin layout
│   └── components/                  # Admin-specific UI
│
├── api/
│   ├── trpc/
│   │   └── [trpc]/route.ts          # tRPC handler (all RPC calls)
│   │
│   └── webhooks/
│       ├── sepay/route.ts           # SePay payment callback
│       └── auth/route.ts            # Better Auth webhook (if needed)
│
├── layout.tsx                       # Root layout (providers)
├── not-found.tsx
└── error.tsx
```

---

## Data Flow: Order Creation & Payment

### Sequence: Cart → Order → Payment → Receipt → Realtime Broadcast

```
1. STAFF ADDS ITEMS TO CART
   Browser (React state: Zustand + localStorage)
   └─ Cart updates realtime in sidebar (optimistic UI)

2. STAFF TAPS "HOÀN TẤT THANH TOÁN" (Complete Payment)
   Browser sends tRPC call: trpc.orders.create({ items, total })
   └─ Request includes menuItemId, quantity, specialRequests per item

3. SERVER: ORDER CREATION (tRPC procedure: orders.create)
   ├─ Validate cart items exist in DB
   ├─ Calculate total (sum prices)
   ├─ Apply promotion discount (if any)
   ├─ Create Order record (status: PENDING)
   ├─ Create OrderItem records (one per menu item)
   ├─ Return orderId + paymentMethod options to client
   └─ Response sent back to Browser

4. SERVER: PAYMENT INTENT (tRPC procedure: payments.createIntent)
   ├─ For TIEN_MAT (Cash): calculate change, return denominations layout
   ├─ For CHUYEN_KHOAN (Bank):
   │  ├─ Call SePay API → generate VietQR QR code
   │  ├─ Store payment intent (orderId, sepayTxnId, amount, expiresAt)
   │  ├─ Return QR image URL to client
   │  └─ Timeout: 5 minutes (can re-issue new QR)
   └─ Response sent back to Browser

5. BROWSER: PAYMENT UI
   ├─ Display cash numpad OR QR code
   ├─ For cash: staff enters denominations (3×3 grid)
   │  └─ Call trpc.payments.processCash({ orderId, amountGiven })
   ├─ For QR: wait for webhook callback (external)
   └─ Optimistic close confirmation modal on client

6. SERVER: PAYMENT PROCESSING
   ├─ For TIEN_MAT: mark Order.paymentStatus = "COMPLETED"
   ├─ For CHUYEN_KHOAN: wait for SePay webhook
   └─ Trigger print job (add to BullMQ queue)

7. EXTERNAL: SEPAY WEBHOOK (asynchronous)
   SePay → POST /api/webhooks/sepay { orderId, status, txnId, timestamp }
   ├─ Server validates HMAC signature
   ├─ Updates Payment.status = "CONFIRMED"
   ├─ Updates Order.status = "COMPLETED"
   ├─ Enqueues print job in BullMQ
   └─ Responds 200 to SePay (fire-and-forget)

8. PRINT QUEUE (BullMQ Worker)
   ├─ Fetch order details from DB
   ├─ Format ESC/POS receipt (80mm thermal)
   ├─ Send to printer (WebUSB or cloud print)
   ├─ Retry on failure (exponential backoff)
   └─ Log print status to Payment record

9. REALTIME BROADCAST (Pusher/Soketi)
   ├─ On Order creation: broadcast to org:<orgId>:orders channel
   ├─ Staff in table view receive order status update
   ├─ Table status updates: org:<orgId>:tables channel
   └─ Multi-device sync (all staff see same order state)

10. BROWSER: ORDER COMPLETE
    ├─ Show "Thanh toán hoàn tất" modal (payment success)
    ├─ Display order ID, total, payment method, thank-you
    ├─ Clear cart (Zustand + localStorage)
    ├─ Return to main POS view (wait 3s then auto-clear)
    └─ Staff ready for next order
```

---

## Authentication Flow: PIN Login

### Sequence: Email Lookup → PIN Verification → Session → Device Fingerprint

```
1. STAFF ENTERS EMAIL
   Browser → tRPC call: trpc.auth.lookupEmail({ email })
   ├─ Server checks if user exists
   ├─ If not found: return error 404
   └─ If found: return user name + proceed to PIN entry

2. STAFF ENTERS PIN (6 cells, auto-focus advance)
   Browser → tRPC call: trpc.auth.verifyPin({ email, pin })
   └─ Request includes device fingerprint (user agent + device ID)

3. SERVER: PIN VERIFICATION (tRPC procedure: auth.verifyPin)
   ├─ Look up user by email
   ├─ Check PIN lockout (rate limit: 5 wrong → 5 min lockout)
   ├─ Compare PIN hash (bcrypt) against stored hash
   ├─ On wrong PIN:
   │  ├─ Increment attemptCount
   │  ├─ Return error + remaining attempts
   │  └─ Lock out if attemptCount >= 5
   ├─ On correct PIN:
   │  ├─ Reset attemptCount to 0
   │  ├─ Call Better Auth to create session
   │  ├─ Extract device fingerprint from request
   │  ├─ Check "Đăng nhập nhanh" checkbox state
   │  ├─ If checked:
   │  │  ├─ Create Device record (fingerprint, rememberFor7Days)
   │  │  └─ Store in session cookie (7 days expiry)
   │  ├─ If unchecked:
   │  │  └─ Session expires in 4 hours (Nhân Viên default)
   │  ├─ Return session token + user role
   │  └─ Redirect to /pos
   └─ Response sent back to Browser

4. QUICK LOGIN (Đăng nhập nhanh) — RETURN VISIT
   ├─ Browser detects matching device fingerprint in cookie
   ├─ Call tRPC: trpc.auth.quickLogin({ deviceFingerprint })
   ├─ Server validates Device record (not expired, fingerprint matches)
   ├─ If valid:
   │  ├─ Create new session (extend 7 days)
   │  └─ Return session token + user info
   ├─ If expired or invalid:
   │  └─ Redirect to PIN entry
   └─ Browser auto-logs in, no PIN needed

5. SESSION MANAGEMENT
   ├─ Better Auth stores session in secure HTTP-only cookie
   ├─ Session validates on each tRPC request
   ├─ Session timeout:
   │  ├─ Nhân Viên: 4 hours (auto-logout on inactivity)
   │  └─ Quản Lý: 8 hours
   └─ On timeout: redirect to /login
```

---

## Prisma Schema (Core Models)

```prisma
// User & Auth
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  passwordHash      String?   // NULL for STAFF (PIN-based only)
  pinHash           String?   // Only STAFF
  role              Role      @default(STAFF)
  pinAttempts       Int       @default(0)
  pinLockedUntil    DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  orders            Order[]
  sessions          Session[]
  devices           Device[]

  @@index([email])
}

enum Role {
  MANAGER
  STAFF
}

model Session {
  id                String    @id @default(cuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  token             String    @unique
  expiresAt         DateTime
  createdAt         DateTime  @default(now())

  @@index([userId])
  @@index([token])
}

model Device {
  id                String    @id @default(cuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  fingerprint       String    // user agent + device ID hash
  rememberUntil     DateTime  // 7 days from creation
  createdAt         DateTime  @default(now())

  @@unique([userId, fingerprint])
  @@index([userId])
}

// Menu & Items
model MenuItem {
  id                String    @id @default(cuid())
  name              String
  price             Int       // VND in cents (25000 = 250.00 ₫)
  imageUrl          String?
  category          String
  stock             Int       @default(-1)  // -1 = unlimited
  isActive          Boolean   @default(true)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  orderItems        OrderItem[]

  @@index([category])
  @@index([isActive])
}

// Orders & Items
model Order {
  id                String    @id @default(cuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id])
  tableId           String?   // NULL for regular POS, set for table orders
  table             Table?    @relation(fields: [tableId], references: [id])
  status            OrderStatus @default(PENDING)
  subtotal          Int       // VND in cents
  discount          Int       @default(0)  // VND in cents
  total             Int       // VND in cents (subtotal - discount)
  paymentMethod     PaymentMethod?
  paymentStatus     PaymentStatus @default(PENDING)
  createdAt         DateTime  @default(now())
  completedAt       DateTime?

  items             OrderItem[]
  payment           Payment?

  @@index([userId])
  @@index([tableId])
  @@index([status])
  @@index([createdAt])
}

enum OrderStatus {
  PENDING
  COMPLETED
  SETTLED
}

enum PaymentStatus {
  PENDING
  CONFIRMED
  FAILED
  CANCELLED
}

model OrderItem {
  id                String    @id @default(cuid())
  orderId           String
  order             Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  menuItemId        String
  menuItem          MenuItem  @relation(fields: [menuItemId], references: [id])
  quantity          Int
  priceAtTime       Int       // Item price at time of order (VND in cents)
  specialRequests   String?   // "no ice", "extra hot", etc.

  @@index([orderId])
  @@index([menuItemId])
}

// Tables
model Table {
  id                String    @id @default(cuid())
  name              String    // "Bàn 1", "Bàn 2", etc.
  capacity          Int       // seats
  zone              String?   // optional grouping
  status            TableStatus @default(EMPTY)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  orders            Order[]

  @@unique([name])
  @@index([status])
}

enum TableStatus {
  EMPTY
  OCCUPIED
  REQUESTING
}

// Payments
model Payment {
  id                String    @id @default(cuid())
  orderId           String    @unique
  order             Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  method            PaymentMethod
  amount            Int       // VND in cents
  status            PaymentStatus @default(PENDING)
  
  // TIEN_MAT specific
  amountGiven       Int?      // VND in cents
  change            Int?      // VND in cents

  // CHUYEN_KHOAN specific
  sepayTxnId        String?   // SePay transaction ID
  sepayQrUrl        String?   // QR code image URL
  sepayExpiresAt    DateTime? // QR expires at
  sepayWebhookAt    DateTime? // When webhook was received

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([orderId])
  @@index([sepayTxnId])
  @@index([status])
}

enum PaymentMethod {
  TIEN_MAT          // Cash
  CHUYEN_KHOAN      // Bank transfer (VietQR)
}

// Promotions (future)
model Promotion {
  id                String    @id @default(cuid())
  code              String?   @unique // optional promo code
  type              String    // "PERCENT" or "FIXED"
  value             Int       // % or VND in cents
  description       String?
  expiresAt         DateTime
  isActive          Boolean   @default(true)
  createdAt         DateTime  @default(now())
}
```

---

## Realtime Channels (Pusher/Soketi)

### Channel naming
- `org:{orgId}:tables` — Table status updates (EMPTY → OCCUPIED → COMPLETED)
- `org:{orgId}:orders` — Order status updates (broadcast to all staff)
- `private-user:{userId}:notifications` — User-specific alerts (print failure, PIN reset, etc.)

### Events
```typescript
// Table status change
{
  type: 'table:status_changed',
  tableId: 'cuid',
  status: 'OCCUPIED',
  lastOrderId: 'cuid',
  timestamp: Date.now()
}

// Order completed
{
  type: 'order:completed',
  orderId: 'cuid',
  tableId: 'cuid' | null,
  total: 250000,
  timestamp: Date.now()
}

// Print notification
{
  type: 'print:status',
  orderId: 'cuid',
  status: 'SUCCESS' | 'FAILED',
  message: 'Receipt printed' | error details,
  timestamp: Date.now()
}
```

---

## External Integrations

### SePay VietQR
**Flow:**
1. Client requests QR: `trpc.payments.createQrIntent({ orderId, amount })`
2. Server calls SePay API → returns QR image URL + txnId
3. Client displays QR image (80×80mm recommended)
4. Customer scans with phone banking app
5. Bank transfers VND to merchant account
6. SePay sends webhook: `POST /api/webhooks/sepay`
7. Server validates HMAC signature
8. Server updates Payment.status = "CONFIRMED" → triggers print

**Endpoint:** `https://api.sepay.vn/v4/qr` (or sandbox)
**Auth:** API key in header `Authorization: Bearer {SEPAY_API_KEY}`
**Webhook signature:** HMAC-SHA256 in `X-Signature` header

### Thermal Printer (ESC/POS)
**Options:**
- **WebUSB:** Direct connection to thermal printer (preferred for counter)
- **Cloud print:** Send print jobs to cloud service (fallback)

**Receipt format (80mm):**
```
┌────────────────────────┐
│      ViePOS Store      │  (centered, bold)
│    Store Address       │  (centered, small)
├────────────────────────┤
│ Hoá Đơn #12345         │  (order ID)
│ 2026-05-20 14:35       │  (timestamp)
├────────────────────────┤
│ Cà Phê Đen      1 × 25 │  (item, qty × price)
│ Bánh Mì          1 × 40 │
├────────────────────────┤
│ Tổng             65.000 ₫
│ Chiết khấu      (0 ₫)
│ THANH TOÁN      65.000 ₫  (bold, large)
├────────────────────────┤
│ Hình thức: Tiền mặt    │  (payment method)
│ Dùng lại!              │  (thank-you)
└────────────────────────┘
```

### Figma Reference
- Login screens: `POS - TRANG CHÍNH` (id 1:97) — layout reference
- Payment screens: `POS - THANH TOÁN` (id 1:274, 1:384)
- Table view: `POS - BÀN` (id 1:509)
- Design system: Node 26:855 (colors, typography, components)

---

## Unresolved Questions

1. **Multi-branch support:** Should session model include `orgId` (organization)? Deferred to Phase 4 if needed.
2. **Print service backend:** Will thermal printer be WebUSB-only or cloud-based proxy? Confirm during Phase 2.
3. **SePay sandbox:** Is sandbox environment available for testing before production? Confirm with SePay.
