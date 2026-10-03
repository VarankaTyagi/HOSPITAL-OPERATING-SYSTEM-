# HospitalOS — Real-Time Hospital Operations & Patient Journey Management Platform

[![CI/CD Pipeline](https://github.com/hospitalos/hospitalos/actions/workflows/ci.yml/badge.svg)](https://github.com/hospitalos/hospitalos/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js 14+](https://img.shields.io/badge/Frontend-Next.js%2014+-black)](https://nextjs.org/)
[![NestJS 10](https://img.shields.io/badge/Backend-NestJS%2010-red)](https://nestjs.com/)
[![PostgreSQL 16](https://img.shields.io/badge/Database-PostgreSQL%2016-blue)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/ORM-Prisma-teal)](https://www.prisma.io/)
[![Socket.IO](https://img.shields.io/badge/Real--Time-Socket.IO-black)](https://socket.io/)

---

## 🏥 Executive Overview

**HospitalOS** is a production-grade, full-stack hospital operations platform designed to digitally connect all healthcare stakeholders, operational units, and clinical resources.

It unifies the complete **10-stage Patient Journey** with a deterministic **Digital Twin** representing the real-time physical state of the hospital facility (queues, bed matrix, pathology orders, pharmacy dispensing, and bottleneck indicators).

```text
Registration
      ↓
Appointment
      ↓
Check-in
      ↓
Queue
      ↓
Consultation
      ↓
Laboratory / Radiology
      ↓
Prescription
      ↓
Pharmacy
      ↓
Billing
      ↓
Admission / Discharge
      ↓
Follow-up
```

---

## 🌟 Key Capabilities & System Features

- **Operational Digital Twin**: A real-time digital mirror of the physical hospital state computed directly from PostgreSQL records and synchronized sub-second via WebSockets.
- **Rule-Based Bottleneck Detection**: Heuristic engine continuously flags bed saturation (>85%), triage waiting room congestion (>5 patients), laboratory backlogs, and critical medication stockouts.
- **Centralized Hospital Command Center**: Live operational visibility for hospital leadership into census, staff availability, active queues, and streaming event logs.
- **7-Role Granular RBAC**: Strict separation of concerns for Administrator, Doctor, Nurse, Receptionist, Lab Tech, Pharmacist, and Patient.
- **Inpatient Bed Management**: Interactive bed occupancy matrix with states: `AVAILABLE`, `OCCUPIED`, `RESERVED`, `CLEANING`, `MAINTENANCE`, `BLOCKED`.
- **Diagnostic Pathology Workstation**: Specimen accessioning, analyzer run simulations, and pathologist sign-off producing digital EHR reports.
- **Pharmacy Dispensary & Formulary**: Prescription queue, automated inventory decrements on dispense, and batch expiry tracking.
- **Interactive Campus Wayfinding**: Floor-by-floor navigation directory across Hospital Wings, ICU, Outpatient Clinics, and Diagnostic Suites.

---

## 🧑‍⚕️ Supported Roles & 1-Click Credentials

| Persona | Email | Password | Access Route | Focus Area |
| :--- | :--- | :--- | :--- | :--- |
| **Hospital Administrator** | `admin@hospitalos.org` | `Password123!` | `/admin` | Command Center, Digital Twin, Analytics, Bed Master |
| **Attending Physician** | `dr.sharma@hospitalos.org` | `Password123!` | `/doctor` | Consultation Workstation, E-Prescribing, Lab Orders |
| **Inpatient Ward Nurse** | `nurse.sarah@hospitalos.org` | `Password123!` | `/nurse` | Ward Rounds, Bed Turnaround, Triage Vitals Entry |
| **Front Desk Receptionist** | `reception@hospitalos.org` | `Password123!` | `/reception` | Patient Intake, Queue Token Dispensation, Check-In |
| **Laboratory Technologist** | `lab.tech@hospitalos.org` | `Password123!` | `/laboratory` | Accessioning, Processing & Diagnostic Reports |
| **Dispensary Pharmacist** | `pharmacist@hospitalos.org` | `Password123!` | `/pharmacy` | Prescription Queue, Stock Batches, Dispensing |
| **Registered Patient** | `patient.john@hospitalos.org` | `Password123!` | `/patient` | 10-Stage Journey Timeline, Appointments, Bills |

---

## 🏗️ Monorepo Architecture

```text
hospitalos/
├── apps/
│   ├── api/                     # NestJS 10 Backend (REST + Socket.IO + Swagger)
│   │   ├── src/                 # Domain Modules (Auth, Twin, Queues, Beds, Labs...)
│   │   └── Dockerfile
│   │
│   └── web/                     # Next.js 14+ Frontend (App Router + Tailwind + Recharts)
│       ├── src/app/             # Role portals: /admin, /doctor, /nurse, /reception...
│       └── Dockerfile
│
├── packages/
│   └── database/                # Centralized Prisma 7 PostgreSQL Schema & Migrations
│
├── docs/                        # Exhaustive Architecture, DB, API & Security Specs
│   ├── architecture.md
│   ├── database.md
│   ├── api.md
│   ├── authentication.md
│   ├── realtime.md
│   ├── digital-twin.md
│   ├── deployment.md
│   └── development.md
│
├── docker-compose.yml           # Complete containerization (Postgres, Redis, API, Web)
└── .github/workflows/ci.yml     # Automated CI/CD pipeline
```

---

## 🚀 Quickstart Guide

### Option 1: Docker Compose (Instant Deployment)

```bash
docker compose up -d --build
```
- **Web Portal**: [http://localhost:3000](http://localhost:3000)
- **API Server**: [http://localhost:4000/api](http://localhost:4000/api)
- **Swagger Documentation**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

### Option 2: Local Development

```bash
# 1. Clone & install dependencies
git clone https://github.com/hospitalos/hospitalos.git
cd hospitalos
npm install

# 2. Setup environment
cp .env.example .env

# 3. Synchronize database schema & seed synthetic records
npm run db:push
npm run db:seed

# 4. Start NestJS Backend API (Port 4000)
npm run dev:api

# 5. Start Next.js Frontend Portal (Port 3000)
npm run dev:web
```

---

## 🧪 Testing Suite

```bash
# Execute NestJS End-to-End Suite
npm run test:e2e --workspace=@hospitalos/api
```

---

## 📜 Regulatory & Architectural Compliance

- **HIPAA/GDPR Audit Trails**: Every clinical event records user ID, IP address, timestamp, and resource payload in immutable audit logs.
- **ACID Integrity**: Multi-table operations (e.g. prescription dispensing with stock decrement, appointment check-in with token generation) run inside Prisma database transactions.
- **Scalable WebSockets**: Socket.IO gateway supports Redis adapter clustering for multi-instance deployments.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
