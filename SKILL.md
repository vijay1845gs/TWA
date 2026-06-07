---
name: tankerpro-platform
description: TankerPro - Professional welding and billing management platform. Use this skill when developing features for project management, billing automation, portfolio galleries, customer relationship management, and service delivery tracking for welding professionals. Includes architecture guidelines, database schemas, API patterns, and UI/UX standards.
license: Proprietary - TankerPro
version: 1.0.0
tags: [saas, welding, billing, project-management, portfolio]
---

# TankerPro Platform Development Skill

## Overview

**TankerPro** is a comprehensive SaaS platform designed for professional welding contractors and facilities to manage projects, automate billing, showcase their work, and streamline operations.

**Keywords**: welding, billing, invoicing, project management, portfolio gallery, SaaS, CRUD operations, authentication, payment processing, CRM, analytics, multi-language support

## Product Purpose & Vision

### Business Value
- **Unified Operations**: Single platform replaces 3-4 separate tools
- **Accuracy**: Eliminate manual billing errors
- **Professional Image**: Beautiful portfolio galleries
- **Data Intelligence**: Real-time project and financial insights
- **Time Savings**: Automate invoicing, reduce administrative overhead

### Target Users
- Professional welding contractors (1-20 person teams)
- Tank manufacturing facilities
- Independent welding service providers
- Facility maintenance departments

### Success Metrics
- Monthly Active Users (MAU) growth
- Invoice accuracy rate > 99%
- Project completion time reduction
- Customer satisfaction (NPS > 50)
- Churn rate < 5% monthly

## Architecture Overview

### Technology Stack

```
Frontend:
  - Framework: Next.js 16.2.6 (App Router, Server Components)
  - Language: TypeScript 5.x (strict mode enforced)
  - UI Library: React 19.2.4 (functional components, hooks)
  - Styling: CSS Modules + Tailwind CSS
  - State: React Context API + Custom Hooks
  - Forms: React Hook Form + Zod validation
  - HTTP Client: Fetch API / Axios

Backend:
  - Runtime: Node.js (via Next.js)
  - API Style: RESTful + eventual GraphQL
  - Database: PostgreSQL (primary)
  - ORM: Prisma or TypeORM
  - Authentication: JWT + OAuth2
  - Caching: Redis (sessions, rate limiting)
  - Storage: AWS S3 / Cloudinary (images)

Infrastructure:
  - Hosting: Vercel (frontend) + AWS/DigitalOcean (backend)
  - CDN: Cloudflare
  - Monitoring: Sentry (errors), DataDog (performance)
  - Analytics: PostHog or Mixpanel
  - Email: SendGrid / Mailgun
  - Payments: Stripe / PayPal
```

### Core Features

#### 1. User Management & Authentication
```typescript
// User roles and permissions
type UserRole = 'admin' | 'manager' | 'technician' | 'client';

interface User {
  id: string;
  email: string;
  password: string; // bcrypt hashed
  displayName: string;
  role: UserRole;
  organization: string;
  phone: string;
  language: 'en' | 'es' | 'fr' | 'de';
  createdAt: Date;
  updatedAt: Date;
}

// Multi-language support
i18n.defaultLocale = 'en';
i18n.supportedLocales = ['en', 'es', 'fr', 'de'];
```

#### 2. Project Management
```typescript
type ProjectStatus = 'quote' | 'active' | 'completed' | 'archived';
type ProjectPhase = 'preparation' | 'welding' | 'testing' | 'delivery';

interface Project {
  id: string;
  userId: string;
  clientId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  currentPhase: ProjectPhase;
  startDate: Date;
  estimatedEndDate: Date;
  actualEndDate?: Date;
  estimatedBudget: number;
  actualCost: number;
  locations: Location[];
  team: TeamMember[];
  images: Image[];
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
}

interface TeamMember {
  userId: string;
  role: 'lead' | 'technician' | 'inspector';
  hoursWorked: number;
  ratePerHour: number;
}
```

