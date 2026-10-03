# HospitalOS — REST API Specification & Endpoints

## 1. Overview & Swagger Documentation

The HospitalOS API is built on NestJS and runs on port `4000`. Interactive OpenAPI / Swagger 3.0 documentation is automatically served at:

```text
http://localhost:4000/api/docs
```

All endpoints are prefixed with `/api` and utilize standard HTTP status codes, JSON request/response bodies, and bearer JWT authentication.

---

## 2. API Endpoints Reference

### 2.1 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login with email and password, returns JWT | No |
| `GET` | `/api/auth/profile` | Retrieve authenticated user profile | Bearer JWT |

### 2.2 Digital Twin Core (`/api/digital-twin`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/digital-twin/state` | Returns live hospital operational twin snapshot | No |
| `GET` | `/api/digital-twin/events` | Query recent operational event timeline | No |

### 2.3 Patients & Demographics (`/api/patients`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/patients` | Paginated search of patient charts | No |
| `GET` | `/api/patients/:id` | Get patient record by ID or MRN | No |
| `POST` | `/api/patients` | Create patient profile & issue MRN | Bearer JWT |
| `PATCH`| `/api/patients/:id/status`| Update patient operational journey stage | Bearer JWT |

### 2.4 Appointments (`/api/appointments`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/appointments` | Filter appointments by doctor/date/status | No |
| `POST` | `/api/appointments` | Book new outpatient consultation slot | Bearer JWT |
| `POST` | `/api/appointments/:id/check-in` | Self/Reception check-in & token generation | Bearer JWT |
| `PATCH`| `/api/appointments/:id/status` | Update appointment status | Bearer JWT |

### 2.5 Real-Time Queues (`/api/queues`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/queues` | List department queues with waiting tickets | No |
| `POST` | `/api/queues/:id/generate-token` | Issue new ticket token with priority | No |
| `POST` | `/api/queues/:id/call-next` | Announce & call next waiting token | Bearer JWT |
| `PATCH`| `/api/queues/tickets/:ticketId/status`| Update ticket status | Bearer JWT |

### 2.6 Clinical Encounters (`/api/encounters`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/encounters` | List clinical encounters | No |
| `POST` | `/api/encounters/start` | Open consultation session & log vitals | Bearer JWT |
| `PATCH`| `/api/encounters/:id/complete` | Conclude consultation, save ICD diagnosis | Bearer JWT |

### 2.7 Diagnostic Laboratory (`/api/laboratory`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/laboratory/orders` | List pathology/radiology test orders | No |
| `POST` | `/api/laboratory/orders` | Place diagnostic test order | Bearer JWT |
| `PATCH`| `/api/laboratory/samples/:id/collect` | Accession & collect specimen | Bearer JWT |
| `PATCH`| `/api/laboratory/samples/:id/process` | Initiate analyzer processing run | Bearer JWT |
| `POST` | `/api/laboratory/orders/:id/report` | Sign & publish official lab report | Bearer JWT |

### 2.8 Pharmacy & Formulary (`/api/pharmacy`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/pharmacy/medicines` | Formulary drug catalog search | No |
| `GET` | `/api/pharmacy/inventory` | Real-time batch inventory & stock levels | No |
| `GET` | `/api/pharmacy/prescriptions` | Electronic prescription dispensing queue | No |
| `POST` | `/api/pharmacy/prescriptions` | Create new multi-item prescription | Bearer JWT |
| `PATCH`| `/api/pharmacy/prescriptions/:id/dispense`| Dispense drugs & decrement inventory | Bearer JWT |

### 2.9 Bed Management & Wards (`/api/beds`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/beds` | Bed occupancy matrix across all wards | No |
| `PATCH`| `/api/beds/:id/status` | Transition bed state (AVAILABLE/CLEANING/etc)| Bearer JWT |

### 2.10 Inpatient Admissions (`/api/admissions`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admissions` | List active inpatient admissions | No |
| `POST` | `/api/admissions` | Admit patient & allocate ward bed | Bearer JWT |
| `PATCH`| `/api/admissions/:id/discharge` | Discharge patient & free bed for cleaning | Bearer JWT |

### 2.11 Billing & Revenue (`/api/billing`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/billing/bills` | Search and list patient billing invoices | No |
| `POST` | `/api/billing/bills` | Generate itemized billing statement | Bearer JWT |
| `POST` | `/api/billing/payments` | Record payment transaction & receipt | Bearer JWT |

### 2.12 Analytics & Audit (`/api/analytics` & `/api/audit`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/dashboard` | Descriptive operational performance metrics | Bearer JWT |
| `GET` | `/api/audit` | Regulatory audit log query trail | Bearer JWT |
