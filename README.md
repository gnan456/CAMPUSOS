# CampusOS — Smart Campus Management Platform

> A comprehensive, production-grade SaaS platform designed to digitize, streamline, and manage all campus activities, featuring advanced AI capabilities.

![CampusOS Banner](https://via.placeholder.com/1200x400/0f172a/ffffff?text=CampusOS)

## Overview

CampusOS is a full-stack web application tailored for educational institutions. It solves real-world campus management problems by providing a unified dashboard where students, club coordinators, and administrators can interact seamlessly. From tracking events and filing complaints, to sharing study notes and recovering lost items—CampusOS brings the entire campus ecosystem online.

## Key Features

### Multi-Role Architecture
The platform is built on a secure, multi-tier RBAC (Role-Based Access Control) system:
- **Student**: The primary end-user. Can browse and register for events, file infrastructure complaints, share and download study notes, and report lost/found items.
- **Club Coordinator**: A trusted student leader. Inherits all student capabilities, plus the ability to independently create and publish campus events.
- **Admin**: The platform moderator. Has full oversight with access to platform-wide analytics, the ability to update complaint statuses, and "God Mode" moderation powers (can take down any event, delete any note, or remove any lost & found item).

### Event Management (With Pre-registration)
- Club Coordinators can create events which are auto-published.
- Students can view event details (date, location, capacity) and register.
- Admins can monitor events and forcefully "Take Down" inappropriate events, which automatically notifies all registered attendees.

### Notes & Study Resources
- A peer-to-peer file sharing hub for academic materials.
- Students can upload PDFs/Images, tagging them by Subject and Semester.
- Direct downloads from Cloudinary CDN.

### Lost & Found
- A dedicated space to report lost belongings or post found items.
- Features image uploads for easy identification.
- Items can be marked as "Resolved" once returned to the owner.

### Complaints Helpdesk
- Students can file categorized complaints (Infrastructure, Hostel, Academic, Canteen, etc.).
- Admins review complaints and update statuses (`OPEN` → `IN_PROGRESS` → `RESOLVED`).

### AI Campus Assistant (Gemini)
- An integrated AI chatbot powered by Google's Gemini API.
- Acts as a smart campus guide, capable of answering questions about campus policies, generating emails, or helping with academic queries.

### Real-time Notification System
- In-app push notifications alert users of important changes.
- Automatically notifies students when an event they registered for is taken down.
- Notifies creators when their items are interacted with or moderated.

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui & Radix UI
- **Icons**: Lucide React
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod validation

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (Access + Refresh tokens) with bcrypt password hashing
- **File Storage**: Cloudinary
- **AI Integration**: Google Gemini API (@google/genai)

## Local Development Setup

### Prerequisites
Ensure you have the following installed on your machine:
- Node.js (v18 or higher)
- npm (v9 or higher)
- A running PostgreSQL database instance (local or cloud-based like Neon)
- A Cloudinary account (for image/PDF storage)
- A Gemini API Key (for the AI Assistant)

### 1. Clone the repository
```bash
git clone https://github.com/gnan456/CAMPUSOS.git
cd CAMPUSOS
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory and populate it with your credentials (see `.env.example`):
```env
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/campusos?schema=public"

# Authentication Secrets
JWT_ACCESS_SECRET="your_access_secret_key"
JWT_REFRESH_SECRET="your_refresh_secret_key"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Cloudinary Storage Configuration
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Google Gemini AI Configuration
GEMINI_API_KEY="your_gemini_api_key"

# Server Configuration
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```

The application will now be running at `http://localhost:3000`.

## Repository Structure

```text
CAMPUSOS/
├── backend/
│   ├── prisma/             # Database schema and migrations
│   ├── public/             # Static assets and temp uploads
│   └── src/
│       ├── config/         # Environment, DB, and external service configs
│       ├── middleware/     # Express middlewares (Auth, Roles, Rate Limiting)
│       ├── modules/        # Feature modules (Auth, Events, Complaints, Notes, etc.)
│       │   └── [feature]/  # Contains routes, controller, service, repository, and validator
│       ├── types/          # Global TypeScript interfaces
│       ├── utils/          # Helper functions and Error classes
│       └── app.ts & server.ts
└── frontend/
    ├── app/                # Next.js App Router (Pages, Layouts, Routing)
    ├── components/         # Reusable React components (UI library, Layouts, Shared)
    ├── lib/                # Utility functions, Axios client, Zod schemas
    ├── services/           # API integration layer (Axios calls to backend)
    ├── store/              # Zustand global state stores (Auth, UI, Notifications)
    └── types/              # Frontend TypeScript definitions
```

## Security Measures Implemented
- **Role-Based Access Control (RBAC):** Backend routes are strictly protected by role-checking middleware.
- **JWT Authentication:** Secure token rotation with short-lived access tokens and http-only refresh strategies.
- **Rate Limiting:** API endpoints are rate-limited to prevent brute-force attacks and abuse.
- **Input Validation:** Zod schemas ensure strict typing and validation on both the frontend and backend.
- **Password Hashing:** Passwords are never stored in plaintext (bcrypt).

## License
Private — All rights reserved by the author.
