# 🔧 Tanker Welding App — Project Structure

A **full-stack monorepo** with a **Next.js** frontend and a **NestJS** backend, using **Prisma ORM** and **PostgreSQL**.

---

## 📁 Root Structure

```
tanker-welding-app/
├── 📄 package.json               # Frontend (Next.js) package config
├── 📄 next.config.ts             # Next.js configuration
├── 📄 tsconfig.json              # TypeScript config (frontend)
├── 📄 eslint.config.mjs          # ESLint config
├── 📄 AGENTS.md                  # Agent rules
├── 📄 CLAUDE.md                  # Claude agent notes
├── 📄 SKILL.md                   # Skill documentation
├── 📄 README.md                  # Project readme
├── 📁 src/                       # Frontend source code (Next.js App Router)
├── 📁 public/                    # Static assets
├── 📁 backend/                   # NestJS backend (separate Node.js project)
└── 📁 .next/                     # Next.js build output
```

---

## 🖥️ Frontend — `src/` (Next.js App Router)

```
src/
├── app/
│   ├── 📄 layout.tsx                   # Root layout (app shell)
│   ├── 📄 page.tsx                     # Main dashboard/home page (21 KB)
│   ├── 📄 page.module.css              # Dashboard styles (34 KB)
│   ├── 📄 globals.css                  # Global CSS styles
│   ├── 📄 LanguageContext.tsx          # i18n / multi-language context (22 KB)
│   ├── 📄 Providers.tsx                # React context providers wrapper
│   ├── 📄 favicon.ico
│   │
│   ├── billing/                        # Billing page route (/billing)
│   │   ├── 📄 page.tsx                 # Billing UI (127 KB — large, feature-rich)
│   │   └── 📄 billing.module.css       # Billing-specific styles (28 KB)
│   │
│   └── components/                     # Shared UI components
│       ├── 📄 Navbar.tsx               # Navigation bar component
│       ├── 📄 Navbar.module.css        # Navbar styles
│       └── 📄 SparkBackground.tsx      # Animated spark background effect (10 KB)
│
├── lib/
│   └── 📄 api.ts                       # API client/helper functions (3.2 KB)
│
└── types/
    └── 📄 api.ts                       # Shared TypeScript type definitions
```

---

## 🌐 Public Assets — `public/`

```
public/
├── 📄 signboard.jpg                    # Business signboard image
├── 📄 file.svg
├── 📄 globe.svg
├── 📄 next.svg
├── 📄 vercel.svg
├── 📄 window.svg
├── images/
│   ├── gallery/                        # Gallery images
│   └── tanks/                          # Tanker/welding images
```

---

## ⚙️ Backend — `backend/` (NestJS)

