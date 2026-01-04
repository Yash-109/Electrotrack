# 📁 Electrotrack - Project Structure

This document provides a comprehensive overview of the Electrotrack project structure, making it easy for developers to understand and navigate the codebase.

## 📊 Directory Overview

```
Electrotrack/
├── 📂 app/                      # Next.js App Router (Pages & API Routes)
├── 📂 components/               # React Components
├── 📂 hooks/                    # Custom React Hooks
├── 📂 lib/                      # Utility Libraries & Services
├── 📂 public/                   # Static Assets
├── 📂 scripts/                  # Build & Utility Scripts
├── 📂 styles/                   # Global Styles
├── 📂 types/                    # TypeScript Type Definitions
├── 📂 config/                   # Configuration Files
├── 📂 docs/                     # Project Documentation
├── 📂 tests/                    # Test Files
└── 📄 Configuration Files       # Root-level configs
```

## 🗂️ Detailed Structure

### `/app` - Application Routes & Pages

Next.js 15 App Router structure with pages and API routes.

```
app/
├── layout.tsx                   # Root layout with providers
├── page.tsx                     # Home page (Product catalog)
├── globals.css                  # Global styles
│
├── about/                       # About page
├── admin/                       # Admin dashboard & management
│   ├── layout.tsx              # Admin layout with sidebar
│   ├── page.tsx                # Admin dashboard
│   ├── contacts/               # Contact message management
│   ├── transactions/           # Financial transaction management
│   └── users/                  # User management
│
├── api/                         # API Routes
│   ├── auth/[...nextauth]/     # NextAuth.js authentication
│   ├── cart/                   # Shopping cart endpoints
│   ├── contact/                # Contact form submission
│   ├── google-auth/            # Google OAuth endpoints
│   ├── orders/                 # Order management
│   ├── payment/                # Payment processing
│   ├── verify-email/           # Email verification
│   └── transactions/           # Transaction CRUD operations
│
├── cart/                        # Shopping cart page
├── contact/                     # Contact form page
├── dashboard/                   # User dashboard
├── location/                    # Location/shipping selection
├── login/                       # Login page
├── order-success/               # Order confirmation page
├── order-tracking/              # Track order status
├── payment/                     # Payment page
├── profile/                     # User profile management
├── shipping/                    # Shipping information
├── signup/                      # User registration
└── verify-email/                # Email verification page
```

### `/components` - Reusable Components

All React components organized by functionality.

```
components/
├── accessibility.tsx            # Accessibility utilities
├── admin-header.tsx            # Admin dashboard header
├── admin-route-guard.tsx       # Admin route protection
├── auth-provider.tsx           # Authentication context provider
├── error-boundary.tsx          # Error boundary wrapper
├── footer.tsx                  # Site footer
├── get-started-button.tsx      # CTA button component
├── google-maps.tsx             # Google Maps integration
├── header.tsx                  # Main site header
├── order-confirmation.tsx      # Order confirmation display
├── order-tracking.tsx          # Order tracking interface
├── pre-signup-verification.tsx # Email verification before signup
├── product-quick-view.tsx      # Product quick view modal
├── scroll-to-top.tsx           # Scroll to top button
├── theme-provider.tsx          # Theme context provider
│
├── admin/                       # Admin-specific components
│   ├── admin-sidebar.tsx       # Admin navigation sidebar
│   ├── contact-item.tsx        # Contact message item
│   ├── stats-cards.tsx         # Dashboard statistics cards
│   └── transaction-form.tsx    # Transaction form
│
└── ui/                          # Shadcn/UI Components
    ├── accordion.tsx
    ├── alert-dialog.tsx
    ├── avatar.tsx
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── dropdown-menu.tsx
    ├── input.tsx
    ├── label.tsx
    ├── select.tsx
    ├── table.tsx
    ├── toast.tsx
    └── ... (more UI components)
```

### `/hooks` - Custom React Hooks

Reusable React hooks for common functionality.

```
hooks/
├── use-admin-integration.ts     # Admin-specific logic hook
├── use-auth.ts                  # Authentication hook
├── use-mobile.tsx               # Mobile device detection
├── use-performance.ts           # Performance monitoring
└── use-toast.ts                 # Toast notification hook
```

### `/lib` - Libraries & Utilities

Core business logic, utilities, and service integrations.

```
lib/
├── admin-auth.ts                # Admin authentication logic
├── admin-middleware.ts          # Admin route middleware
├── admin-theme.ts               # Admin theme configuration
├── api-middleware.ts            # API middleware utilities
├── api-utils.ts                 # API helper functions
├── cart-service.ts              # Shopping cart logic
├── currency-utils.ts            # Currency formatting utilities
├── email-service.ts             # Email sending service
├── email-templates.ts           # Email HTML templates
├── env-validation.ts            # Environment variable validation
├── gmail-address-verification.ts # Gmail address validation
├── gmail-verification.ts        # Gmail SMTP verification
├── google-auth.ts               # Google OAuth integration
├── input-validation.ts          # Input validation utilities
├── invoice-generator.ts         # PDF invoice generation
├── logger.ts                    # Centralized logging system
├── mongodb.ts                   # MongoDB connection
├── pre-signup-verification.ts   # Pre-signup email verification
├── safe-storage.ts              # Safe localStorage wrapper
├── security-analytics.ts        # Security monitoring
├── shipping-constants.ts        # Shipping configuration
├── shipping-validation.ts       # Shipping form validation
├── transaction-store.ts         # Transaction state management
├── user-auth.ts                 # User authentication
├── utils-common.ts              # Common utilities
└── utils.ts                     # General utility functions
```

### `/public` - Static Assets

Public files served directly by Next.js.

