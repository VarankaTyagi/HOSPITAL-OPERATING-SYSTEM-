# HospitalOS — Local Development & Developer Guide

## 1. Prerequisites

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **PostgreSQL**: v15 or higher (running on `localhost:5432`)
- **Git**

---

## 2. Initial Setup

### Step 1: Clone & Install Dependencies
```bash
git clone <repository_url> hospitalos
cd hospitalos
npm install
```

### Step 2: Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your `DATABASE_URL` matches your local PostgreSQL credentials:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/hospitalos?schema=public"
```

### Step 3: Initialize Database Schema & Seed Data
```bash
npm run db:push
npm run db:seed
```

---

## 3. Running Services Locally

### Running Backend API
```bash
npm run dev:api
```
Backend API will start on `http://localhost:4000`.
Swagger interactive docs will be available at `http://localhost:4000/api/docs`.

### Running Frontend Web Portal
```bash
npm run dev:web
```
Frontend will start on `http://localhost:3000`.

---

## 4. Useful Monorepo Commands

| Command | Workspace Target | Description |
| :--- | :--- | :--- |
| `npm run build` | Root | Compiles all packages and apps |
| `npm run build --workspace=@hospitalos/api` | API | Compiles NestJS backend |
| `npm run build --workspace=@hospitalos/web` | Web | Compiles Next.js frontend with Webpack |
| `npm run test --workspace=@hospitalos/api` | API | Executes Jest test suites |
| `npm run db:studio` | Database | Opens Prisma Studio GUI at `localhost:5555` |
| `npm run db:generate` | Database | Re-generates Prisma TypeScript Client |
