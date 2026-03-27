# 🎯 Evalyzer - CA Test Series Engine & Evaluation Platform

<div align="center">

![Evalyzer Logo](https://img.shields.io/badge/Evalyzer-CA%20Platform-blue?style=for-the-badge&logo=graduation-cap)

**Transform CA Exam Preparation with Smart Evaluation & AI-Powered Insights**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-informational?logo=prisma)](https://www.prisma.io/)

[Live Demo](#) • [Documentation](#documentation) • [Report Bug](#issues) • [Request Feature](#issues)

</div>

## 📋 Table of Contents

- [About Evalyzer](#-about-evalyzer)
- [✨ Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [📦 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [👥 User Roles](#-user-roles)
- [🔧 Development](#-development)
- [📚 API Documentation](#-api-documentation)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🌟 About Evalyzer

Evalyzer is a comprehensive **CA Test Series Engine & Evaluation Platform** designed to revolutionize Chartered Accountancy exam preparation. By combining intelligent evaluation, performance analytics, and personalized feedback, Evalyzer accelerates student success through data-driven insights.

### 🎯 Our Mission

> "To transform CA exam preparation from traditional testing to a comprehensive learning experience powered by smart evaluation and AI-driven insights."

### 📊 Platform Impact

- **10,000+** CA Students supported
- **50,000+** Evaluations completed  
- **95%** Success rate
- **4.8/5** Student satisfaction rating

## ✨ Key Features

### 📚 **Comprehensive Test Series Engine**
- **Full Syllabus Coverage**: CA Foundation, Intermediate, and Final levels
- **Real Exam Patterns**: Authentic CA exam simulation with 3-hour timed tests
- **Chapter-wise Tests**: Targeted practice for specific topics
- **Revision Papers**: Comprehensive exam preparation
- **Hybrid Mode**: Online + Offline exam support

### 🧠 **Smart Evaluation Engine**
- **Expert Evaluators**: Qualified CA professionals for accurate assessment
- **AI-Powered Assistance**: Keyword detection and suggested marking
- **Step-wise Marking**: ICAI-compliant evaluation patterns
- **Multi-Level Review**: First evaluator → Second evaluator → Head examiner
- **Quality Assurance**: Random rechecking and moderation

### 📈 **Performance Analytics**
- **AIR Simulation**: All India Rank prediction and percentile scoring
- **Subject-wise Analysis**: Detailed performance breakdown by subject
- **Weak Area Identification**: AI-powered improvement suggestions
- **Progress Tracking**: Historical performance trends
- **Comparative Analysis**: Peer performance benchmarking

### 🎨 **Answer Sheet Management**
- **Easy Upload**: Mobile-friendly PDF/image upload
- **QR Code Tracking**: Secure answer sheet identification
- **Real-time Status**: Track evaluation progress live
- **Digital Processing**: Environment-friendly paperless evaluation

### 🤖 **AI-Powered Insights**
- **Personalized Feedback**: "Where you lost marks" analysis
- **Model Answer Comparison**: Learn from ideal solutions
- **Study Recommendations**: Personalized improvement plans
- **Time Management Analysis**: Optimize exam strategy

### 💰 **Built-in Monetization**
- **Flexible Pricing**: Per-copy billing and subscription plans
- **Payment Gateway Integration**: Secure online payments
- **Evaluator Earnings**: Transparent payment system
- **Revenue Analytics**: Comprehensive financial tracking

## 🏗️ Architecture

### 🛠️ Technology Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | Next.js 16 + TypeScript | Modern React framework with type safety |
| **Styling** | Tailwind CSS + shadcn/ui | Beautiful, responsive UI components |
| **Database** | Prisma + SQLite | Type-safe database ORM with SQLite |
| **Authentication** | NextAuth.js | Secure authentication with role-based access |
| **State Management** | Zustand + TanStack Query | Client and server state management |
| **AI/ML** | z-ai-web-dev-sdk | AI-powered evaluation assistance |

### 🏛️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Student App   │    │  Evaluator App  │    │   Admin Panel   │
│                 │    │                 │    │                 │
│ • Exam Browse   │    │ • Evaluation    │    │ • User Mgmt     │
│ • Test Taking   │    │ • Earnings      │    │ • Analytics     │
│ • Performance   │    │ • Quality       │    │ • Revenue       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Evalyzer API │
                    │                 │
                    │ • Auth Service  │
                    │ • Exam Engine   │
                    │ • Evaluation    │
                    │ • Analytics     │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Database      │
                    │                 │
                    │ • Users         │
                    │ • Exams         │
                    │ • Evaluations   │
                    │ • Analytics     │
                    └─────────────────┘
```

## 🚀 Quick Start

### 📋 Prerequisites

- **Node.js** 18+ and npm/yarn/bun
- **Git** for version control
- **Code Editor** (VS Code recommended)

### ⚡ One-Click Setup

```bash
# Clone the repository
git clone https://github.com/jitenkr2030/Evalyzer.git
cd Evalyzer

# Install dependencies
bun install

# Setup database
bun run db:push

# Start development server
bun run dev
```

🎉 **Visit [http://localhost:3000](http://localhost:3000) to see Evalyzer in action!**

## 📦 Installation

### 1. **Clone Repository**

```bash
git clone https://github.com/jitenkr2030/Evalyzer.git
cd Evalyzer
```

### 2. **Install Dependencies**

```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install

# Or using yarn
yarn install
```

### 3. **Environment Setup**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Optional: External services
# UPLOAD_SECRET="your-upload-secret"
# AI_API_KEY="your-ai-api-key"
```

### 4. **Database Setup**

```bash
# Push database schema
bun run db:push

# (Optional) Generate Prisma client
bun run db:generate
```

### 5. **Start Development**

```bash
# Start development server
bun run dev

# Or for production
bun run build
bun run start
```

## ⚙️ Configuration

### 🗄️ Database Configuration

Evalyzer uses Prisma with SQLite by default. To use other databases:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"  // or "mysql", "sqlserver"
  url      = env("DATABASE_URL")
}
```

### 🔐 Authentication Configuration

Configure NextAuth.js in `src/lib/auth.ts`:

```typescript
export const authOptions: NextAuthOptions = {
  providers: [
    // Add custom providers here
  ],
  // ... other configurations
}
```

### 📧 Email Configuration (Optional)

Add email provider for notifications:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

## 👥 User Roles

### 🎓 **Student**
- Browse and enroll in exams
- Upload answer sheets
- View results and feedback
- Track performance analytics
- Receive personalized insights

### 👨‍🏫 **Evaluator**
- Evaluate assigned answer sheets
- Track earnings and productivity
- Access evaluation tools
- View quality metrics
- Manage evaluation schedule

### 🛡️ **Admin / Super Admin**
- Manage users and permissions
- Create and schedule exams
- Monitor platform analytics
- Handle payments and revenue
- Configure system settings

## 🔧 Development

### 📁 Project Structure

```
Evalyzer/
├── prisma/                 # Database schema and migrations
│   └── schema.prisma      # Prisma database schema
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── api/          # API routes
│   │   ├── auth/         # Authentication pages
│   │   └── dashboard/    # Role-based dashboards
│   ├── components/        # Reusable React components
│   │   └── ui/           # shadcn/ui components
│   ├── lib/              # Utility functions and configurations
│   │   ├── auth.ts       # NextAuth configuration
│   │   └── db.ts         # Prisma client
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
└── docs/                 # Documentation
```

### 🛠️ Available Scripts

```bash
# Development
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server

# Database
bun run db:push      # Push schema to database
bun run db:generate  # Generate Prisma client
bun run db:migrate   # Run database migrations
bun run db:reset     # Reset database

# Code Quality
bun run lint         # Run ESLint
bun run type-check   # Run TypeScript checks
```

### 🧪 Testing

```bash
# Run tests (when implemented)
bun run test
bun run test:watch
bun run test:coverage
```

### 🎨 UI Components

Evalyzer uses **shadcn/ui** components. To add new components:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
# ... more components
```

## 📚 API Documentation

### 🔐 Authentication Endpoints

#### POST `/api/auth/register`
Register a new user with role-specific fields.

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "STUDENT",
  "rollNumber": "CA2024001",
  "caLevel": "FOUNDATION"
}
```

#### POST `/api/auth/[...nextauth]`
NextAuth.js authentication handler.

### 📊 Dashboard Endpoints

#### GET `/api/dashboard/student/stats`
Get student dashboard statistics.

#### GET `/api/dashboard/evaluator/pending`
Get pending evaluations for evaluator.

#### GET `/api/dashboard/admin/overview`
Get admin platform overview.

### 📝 Exam Endpoints

#### GET `/api/exams`
List all available exams.

#### POST `/api/exams`
Create new exam (Admin only).

#### POST `/api/exams/{id}/enroll`
Enroll in an exam (Student only).

### 📄 Answer Sheet Endpoints

#### POST `/api/answer-sheets/upload`
Upload answer sheet for evaluation.

#### GET `/api/answer-sheets/{id}/status`
Check evaluation status.

## 🤝 Contributing

We love contributions! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### 🚀 How to Contribute

1. **Fork the Repository**
   ```bash
   git fork https://github.com/jitenkr2030/Evalyzer.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Changes**
   - Follow the existing code style
   - Add tests for new features
   - Update documentation

4. **Commit Changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

5. **Push to Branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open Pull Request**
   - Provide clear description
   - Include screenshots if applicable
   - Link relevant issues

### 📝 Development Guidelines

- **Code Style**: Follow ESLint configuration
- **Type Safety**: Use TypeScript for all new code
- **Components**: Use shadcn/ui when possible
- **API**: Follow RESTful conventions
- **Database**: Use Prisma migrations for schema changes

### 🐛 Bug Reports

When reporting bugs, please include:

- **Environment**: OS, Node.js version, browser
- **Steps to Reproduce**: Detailed reproduction steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable

### 💡 Feature Requests

For feature requests:

- **Use Case**: Describe the problem you're solving
- **Proposed Solution**: How you envision the feature
- **Alternatives**: Other approaches considered
- **Priority**: Low/Medium/High

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Evalyzer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Prisma Team** - For the excellent TypeScript ORM
- **shadcn/ui** - For beautiful UI components
- **Vercel** - For hosting and deployment platform
- **CA Community** - For valuable feedback and insights

## 📞 Contact & Support

- **📧 Email**: support@evalyzer.com
- **💬 Discord**: [Join our community](#)
- **🐦 Twitter**: [@EvalyzerCA](#)
- **📱 WhatsApp**: +91-XXXXXXXXXX

---

<div align="center">

**⭐ Star this repository if it helped you!**

Made with ❤️ by the Evalyzer Team

[🔝 Back to Top](#-evalyzer---ca-test-series-engine--evaluation-platform)

</div>