```
backend/
├── 📄 package.json                     # Backend package config
├── 📄 nest-cli.json                    # NestJS CLI config
├── 📄 tsconfig.json                    # TypeScript config (backend)
├── 📄 tsconfig.build.json              # Build-specific TS config
├── 📄 prisma.config.ts                 # Prisma configuration
├── 📄 .env                             # Environment variables (DB URL, JWT secret, etc.)
├── 📄 .env.example                     # Example env file
├── 📄 .prettierrc                      # Prettier config
├── 📄 eslint.config.mjs                # ESLint config
├── 📄 check.js                         # Utility/debug script
├── 📄 cleanup-dupes.js                 # Cleanup duplicate records script
├── 📄 test-get.js                      # HTTP test script
├── 📄 token.txt                        # Stored JWT token (testing)
├── 📁 backups/                         # Database backup files
├── 📁 dist/                            # Compiled JS output
│
├── prisma/
│   ├── 📄 schema.prisma                # Database schema (14.5 KB — all models)
│   ├── 📄 seed.ts                      # Database seeder (15 KB)
│   └── migrations/
│       ├── 20260604065537_init/        # Initial migration
│       └── 20260604100038_add_bill_language/  # Add bill language migration
│
├── test/
│   └── (e2e test files)
│
└── src/
    ├── 📄 main.ts                      # Bootstrap entry point (3.3 KB)
    ├── 📄 app.module.ts                # Root app module (2.8 KB)
    ├── 📄 app.controller.ts            # Root controller
    ├── 📄 app.controller.spec.ts       # Root controller tests
    ├── 📄 app.service.ts               # Root service
    │
    ├── prisma/                         # Prisma integration
    │   ├── 📄 prisma.module.ts         # Prisma module
    │   └── 📄 prisma.service.ts        # Prisma client service
    │
    ├── health/
    │   └── 📄 health.controller.ts     # Health check endpoint
    │
    ├── common/                         # Shared NestJS utilities
    │   ├── decorators/
    │   │   ├── 📄 current-user.decorator.ts   # @CurrentUser() decorator
    │   │   ├── 📄 public.decorator.ts          # @Public() route decorator
    │   │   └── 📄 roles.decorator.ts           # @Roles() decorator
    │   │
    │   ├── filters/
    │   │   ├── 📄 http-exception.filter.ts     # Global HTTP exception handler
    │   │   └── 📄 prisma-exception.filter.ts   # Prisma DB error handler
    │   │
    │   ├── guards/
    │   │   ├── 📄 jwt-auth.guard.ts            # JWT authentication guard
    │   │   └── 📄 roles.guard.ts               # Role-based access guard
    │   │
    │   └── interceptors/
    │       └── 📄 transform.interceptor.ts     # Response transform interceptor
    │
    └── modules/                        # Feature modules
        │
        ├── auth/                       # 🔐 Authentication
        │   ├── 📄 auth.module.ts
        │   ├── 📄 auth.controller.ts   # Login, register, refresh endpoints
        │   ├── 📄 auth.service.ts      # JWT sign/verify, bcrypt (10 KB)
        │   ├── dto/
        │   │   └── 📄 auth.dto.ts      # Login/Register DTOs
        │   └── strategies/
        │       └── 📄 jwt.strategy.ts  # Passport JWT strategy
        │
        ├── users/                      # 👤 User management
        │   ├── 📄 users.module.ts
        │   ├── 📄 users.controller.ts  # User CRUD endpoints
        │   ├── 📄 users.service.ts     # User business logic
        │   └── dto/
        │
        ├── customers/                  # 🧑‍💼 Customer management
        │   ├── 📄 customers.module.ts
        │   ├── 📄 customers.controller.ts
        │   ├── 📄 customers.service.ts
        │   ├── 📄 customers.controller.spec.ts
        │   ├── 📄 customers.service.spec.ts
        │   └── dto/
        │
        ├── products/                   # 📦 Products / Services catalog
        │   ├── 📄 products.module.ts
        │   ├── 📄 products.controller.ts  (3.9 KB)
        │   ├── 📄 products.service.ts     (5.4 KB)
        │   ├── 📄 products.controller.spec.ts
        │   ├── 📄 products.service.spec.ts
        │   └── dto/
        │
        ├── billing/                    # 🧾 Billing / Invoices
        │   ├── 📄 billing.module.ts
        │   ├── 📄 billing.controller.ts   (3.1 KB)
        │   ├── 📄 billing.service.ts      (13.9 KB — core business logic)
        │   ├── 📄 billing.controller.spec.ts
        │   ├── 📄 billing.service.spec.ts
        │   └── dto/
        │
        ├── payments/                   # 💰 Payment tracking
        │   ├── 📄 payments.module.ts
        │   ├── 📄 payments.controller.ts
        │   ├── 📄 payments.service.ts
        │   ├── 📄 payments.controller.spec.ts
        │   └── 📄 payments.service.spec.ts
        │
        ├── receipts/                   # 🧾 Receipt generation
        │   ├── 📄 receipts.module.ts
        │   ├── 📄 receipts.controller.ts
        │   ├── 📄 receipts.service.ts    (5.8 KB)
        │   ├── 📄 receipts.controller.spec.ts
        │   └── 📄 receipts.service.spec.ts
        │
        ├── enquiries/                  # 📋 Customer enquiries
        │   ├── 📄 enquiries.module.ts
        │   ├── 📄 enquiries.controller.ts
        │   ├── 📄 enquiries.service.ts
        │   ├── 📄 enquiries.controller.spec.ts
        │   └── 📄 enquiries.service.spec.ts
        │
        ├── analytics/                  # 📊 Analytics & reports
        │   ├── 📄 analytics.module.ts
        │   ├── 📄 analytics.controller.ts
        │   ├── 📄 analytics.service.ts   (3.3 KB)
        │   ├── 📄 analytics.controller.spec.ts
        │   └── 📄 analytics.service.spec.ts
        │
        ├── gallery/                    # 🖼️ Image gallery
        │   ├── 📄 gallery.module.ts
        │   ├── 📄 gallery.controller.ts
        │   ├── 📄 gallery.service.ts
        │   ├── 📄 gallery.controller.spec.ts
        │   └── 📄 gallery.service.spec.ts
        │
        ├── storage/                    # 📂 File storage service
        │   ├── 📄 storage.module.ts
        │   ├── 📄 storage.service.ts    (2 KB)
        │   └── 📄 storage.service.spec.ts
        │
        └── backup/                     # 💾 Database backup
            ├── 📄 backup.module.ts
            ├── 📄 backup.controller.ts
            └── 📄 backup.service.ts
```

---

## 🏗️ Architecture Overview

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 (App Router) | UI, pages, routing |
| **Styling** | CSS Modules + Global CSS | Scoped & global styles |
| **State/Context** | React Context API | Language / auth state |
| **Backend** | NestJS (Node.js) | REST API server |
| **ORM** | Prisma | Database queries & migrations |
| **Database** | PostgreSQL | Persistent data storage |
| **Auth** | JWT + Passport.js | Authentication & authorization |
| **File Storage** | Local storage service | Gallery / image uploads |

---

## 🔑 Key Features by Module

| Module | Responsibility |
|--------|---------------|
| `auth` | Login, register, JWT refresh, bcrypt password hashing |
| `users` | User CRUD, role management |
| `customers` | Customer records for the welding business |
| `products` | Welding services/products catalog |
| `billing` | Invoice/bill creation and management (core feature) |
| `payments` | Track payment status against bills |
| `receipts` | Generate and manage payment receipts |
| `enquiries` | Handle customer enquiries/quotes |
| `analytics` | Dashboard stats, revenue reports |
| `gallery` | Manage workshop/work photos |
| `storage` | Handle file uploads (images) |
| `backup` | Database backup/restore |

---

## 🗃️ Database Migrations

| Migration | Description |
|-----------|-------------|
| `20260604065537_init` | Initial schema (all tables) |
| `20260604100038_add_bill_language` | Added language field to bills |
