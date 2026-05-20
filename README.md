# ViePOS

**A lean, fast point-of-sale system for Vietnamese food & beverage businesses.**

> *Vừa - Đủ - Tinh Gọn* (Just right - Complete - Lean)  
> *Từ bán hàng đến vận hành trong một hệ thống* (From sales to operations in one system)

---

## Overview

ViePOS is a desktop web POS (Point-of-Sale) application designed for cashier counters in Vietnamese cafés and restaurants. It streamlines order-taking, payment processing, table management, and receipt printing with a focus on speed and simplicity.

**Key features:**
- Multi-role login (Manager + Staff with PIN)
- Menu management & ordering
- Dual payment methods: Cash + Vietnamese VietQR banking
- Table-based ordering with realtime sync
- Thermal receipt printing (80mm ESC/POS)
- Offline cart persistence
- Device quick-login ("Đăng nhập nhanh")

**Status:** MVP Phase 1 (authentication) in development. Phases 2-3 planned.

---

## Tech Stack

| Component | Tech |
|-----------|------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Route Handlers, tRPC, Next.js |
| Database | PostgreSQL, Prisma ORM |
| Cache | Redis |
| Auth | Better Auth (email/password + PIN + OTP) |
| Realtime | Pusher or Soketi |
| Payments | SePay VietQR API |
| Queue | BullMQ (print jobs) |
| i18n | next-intl (Vietnamese + English) |
| Testing | Vitest, Playwright |
| CI/CD | GitHub Actions |

---

## Quick Start

### Prerequisites
- Node.js 18+ (recommend 20 LTS)
- pnpm 8+
- Docker Desktop (or local PostgreSQL + Redis)

### Setup (5 minutes)

```bash
# 1. Clone & install
git clone https://github.com/plateau/viepos.git
cd viepos
pnpm install

# 2. Start local services (Docker)
docker-compose -f docker-compose.dev.yml up -d

# 3. Create .env.local (see .env.example)
cp .env.example .env.local
# Edit .env.local with local values (localhost for DB/Redis)

# 4. Initialize database
pnpm exec prisma migrate dev --name init

# 5. Start dev server
pnpm dev
```

**Open:** `http://localhost:3000`

**Test login:** 
- Email: `manager@test.com` / Password: `password123` (Quản Lý)
- Email: `staff@test.com` / PIN: `123456` (Nhân Viên)

### Common Commands

```bash
pnpm dev              # Start dev server (localhost:3000)
pnpm build            # Build for production
pnpm start            # Run production build
pnpm test             # Run unit tests (Vitest)
pnpm test:e2e         # Run end-to-end tests (Playwright)
pnpm lint             # Check code style (ESLint)
pnpm type-check       # TypeScript type check
pnpm db:push          # Push Prisma schema to DB
pnpm db:studio        # Open Prisma Studio (visual DB editor)
```

---

## Project Structure

```
ViePOS/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Login & auth flows
│   ├── (pos)/             # POS interface (Phase 2)
│   ├── (admin)/           # Manager dashboard (Phase 1+)
│   ├── api/               # tRPC & webhooks
│   └── layout.tsx         # Root layout
│
├── components/            # React components
│   ├── ui/               # shadcn/ui wrappers
│   ├── auth/             # Auth forms
│   ├── pos/              # POS UI (menu, cart, payment)
│   └── layout/           # Shared layout components
│
├── lib/                   # Utilities & hooks
│   ├── api/              # tRPC setup
│   ├── auth/             # Auth helpers
│   ├── hooks/            # React hooks (use-cart, use-session)
│   ├── utils/            # VND formatting, validators
│   └── constants/        # App constants
│
├── server/               # Server-only code
│   ├── trpc/             # tRPC procedures & router
│   ├── services/         # Business logic
│   ├── db/               # Database client & seeding
│   └── queue/            # BullMQ print queue
│
├── prisma/               # Database schema
│   ├── schema.prisma
│   └── migrations/
│
├── docs/                 # Documentation (start here!)
│   ├── project-overview-pdr.md     # Requirements & vision
│   ├── codebase-summary.md         # Folder structure & modules
│   ├── code-standards.md           # Code style guide
│   ├── system-architecture.md      # System design & data flow
│   ├── design-guidelines.md        # Design system & components
│   ├── project-roadmap.md          # Phases & timeline
│   └── deployment-guide.md         # Production deployment
│
├── e2e/                  # Playwright E2E tests
├── __tests__/            # Vitest unit tests
├── public/               # Static assets (logo, fonts)
├── styles/               # Global CSS
│
├── .env.example          # Environment template (commit this)
├── .eslintrc.json        # ESLint config
├── .prettierrc.json      # Prettier config
├── next.config.ts        # Next.js config
├── tsconfig.json         # TypeScript config
├── tailwind.config.ts    # Tailwind config
├── pnpm-workspace.yaml   # pnpm monorepo (if applicable)
├── package.json
├── pnpm-lock.yaml        # (commit this)
└── README.md
```

**Start reading docs:** `docs/project-overview-pdr.md` — overview of features and roadmap.

---

## Documentation

All documentation is in the `docs/` directory:

| Document | Purpose |
|----------|---------|
| **project-overview-pdr.md** | Product requirements, user personas, functional specs |
| **codebase-summary.md** | Folder structure, module boundaries, tech stack |
| **code-standards.md** | Code style, naming, TypeScript strict mode, testing |
| **system-architecture.md** | High-level design, data flows, Prisma schema sketch |
| **design-guidelines.md** | Color tokens, typography, component library, accessibility |
| **project-roadmap.md** | Phases 1-3 timeline, milestones, success metrics |
| **deployment-guide.md** | Local setup, production deployment (Vercel or self-hosted) |