#### 3. Billing & Invoicing
```typescript
type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue';
type PaymentMethod = 'card' | 'bank_transfer' | 'check' | 'cash';

interface Invoice {
  id: string;
  projectId: string;
  clientId: string;
  invoiceNumber: string; // AUTO-GENERATED: INV-2026-001
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes: string;
  paymentTerms: '15' | '30' | '60' | 'custom';
  
  // Payment tracking
  amountPaid: number;
  amountDue: number;
  paymentHistory: Payment[];
  lastReminderSent?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: 'labor' | 'materials' | 'equipment' | 'other';
  taxable: boolean;
}

interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  date: Date;
  transactionId?: string; // Stripe/PayPal reference
  status: 'pending' | 'completed' | 'failed';
}
```

#### 4. Portfolio Gallery
```typescript
type ImageCategory = 'before' | 'during' | 'after' | 'detail' | 'other';

interface Image {
  id: string;
  projectId: string;
  url: string;
  thumbnailUrl: string;
  category: ImageCategory;
  caption: string;
  displayOrder: number;
  uploadedAt: Date;
  metadata: {
    width: number;
    height: number;
    fileSize: number;
    uploadedBy: string;
  };
}

interface Gallery {
  id: string;
  userId: string;
  title: string;
  description: string;
  isPublic: boolean;
  projects: Project[];
  customUrl?: string; // e.g., tankerpro.com/portfolio/contractor-name
  theme: 'grid' | 'masonry' | 'carousel';
  displaySettings: {
    showProjectTitles: boolean;
    showDates: boolean;
    showDescriptions: boolean;
    columnsPerRow: 2 | 3 | 4;
  };
}
```

#### 5. Customer Relationship Management (CRM)
```typescript
interface Client {
  id: string;
  userId: string;
  name: string;
  type: 'individual' | 'business';
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Relationship tracking
  totalProjects: number;
  totalRevenue: number;
  lastProjectDate?: Date;
  status: 'active' | 'inactive' | 'prospect';
  
  // Communication
  notes: string;
  preferredContactMethod: 'email' | 'phone' | 'sms';
  communicationHistory: Communication[];
  
  createdAt: Date;
  updatedAt: Date;
}

interface Communication {
  id: string;
  clientId: string;
  type: 'call' | 'email' | 'message' | 'meeting';
  date: Date;
  notes: string;
  outcome: string;
}
```

#### 6. Analytics & Reporting
```typescript
interface BusinessMetrics {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  dateRange: { start: Date; end: Date };
  
  // Financial
  totalRevenue: number;
  averageInvoiceValue: number;
  totalInvoicesSent: number;
  collectionRate: number; // %
  overdueAmount: number;
  
  // Projects
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  averageProjectDuration: number; // days
  
  // Operations
  averageBilledHours: number;
  teamProductivity: number; // billable vs total
  materialCostRatio: number; // %
  
  // Growth
  newClients: number;
  repeatClientRate: number; // %
  yearOverYearGrowth: number; // %
}
```

## API Design Patterns

### Standard Response Format
```typescript
// Success Response
interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: Date;
}

// Error Response
interface ApiErrorResponse {
  success: false;
  error: {
    code: string; // 'VALIDATION_ERROR', 'NOT_FOUND', 'UNAUTHORIZED'
    message: string;
    details?: Record<string, string[]>;
  };
  timestamp: Date;
}
```

### Common Endpoints

```
Authentication:
  POST   /api/auth/signup
  POST   /api/auth/login
  POST   /api/auth/logout
  POST   /api/auth/refresh
  POST   /api/auth/forgot-password
  POST   /api/auth/reset-password

Projects:
  GET    /api/projects                 # List all projects
  POST   /api/projects                 # Create new project
  GET    /api/projects/:id             # Get project details
  PUT    /api/projects/:id             # Update project
  DELETE /api/projects/:id             # Archive project
  GET    /api/projects/:id/images      # Get project images
  POST   /api/projects/:id/images      # Upload image

Billing:
  GET    /api/invoices                 # List invoices
  POST   /api/invoices                 # Create invoice
  GET    /api/invoices/:id             # Get invoice
  PUT    /api/invoices/:id             # Update invoice
  POST   /api/invoices/:id/send        # Send invoice via email
  POST   /api/invoices/:id/pay         # Record payment
  GET    /api/invoices/:id/pdf         # Generate PDF

Clients:
  GET    /api/clients                  # List clients
  POST   /api/clients                  # Create client
  GET    /api/clients/:id              # Get client details
  PUT    /api/clients/:id              # Update client
  DELETE /api/clients/:id              # Remove client
  GET    /api/clients/:id/projects     # Get client's projects

Analytics:
  GET    /api/analytics/metrics        # Get business metrics
  GET    /api/analytics/dashboard      # Dashboard data
  GET    /api/analytics/reports/:type  # Generate report
  GET    /api/analytics/export         # Export data
```

