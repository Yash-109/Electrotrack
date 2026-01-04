# ⚡ Electrotrack - Professional E-commerce Platform

A modern, full-stack e-commerce platform for electronics retail, built with Next.js 15, MongoDB, and professional UI components.

## 🆕 Latest Improvements (v2.0)

### 🔧 **Code Quality & Performance**

- **Enhanced TypeScript Safety**: Replaced `any` types with proper `unknown` types
- **Error Boundary System**: Comprehensive error handling with graceful fallbacks
- **Performance Optimization**: React memoization and lazy loading
- **Image Optimization**: Advanced compression and responsive image loading

### 📱 **Mobile Experience**

- **Responsive Design**: Optimized layouts for all screen sizes
- **Touch-friendly UI**: Improved mobile interactions and accessibility
- **Flexible Grid System**: Adaptive product layouts
- **Mobile Navigation**: Enhanced mobile menu and navigation

### ♿ **Accessibility Features**

- **ARIA Labels**: Comprehensive screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus indicators and flow
- **Semantic HTML**: Improved semantic structure

### 🏗️ **Architecture Improvements**

- **Centralized Logging**: Professional logging system with environment awareness
- **Error Classification**: Structured error handling and reporting
- **Code Organization**: Clean separation of concerns
- **Documentation**: Enhanced inline documentation and comments

## 🚀 Features

### 🛒 **E-commerce Core**

- **Product Catalog**: 6 professional electronics products with high-quality images
- **Shopping Cart**: Persistent cart with localStorage backup
- **Order Management**: Complete order processing with success page
- **Payment Integration**: Razorpay payment gateway support
- **Responsive Design**: Mobile-first approach with modern UI

### 🔐 **Authentication System**

- **Google OAuth**: Seamless login with Google accounts
- **Email Verification**: Professional Gmail SMTP verification system
- **Session Management**: Secure user sessions with NextAuth.js
- **Admin Authentication**: Protected admin routes with bcrypt security

### 📧 **Contact & Communication**

- **Contact Form**: Real contact form with MongoDB storage
- **Email Notifications**: Instant admin notifications for new messages
- **Admin Management**: Professional contact message management interface
- **One-click Replies**: Direct email integration for customer support

### 📊 **Admin Dashboard**

- **Transaction Management**: Add, edit, and track financial transactions
- **Analytics Dashboard**: Revenue, expenses, and profit tracking
- **Contact Messages**: Manage customer inquiries with read/unread status
- **User Management**: Overview of registered users and activity

### 🎨 **Professional UI/UX**

- **Modern Design**: Clean, professional interface with shadcn/ui components
- **Dashboard Stats**: Real-time product and category statistics
- **Image Optimization**: Professional product images with hover effects
- **Responsive Layout**: Perfect display on all device sizes
- **Loading States**: Professional loading indicators and error handling

## 🛠️ Tech Stack

### **Frontend**

- **Next.js 15.2.4** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Professional UI components
- **Lucide Icons** - Modern icon library

### **Backend**

- **MongoDB 8.0.12** - NoSQL database
- **NextAuth.js** - Authentication framework
- **Nodemailer** - Email service integration
- **bcryptjs** - Password hashing and security

### **Services**

- **Google OAuth** - Social authentication
- **Gmail SMTP** - Email delivery service
- **Razorpay** - Payment processing
- **Local Storage** - Client-side data persistence

## 📦 Installation

### Prerequisites

- Node.js 18+ installed
- MongoDB running locally or remote connection
- Gmail account with app password for email service
- Git installed for version control

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/Yash-109/Electrotrack.git
   cd Electrotrack
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables**

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/electrotrack

   # NextAuth
   NEXTAUTH_URL=http://localhost:3001
   NEXTAUTH_SECRET=your-secret-here

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Admin Credentials
   ADMIN_USERNAME_1=admin
   ADMIN_PASSWORD_1=$2b$10$WiofDVQ1bpt08EV7wE3dne.bS8m21cFDVO4kI9avuoFb6Mc7vQ2zu

   # Gmail SMTP
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-app-password
   ```

5. **Start the application**

   ```bash
   # Default port 3000 (recommended)
   npm run dev

   # Alternative port 3001
   npm run dev:alt

   # Custom port (requires Google Console setup)
   npm run setup-port 3003
   npm run dev -- -p 3003
   ```

6. **Initialize database**
   Visit: `http://localhost:3001/api/setup-database` (POST request)

## 🔐 Admin Access

### Login Credentials

- **URL**: `http://localhost:3001/admin/login`
- **Username**: `admin`
- **Password**: `admin123`

### Admin Features

- 📊 Analytics dashboard with revenue/expense tracking
- 💬 Contact message management
- 💳 Transaction management
- 👥 User overview

