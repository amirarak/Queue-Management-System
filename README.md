# Queue Management System

Monorepo with backend and frontend for university queue management.

## Project Structure

- backend: Node.js API (Express + Sequelize + Redis + JWT)
- frontend: Vue 3 app (Vite + Pinia + Vue Router)

## Prerequisites

- Node.js 18+
- PostgreSQL 13+
- Redis 6+ (optional but recommended)

## Environment Setup

1. Copy backend env file and fill secrets:

```bash
cp backend/.env.example backend/.env
```

2. Set at least these required values in backend/.env:

- JWT_SECRET
- DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

Note: Backend now fails fast on startup if JWT_SECRET is missing.

3. Copy frontend env file:

```bash
cp frontend/.env.example frontend/.env
```

## Install Dependencies

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
npm --prefix backend/tests install
```

## Run In Development

Backend:

```bash
npm --prefix backend run dev
```

Frontend:

```bash
npm --prefix frontend run dev
```

## Database Bootstrap

Run migration/seed scripts from backend:

```bash
npm --prefix backend run migrate
npm --prefix backend run seed
```

## Tests

Run all backend tests from repository root:

```bash
npm test
```

Run domain-specific tests:

```bash
npm run test:auth
npm run test:queue
npm run test:kiosk
npm run test:display
npm run test:staff
npm run test:analytics
npm run test:security
```

## Release Smoke Checklist

- Backend starts with valid JWT_SECRET
- Frontend can load departments in kiosk
- Staff can call, complete, and skip tickets
- Display board shows serving, waiting, and history
- `npm test` passes from root