**👉 New to the project?** Start with `docs/project-overview-pdr.md`.

---

## Development Workflow

### Branch Strategy
- `main` — production-ready code
- `dev` — integration branch (if used)
- `feat/*` — feature branches (e.g., `feat/pin-login`)
- `fix/*` — bugfix branches (e.g., `fix/cart-persistence`)

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`

**Example:**
```
feat(auth): implement PIN login with device fingerprint

Allow staff to use 6-digit PIN for fast login. Device fingerprint
enables 7-day "Đăng nhập nhanh" (quick login) without re-entering PIN.

Closes #42
```

### Code Quality Checks
```bash
# Before push, run:
pnpm lint              # Fix style issues
pnpm type-check        # Catch TypeScript errors
pnpm test              # Run unit tests
pnpm test:e2e          # Run E2E tests (optional, slower)
```

---

## Project Phases

### Phase 1: Authentication (Weeks 1-3)
- Manager & Staff login (11 screens)
- PIN-based authentication with rate limiting
- Device quick-login (7-day remembrance)
- Role-based access control

### Phase 2: POS Sales (Weeks 4-6)
- Menu management & browsing
- Shopping cart with persistence
- Payment processing: Cash + VietQR
- Receipt printing (thermal 80mm)

### Phase 3: Table Management (Weeks 7-8)
- Table grid & status tracking
- Table-based ordering
- Realtime multi-device sync
- Combined bills & settlement

See `docs/project-roadmap.md` for detailed timeline and success metrics.

---

## Environment Setup

### Local Development
See **Quick Start** above or `docs/deployment-guide.md` for detailed setup.

### Production Deployment
Two options:
1. **Cloud (Vercel + Neon + Upstash)** — recommended for low ops overhead
2. **Self-hosted (Docker on VPS + Caddy)** — recommended for cost control & data residency

See `docs/deployment-guide.md` for step-by-step instructions.

---

## Testing

### Unit Tests (Vitest)
```bash
pnpm test              # Run all tests
pnpm test --watch      # Watch mode
```

**Test files:** Colocated as `*.test.ts` / `*.test.tsx` in `__tests__/` or component directories.

### E2E Tests (Playwright)
```bash
pnpm test:e2e          # Run all E2E tests
pnpm test:e2e --ui     # Open test UI
```

**Test files:** Located in `e2e/` directory (e.g., `e2e/auth.spec.ts`).

---

## Contributing

### Getting Help
- **Docs:** Read `docs/` directory first
- **Questions:** File GitHub issue with `[QUESTION]` tag
- **Bug reports:** Use GitHub Issues with reproduction steps

### Reporting Bugs
1. Search existing issues first
2. Provide reproduction steps
3. Include environment info (Node version, OS, browser)
4. Attach screenshots if UI-related

### Submitting PRs
1. Create feature branch: `git checkout -b feat/your-feature`
2. Make changes, test locally: `pnpm test && pnpm lint`
3. Push & open PR against `main` (or `dev` if exists)
4. Reference related issue: "Closes #123"
5. Await review & CI checks

---

## Architecture Highlights

**Why tRPC?** Type-safe end-to-end RPC without code generation. Full TypeScript support from client to server.

**Why Zustand?** Lightweight client state for cart. localStorage persistence for offline support.

**Why Better Auth?** Built-in email/password + PIN + OTP + session management. No custom auth code.

**Why Pusher/Soketi?** Realtime table status sync across staff devices. Pusher for managed simplicity, Soketi for cost control.

**Why Thermal (ESC/POS)?** Vietnamese POS standard. 80mm receipts fit on counter.

See `docs/system-architecture.md` for detailed flow diagrams and data models.

---

## Performance Targets

- **Page load:** <2s on 4G
- **Tap-to-add-cart:** <100ms visual feedback
- **Payment processing:** <3s (including SePay callback)
- **Realtime sync:** <500ms table status broadcast
- **Offline support:** Cart survives 30 min downtime

---

## Security

- **Passwords:** bcrypt hashing, min 8 chars
- **PINs:** 6-digit numeric, rate-limited (5 wrong → 5 min lockout)
- **Sessions:** HTTP-only secure cookies, CSRF tokens
- **HTTPS:** Enforced in production
- **SePay webhooks:** HMAC-SHA256 signature validation
- **Database:** No raw SQL queries (Prisma parameterized only)

See `docs/code-standards.md` for security guidelines.

---

## License

MIT (or TBD)

---

## Contact & Support

- **Issues:** [GitHub Issues](https://github.com/plateau/viepos/issues)
- **Discussions:** [GitHub Discussions](https://github.com/plateau/viepos/discussions)
- **Email:** (TBD)

---

## Roadmap

**Phase 1 (Current):** Authentication & login flows  
**Phase 2:** POS sales & payments  
**Phase 3:** Table management & realtime sync  
**Phase 4+:** Analytics, multi-branch, KDS, inventory

See `docs/project-roadmap.md` for detailed timeline.

---

## Acknowledgments

- **Figma design:** VIEPOS-WIREFRAME (fileKey: txxN6issmLkjIG35KXt2ZF)
- **SePay:** Vietnamese VietQR payment integration
- **Better Auth:** Multi-factor authentication framework
- **shadcn/ui:** Component library built on Radix primitives

---

**Made for Vietnamese food & beverage businesses. Fast. Simple. Lean.**