### Request/Response Examples

```
Create Invoice
POST /api/invoices
Content-Type: application/json

{
  "projectId": "proj_123",
  "clientId": "client_456",
  "dueDate": "2026-07-01",
  "items": [
    {
      "description": "Welding labor - 16 hours @ $85/hr",
      "quantity": 16,
      "unitPrice": 85,
      "category": "labor",
      "taxable": true
    },
    {
      "description": "Stainless steel welding rod (5kg)",
      "quantity": 1,
      "unitPrice": 150,
      "category": "materials",
      "taxable": true
    }
  ],
  "taxRate": 0.08,
  "notes": "Payment due within 30 days of invoice date"
}

Response (201 Created):
{
  "success": true,
  "data": {
    "id": "inv_789",
    "invoiceNumber": "INV-2026-0042",
    "status": "draft",
    "total": 1416,
    "items": [...],
    "createdAt": "2026-06-01T10:30:00Z"
  }
}
```

## UI/UX Specifications

### Layout Structure

```
Dashboard Layout:
┌─────────────────────────────────────┐
│ Logo | Navigation | User Menu       │  Header (80px)
├──────────┬──────────────────────────┤
│          │                          │
│Sidebar   │    Main Content          │
│(280px)   │    (responsive)          │
│          │                          │
│          │                          │
└──────────┴──────────────────────────┘
```

### Component Hierarchy

1. **Page Components** - Full-page layouts
2. **Section Components** - Major content blocks
3. **Card Components** - Data containers
4. **Form Components** - Input handling
5. **Utility Components** - Buttons, badges, icons

### Key Pages

```
/                          - Marketing homepage
/signup                    - User registration
/login                     - Authentication
/dashboard                 - Main dashboard
/projects                  - Project list
/projects/[id]            - Project details
/projects/[id]/edit       - Project editor
/projects/new             - Create project
/invoices                 - Invoice list
/invoices/[id]            - Invoice details
/invoices/new             - Create invoice
/invoices/[id]/preview    - Invoice preview/PDF
/clients                  - Client management
/gallery                  - Portfolio showcase
/settings                 - User/org settings
/analytics                - Business insights
/admin                    - Admin panel
```

## Database Schema