## 📱 Application Structure

For a detailed breakdown of the project structure, see **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)**.

### Quick Overview

```
Electrotrack/
├── 📂 app/              # Next.js App Router (Pages & API)
├── 📂 components/       # React Components
├── 📂 hooks/            # Custom React Hooks
├── 📂 lib/              # Utilities & Services
├── 📂 config/           # Configuration Files
├── 📂 docs/             # Documentation
│   ├── setup/          # Setup guides
│   ├── guides/         # Implementation guides
│   └── features/       # Feature docs
├── 📂 tests/            # Test Files
└── 📂 public/           # Static Assets
```

**📚 Documentation:** All documentation is now organized in the `/docs` directory:

- **Setup Guides:** [docs/setup/](docs/setup/) - Installation and configuration
- **Implementation Guides:** [docs/guides/](docs/guides/) - OAuth, Email, Security
- **Feature Documentation:** [docs/features/](docs/features/) - Detailed feature specs
- **Changelog:** [docs/CHANGELOG.md](docs/CHANGELOG.md) - Version history

## 🎯 Key URLs

- **Homepage**: `http://localhost:3001/`
- **Product Catalog**: `http://localhost:3001/dashboard`
- **Contact Form**: `http://localhost:3001/contact`
- **Admin Login**: `http://localhost:3001/admin/login`
- **Admin Dashboard**: `http://localhost:3001/admin`
- **Contact Messages**: `http://localhost:3001/admin/contact-messages`

## 🚀 Deployment

### Environment Variables for Production

Ensure all environment variables are properly set in your hosting platform:

- Database connection strings
- OAuth credentials
- Email service configuration
- Admin credentials with bcrypt hashes
- NextAuth secrets

### Recommended Platforms

- **Vercel** - Optimal for Next.js applications
- **Railway** - Full-stack with database hosting
- **Heroku** - Traditional cloud platform
- **DigitalOcean** - Custom server deployment

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server (port 3000)
npm run dev:alt      # Start on alternate port (3001)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Project Organization

- **Clean Architecture**: Separation of concerns with organized directories
- **TypeScript**: Full type safety across the application
- **Modular Design**: Reusable components and utilities
- **Documentation First**: Comprehensive docs in `/docs` directory
- **Configuration Management**: Centralized configs in `/config`

### Quick Links

- 📖 **Full Structure Guide**: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- 🚀 **Setup Guide**: [docs/setup/SETUP-GUIDE.md](docs/setup/SETUP-GUIDE.md)
- 🔐 **Security Guide**: [docs/guides/SECURITY-FIXES-GUIDE.md](docs/guides/SECURITY-FIXES-GUIDE.md)
- 💳 **Payment Setup**: [docs/setup/RAZORPAY-SETUP.md](docs/setup/RAZORPAY-SETUP.md)

- **Clean Architecture**: Separation of concerns with organized directories
- **TypeScript**: Full type safety across the application
- **Modular Design**: Reusable components and utilities
- **Documentation First**: Comprehensive docs in `/docs` directory
- **Configuration Management**: Centralized configs in `/config`

### Quick Links

- 📖 **Full Structure Guide**: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- 🚀 **Setup Guide**: [docs/setup/SETUP-GUIDE.md](docs/setup/SETUP-GUIDE.md)
- 🔐 **Security Guide**: [docs/guides/SECURITY-FIXES-GUIDE.md](docs/guides/SECURITY-FIXES-GUIDE.md)
- 💳 **Payment Setup**: [docs/setup/RAZORPAY-SETUP.md](docs/setup/RAZORPAY-SETUP.md)

## 📞 Support & Contact

## 🧰 Recent maintenance

Small focused maintenance commits were added to improve reliability and accessibility:

- `perf(dashboard)`: Optimized product filtering and added memory cleanup helpers to reduce memory usage and speed up searches.
- `fix(api)`: Hardened API error handling and input validation across cart and product endpoints.
- `a11y(dashboard)`: Added accessibility utilities, skip links, and improved ARIA support for the dashboard.

These are low-risk, backwards-compatible improvements that make the app more robust and accessible.

### Business Information

- **Store**: Radhika Electronics
- **Address**: 18-gala minibazar, matavadi circle, Surat, Gujarat 394107
- **Phone**: +91 95108 86281
- **Email**: jayeshsavaliya3011@gmail.com

### Technical Support

For technical issues or feature requests:

1. Check the error logs in your terminal
2. Verify all environment variables are set correctly
3. Ensure database connectivity
4. Contact through the application's contact form

## 📄 License

This project is developed for Radhika Electronics. All rights reserved.

---

**Built with ❤️ by the Electrotrack Team**

_Professional e-commerce solution for electronics retail_