```
public/
├── database-setup.html          # Database setup documentation
├── images/                      # Product and site images
└── ... (other static files)
```

### `/scripts` - Utility Scripts

Build scripts and utilities.

```
scripts/
└── hash-password.js             # Password hashing utility
```

### `/styles` - Global Styles

Additional styling files.

```
styles/
└── ... (custom style files)
```

### `/types` - TypeScript Definitions

TypeScript type definitions and interfaces.

```
types/
└── ... (type definition files)
```

### `/config` - Configuration Files

Build and tool configurations (moved from root).

```
config/
├── tailwind.config.ts           # TailwindCSS configuration
├── postcss.config.mjs           # PostCSS configuration
└── components.json              # Shadcn/UI configuration
```

### `/docs` - Documentation

Organized project documentation.

```
docs/
├── README.md                    # Documentation index
├── CHANGELOG.md                 # Version history
├── IMPLEMENTATION-COMPLETE.md   # Implementation status
├── INTEGRATION-COMPLETE.md      # Integration documentation
├── STORAGE-DOCUMENTATION.md     # Storage documentation
│
├── setup/                       # Setup guides
│   ├── SETUP-GUIDE.md
│   ├── ENVIRONMENT.md
│   ├── RAZORPAY-SETUP.md
│   ├── ONLINE-PAYMENT-SETUP.md
│   ├── GET-RAZORPAY-KEYS.md
│   └── LOCALHOST-API-KEYS.md
│
├── guides/                      # Implementation guides
│   ├── EMAIL-VERIFICATION-GUIDE.md
│   ├── EMAIL-VERIFICATION-UPDATED.md
│   ├── GMAIL-SMTP-SETUP-FIX.md
│   ├── GMAIL-VERIFICATION-GUIDE.md
│   ├── GOOGLE-OAUTH-SETUP.md
│   ├── SECURITY-FIXES-GUIDE.md
│   └── SECURITY-IMPROVEMENTS-OCT-2025.md
│
└── features/                    # Feature documentation
    ├── CART_PERSISTENCE_IMPLEMENTATION.md
    ├── CURRENCY-FORMATTING-FIX.md
    ├── INVOICE-DOWNLOAD-IMPLEMENTATION.md
    ├── ORDER-TRACKING-IMPLEMENTATION.md
    ├── PAYMENT-ENHANCEMENTS.md
    ├── REVIEW-VOTING-ENHANCEMENT.md
    └── VISUAL-UPDATES.md
```

### `/tests` - Test Files

Test and debug scripts.

```
tests/
├── README.md                    # Test documentation
├── test-currency-formatting.js  # Currency tests
├── test-pdf-rendering.js        # PDF generation tests
└── debug-currency.js            # Currency debug script
```

## 📄 Root Configuration Files

```
.env.local                       # Environment variables (gitignored)
.env.example                     # Environment template
.eslintrc.json                   # ESLint configuration
.gitignore                       # Git ignore rules
next.config.mjs                  # Next.js configuration
next-env.d.ts                    # Next.js TypeScript declarations
package.json                     # Dependencies and scripts
package-lock.json                # Dependency lock file
tsconfig.json                    # TypeScript configuration
tsconfig.tsbuildinfo             # TypeScript build info
README.md                        # Main project README
```

## 🔄 Data Flow

### Authentication Flow

```
User Login → API Route → lib/user-auth.ts → MongoDB → Session Storage
```

### Order Flow

```
Cart → Checkout → Payment Gateway → Order Processing → Email Confirmation
```

### Admin Flow

```
Admin Login → Auth Check → Admin Dashboard → CRUD Operations → Database
```

## 🎯 Key Design Patterns

### 1. **Separation of Concerns**

- `/app` - Routes and page components
- `/components` - Reusable UI components
- `/lib` - Business logic and services
- `/hooks` - Shared React hooks

### 2. **API Route Organization**

- Each feature has its own API directory
- Consistent naming convention
- Middleware for authentication and validation

### 3. **Type Safety**

- TypeScript throughout the codebase
- Custom types in `/types` directory
- Proper typing for API responses

### 4. **Documentation First**

- All major features documented in `/docs`
- Setup guides for easy onboarding
- Feature-specific documentation

## 🚀 Getting Started

1. **Read the main [README.md](README.md)** for project overview
2. **Check [docs/setup/SETUP-GUIDE.md](docs/setup/SETUP-GUIDE.md)** for installation
3. **Review [docs/setup/ENVIRONMENT.md](docs/setup/ENVIRONMENT.md)** for configuration
4. **Explore specific features** in `/docs/features` as needed

## 📝 Contributing

When adding new features:

1. Follow the existing directory structure
2. Add components to appropriate directories
3. Document new features in `/docs/features`
4. Update this structure guide if needed
5. Write tests in `/tests` directory

## 🔍 Quick Navigation

- **Starting Development?** → [docs/setup/SETUP-GUIDE.md](docs/setup/SETUP-GUIDE.md)
- **Need API Keys?** → [docs/setup/ENVIRONMENT.md](docs/setup/ENVIRONMENT.md)
- **Setting up Payments?** → [docs/setup/RAZORPAY-SETUP.md](docs/setup/RAZORPAY-SETUP.md)
- **Configuring Email?** → [docs/guides/GMAIL-SMTP-SETUP-FIX.md](docs/guides/GMAIL-SMTP-SETUP-FIX.md)
- **Security Guide?** → [docs/guides/SECURITY-FIXES-GUIDE.md](docs/guides/SECURITY-FIXES-GUIDE.md)

---

**Last Updated:** January 4, 2026
**Version:** 2.0.0
**Maintainer:** Yash-109
