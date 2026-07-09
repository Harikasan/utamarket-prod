# 🛒 UTAMarket

### AI-Powered Marketplace Platform for University Communities

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma" />
  <img src="https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss&logoColor=white" />
</p>

<p align="center">
An AI-powered marketplace built for university communities that enables students to buy, sell, and discover products through personalized recommendations, secure authentication, and an intelligent shopping assistant.
</p>

---

## 🚀 Live Demo

**https://utamarket.vercel.app/**

---

# 📖 Overview

UTAMarket is a production-style full-stack marketplace application developed for university students. The platform provides a modern buying and selling experience with AI-powered product recommendations, secure authentication, intelligent search, shopping cart functionality, and personalized user experiences.

The application demonstrates modern software engineering practices including scalable architecture, database optimization, RESTful APIs, authentication, real-time communication, and AI integration.

---

# ✨ Features

## Marketplace

- Product listing and management
- Product browsing
- Category filtering
- Product search
- Shopping cart
- Checkout workflow
- Order management
- User dashboard
- Profile management

---

## AI Features

- AI-powered shopping assistant
- Intelligent product recommendations
- Personalized suggestions
- Enhanced product discovery

---

## Authentication

- Secure user registration
- User login
- JWT authentication
- Session management
- Protected routes

---

## User Experience

- Responsive design
- Mobile-first interface
- Interactive dashboard
- Modern UI components
- Dark mode support
- Toast notifications

---

## Backend Features

- RESTful API architecture
- Database abstraction using Prisma ORM
- MySQL integration
- Secure password hashing
- Email notifications
- WebSocket support using Socket.IO

---

## Quality Assurance

- Automated testing
- Type safety with TypeScript
- ESLint support
- Component-based architecture

---

# 🏗 Architecture

```text
                    ┌─────────────────────────────┐
                    │        Next.js 15 UI        │
                    │          React App          │
                    └──────────────┬──────────────┘
                                   │
                      Next.js API Routes / Express APIs
                                   │
          ┌────────────────────────┼────────────────────────┐
          ▼                        ▼                        ▼
 ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
 │ Authentication │      │ Marketplace    │      │ AI Assistant   │
 │ JWT Security   │      │ Product APIs   │      │ Recommendations│
 └────────────────┘      └────────────────┘      └────────────────┘
                                   │
                        Prisma ORM
                                   │
                                   ▼
                          MySQL Database
```

---

# 🛠 Technology Stack

## Frontend

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Radix UI
- shadcn/ui
- React Hook Form
- Zod Validation
- Recharts

---

## Backend

- Next.js API Routes
- Express.js
- REST APIs
- JWT Authentication
- bcrypt
- Nodemailer

---

## Database

- MySQL
- Prisma ORM

---

## AI

- Groq SDK
- AI-powered chatbot
- Personalized recommendations

---

## Real-Time Communication

- Socket.IO
- WebSockets

---

## Development Tools

- Git
- GitHub
- ESLint
- npm

---

# 📈 Performance Highlights

- Supports scalable marketplace workflows
- Optimized database interactions using Prisma ORM
- AI-assisted product recommendations
- Responsive user interface
- Modular architecture for maintainability
- Real-time communication using Socket.IO

---

# 📁 Project Structure

```text
UTAMarket/
│
├── app/
├── components/
├── lib/
├── prisma/
├── public/
├── styles/
├── server/
├── utils/
├── hooks/
├── middleware/
├── types/
├── package.json
├── prisma.schema
└── README.md
```

---

# ⚙ Prerequisites

Before running the project, ensure you have:

- Node.js 18+
- npm
- MySQL Server
- Git

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/Harikasan/utamarket-prod.git

cd utamarket-prod
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Update the values in `.env` with your own:

- Database credentials
- JWT secret
- SMTP configuration
- API keys
- Application configuration

---

## Generate Prisma Client

```bash
npx prisma generate
```

---

## Apply Database Schema

```bash
npx prisma db push
```

or

```bash
npx prisma migrate dev
```

---

## Run Development Server

```bash
npm run dev
```

Visit:

```
http://localhost:3000
```

---

# 🏭 Production Build

Build the application

```bash
npm run build
```

Start production server

```bash
npm start
```

---

# 🔐 Environment Variables

The project uses a `.env` file for local configuration.

An example configuration is provided in:

```text
.env.example
```

Copy it before running the application:

```bash
cp .env.example .env
```

Never commit your actual `.env` file.

---

# 🧩 Core Modules

## Marketplace

Manages product listings, browsing, categories, shopping cart, and checkout.

---

## Authentication

Handles user registration, login, JWT authentication, and protected routes.

---

## Recommendation Engine

Provides personalized shopping recommendations based on user interactions.

---

## AI Assistant

Assists users with product discovery and marketplace navigation using AI.

---

## Database Layer

Uses Prisma ORM to provide scalable and maintainable database access.

---

## Real-Time Communication

Supports live updates using Socket.IO.

---

# 🧪 Available Scripts

```bash
npm run dev
```

Runs the development server.

```bash
npm run build
```

Creates the production build.

```bash
npm start
```

Runs the production server.

```bash
npm run lint
```

Runs ESLint.

---

# 🚀 Future Enhancements

- AI-powered semantic search
- Vector-based recommendation engine
- Image similarity search
- Live messaging
- Payment gateway integration
- Real-time notifications
- Analytics dashboard
- Cloud-native deployment
- Docker support
- Kubernetes deployment
- CI/CD pipeline

---

# 🎯 Project Impact

UTAMarket demonstrates modern full-stack software engineering by combining:

- AI integration
- Secure authentication
- Database optimization
- RESTful API development
- Modern frontend architecture
- Scalable backend services
- Real-time communication
- Production-ready development practices

The project showcases practical experience with technologies commonly used in modern software engineering roles.

---

# 📄 License

This project is licensed under the MIT License. See the **LICENSE** file for details.

---
