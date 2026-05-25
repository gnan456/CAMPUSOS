# CampusOS — AI-Powered Smart Campus Management Platform

> A production-grade, scalable SaaS platform for campus management with AI capabilities.

## Tech Stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Frontend   | Next.js 14+, React 18, TypeScript, Tailwind CSS, shadcn/ui |
| Backend    | Node.js, Express.js, TypeScript, Prisma ORM   |
| Database   | PostgreSQL (Neon)                              |
| Auth       | JWT (access + refresh tokens), bcrypt          |
| AI         | OpenAI API (GPT-4o)                            |
| Storage    | Cloudinary                                     |
| Deployment | Vercel (FE) · Render (BE) · Neon (DB)          |

## Monorepo Structure

```
campusos/
├── frontend/          → Next.js 14+ App Router
├── backend/           → Express.js + Prisma
├── docs/              → API docs, architecture diagrams
├── docker/            → Docker configs
├── scripts/           → DB seed, migration helpers
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL (or Neon cloud instance)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env    # fill in your credentials
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local   # set API URL
npm run dev
```

## User Roles

| Role             | Capabilities                                         |
| ---------------- | ---------------------------------------------------- |
| Student          | View events, register, upload notes, file complaints, AI assistant |
| Admin            | Manage platform, resolve complaints, analytics        |
| Club Coordinator | Create events, manage participants, notifications     |

## Branch Strategy

- `main` → production-ready (PRs only)
- `dev` → integration branch
- `feature/*` → feature branches

## Commit Convention

```
feat: implemented JWT auth middleware
fix: resolved complaint status update bug
chore: added Prisma migration for events
docs: updated Swagger docs for events API
```

## License

Private — All rights reserved.