### Core Tables

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  displayName VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  organization_id UUID REFERENCES organizations(id),
  language VARCHAR(10) DEFAULT 'en',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP
);

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID REFERENCES users(id),
  plan VARCHAR(50) DEFAULT 'starter',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  client_id UUID REFERENCES clients(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  startDate DATE,
  endDate DATE,
  estimatedBudget DECIMAL(10,2),
  actualCost DECIMAL(10,2) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP
);

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  type VARCHAR(50),
  totalRevenue DECIMAL(10,2) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  client_id UUID REFERENCES clients(id) NOT NULL,
  invoiceNumber VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  issueDate DATE DEFAULT CURRENT_DATE,
  dueDate DATE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  taxRate DECIMAL(5,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  amountPaid DECIMAL(10,2) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice Items
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unitPrice DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  category VARCHAR(50),
  taxable BOOLEAN DEFAULT true
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(50) NOT NULL,
  transactionId VARCHAR(255),
  status VARCHAR(50) DEFAULT 'completed',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Images
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  url VARCHAR(255) NOT NULL,
  thumbnailUrl VARCHAR(255),
  caption TEXT,
  category VARCHAR(50),
  displayOrder INT DEFAULT 0,
  uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Development Guidelines

### Code Quality Standards

```typescript
// ✅ REQUIRED
- TypeScript strict mode enabled
- 80%+ test coverage minimum
- Type-safe all database queries
- Input validation on all endpoints
- Error handling everywhere
- No console.log in production
- Semantic HTML
- Accessible color contrast (WCAG AA)

// ❌ FORBIDDEN
- any types (except with explicit justification)
- Unhandled promise rejections
- SQL injection vulnerabilities
- Hardcoded secrets or API keys
- Direct DOM manipulation
- Missing error boundaries
```

### Performance Targets

```
Metrics:
- Lighthouse Score: > 90
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- API Response Time (p95): < 200ms
- Database Query Time: < 100ms
- Bundle Size: < 200KB (gzipped)
```

### Testing Strategy

```
Unit Tests: 
  - All utility functions
  - All calculations (billing, tax, discounts)
  - Form validation
  - Component rendering logic
  Target: 80% coverage

Integration Tests:
  - API endpoint flows
  - Database operations
  - Payment processing
  - Email notifications

E2E Tests:
  - User signup → Project creation → Invoice → Payment
  - Gallery image upload and display
  - Multi-language switching
  - Dark mode toggle
```

## Deployment & DevOps

### Environments

```
Development:
  - Vercel preview deployment
  - Test database
  - Stripe test keys
  - SendGrid sandbox

Staging:
  - Vercel staging environment
  - Staging database (production replica)
  - All integrations active
  - User acceptance testing

Production:
  - AWS/DigitalOcean
  - Production database
  - All monitoring active
  - Automatic backups
```

### CI/CD Pipeline

```yaml
On Push to Feature Branch:
  - Run linting
  - Run tests
  - Build check
  - Deploy preview

On Merge to Develop:
  - All above +
  - Deploy to staging
  - Automated smoke tests
  - Notify team

On Merge to Main:
  - All above +
  - Security scan
  - Performance audit
  - Deploy to production
  - Monitor error rate
```

## Security Considerations

### Authentication & Authorization
- JWT tokens (15-min expiry, refresh tokens 30 days)
- Bcrypt password hashing (cost: 12)
- Rate limiting (5 attempts/15 min login)
- CSRF protection
- CORS properly configured

### Data Security
- All PII encrypted at rest
- HTTPS/TLS 1.3 enforced
- SQL parameterized queries
- Input sanitization
- Output encoding

### Compliance
- GDPR compliance (data export, deletion)
- SOC2 Type II readiness
- PCI DSS for payment handling
- Regular security audits
- Vulnerability scanning (Snyk)

## Monitoring & Observability

### Key Metrics to Track

```
Application:
  - Error rate
  - Response times (p50, p95, p99)
  - Database query performance
  - Cache hit rates
  - User count & activity

Business:
  - Invoices created/sent
  - Revenue tracked
  - Collection rate
  - Project completion rate
  - Customer satisfaction (NPS)
```

### Alerts

```
Critical (Page immediately):
  - Error rate > 1%
  - Uptime < 99%
  - Database connection failed
  - Payment processing failure

Warning (Check within 1 hour):
  - Response time p95 > 500ms
  - Error rate > 0.5%
  - Disk usage > 80%
  - High CPU > 70%
```

## Versioning & Updates

### API Versioning
- Use URL versioning: `/api/v1/`, `/api/v2/`
- Maintain backward compatibility for 2 versions
- Deprecate endpoints 6 months in advance
- Version database migrations

### Deployment Strategy
- Blue-green deployments
- Canary releases (5% → 25% → 100%)
- Rollback capability (20-minute window)
- Database migration safeguards
- Feature flags for gradual rollout

## Documentation Requirements

Every feature must include:
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Database schema documentation
- [ ] Component Storybook stories
- [ ] Unit test examples
- [ ] Integration guide (if third-party)
- [ ] UI/UX design specifications
- [ ] Deployment steps
- [ ] Monitoring setup

---

## Quick Reference

| Component | Location | Status |
|-----------|----------|--------|
| Authentication | `src/app/(auth)/` | In Progress |
| Projects | `src/app/(dashboard)/projects/` | In Progress |
| Billing | `src/app/billing/` | In Progress |
| Gallery | `src/app/gallery/` | Planned |
| CRM | `src/app/clients/` | Planned |
| Analytics | `src/app/analytics/` | Planned |
| API Routes | `src/app/api/` | In Progress |
| Components | `src/app/components/` | In Progress |

---

**For implementation questions, refer to MASTER_PRODUCT_PROMPT.md**  
**For design guidelines, refer to DESIGN_SYSTEM.md**  
**For daily development, refer to QUICK_REFERENCE.md**

*Last Updated: June 2026 | Maintained by: Engineering Team*
