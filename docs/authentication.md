# HospitalOS — Authentication, Authorization & RBAC Specification

## 1. Overview

HospitalOS implements enterprise-grade Role-Based Access Control (RBAC) with JSON Web Tokens (JWT), bcrypt password hashing with salt rounds of 10, and granular NestJS route guards.

---

## 2. Supported Healthcare Roles

HospitalOS enforces separation of concerns across 7 predefined roles:

| Role Enum | System Persona | Permitted Capabilities & Scopes |
| :--- | :--- | :--- |
| `ADMIN` | Hospital Administrator | Full platform administrative privileges: bed definitions, departments, staff records, real-time command center, analytics, and compliance audit log inspection. |
| `DOCTOR` | Attending Physician | Consultations, outpatient appointments, encounter notes, ICD diagnostic coding, ordering laboratory investigations, and issuing electronic prescriptions. |
| `NURSE` | Inpatient Ward Nurse | Ward bed occupancy tracking, assisting admissions and discharges, patient status updates, and logging vital signs (BP, HR, SpO2, Temp). |
| `RECEPTIONIST`| Front Desk Clerk | Patient registration, issuing medical record numbers (MRNs), check-in operations, and issuing prioritized queue tokens. |
| `LAB_STAFF` | Laboratory Technologist | Accessioning test orders, barcoding and collecting specimens, analyzer processing, and publishing pathology/radiology reports. |
| `PHARMACY_STAFF`| Pharmacist | Electronic prescription review, batch inventory tracking, low-stock warnings, and dispensing medication with automated inventory decrements. |
| `PATIENT` | Healthcare Consumer | Self-service appointment booking, check-in, tracking real-time queue position, viewing live 10-stage journey timeline, viewing reports, prescriptions, and paying bills. |

---

## 3. Security Implementation

### 3.1 Password Security
User passwords are encrypted before persistence in PostgreSQL using bcrypt:
```typescript
const salt = await bcrypt.genSalt(10);
const passwordHash = await bcrypt.hash(password, salt);
```

### 3.2 JWT Token Generation & Verification
Upon successful authentication, the backend signs a JWT with:
- `sub`: User ID
- `email`: User Email
- `role`: Role enum
- `exp`: 7 days expiration

### 3.3 Guard Execution Flow
Every protected endpoint is annotated with:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.DOCTOR)
```
1. `JwtAuthGuard`: Validates standard `Authorization: Bearer <token>` header and injects `req.user`.
2. `RolesGuard`: Verifies that `req.user.role` matches one of the declared roles.
3. `@CurrentUser()` decorator: Injects user payload directly into controller handler params.

---

## 4. Default Seeded Credentials for Testing

| Persona | Email | Default Password | Initial Route |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@hospitalos.org` | `Password123!` | `/admin` |
| **Physician (Cardiology)** | `dr.sharma@hospitalos.org` | `Password123!` | `/doctor` |
| **Physician (Pediatrics)** | `dr.chen@hospitalos.org` | `Password123!` | `/doctor` |
| **Inpatient Nurse** | `nurse.sarah@hospitalos.org` | `Password123!` | `/nurse` |
| **Receptionist** | `reception@hospitalos.org` | `Password123!` | `/reception` |
| **Laboratory Tech** | `lab.tech@hospitalos.org` | `Password123!` | `/laboratory` |
| **Pharmacist** | `pharmacist@hospitalos.org` | `Password123!` | `/pharmacy` |
| **Patient** | `patient.john@hospitalos.org` | `Password123!` | `/patient` |
