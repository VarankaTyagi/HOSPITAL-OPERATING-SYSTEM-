# HospitalOS — Digital Twin Architectural Specification

## 1. What is the HospitalOS Digital Twin?

In **HospitalOS**, the **Digital Twin** is defined strictly and intentionally as:

> **A real-time, deterministic, operational digital representation of the current physical state of the hospital.**

It is **NOT** speculative generative AI, probabilistic forecasting, or an offline simulation. It is a live software model continuously synchronized with real clinical and operational events taking place across the physical hospital facility.

---

## 2. Core Pillars of the Digital Twin

```text
    Physical Reality                   Backend Operational Core                     Real-Time Digital Twin
┌───────────────────────┐            ┌────────────────────────────┐            ┌──────────────────────────────┐
│  Patient Arrives      │──[REST]───▶│  PostgreSQL + Prisma       │──[Event]──▶│ Socket.IO Event Broadcaster   │
│  Bed Vacated / Cleaned│            │  (Atomic Transactions)     │            │ (Room-Based Synchronization) │
│  Doctor Calls Ticket  │            │  Audit & Event Log Tables  │            └──────────────┬───────────────┘
│  Lab Result Verified  │            └────────────────────────────┘                           │
│  Drug Dispensed       │                                                                     ▼
└───────────────────────┘                                                      ┌──────────────────────────────┐
                                                                               │ Unified Operational State    │
                                                                               │ - Bed Matrix Status          │
                                                                               │ - Active Queues & Tokens     │
                                                                               │ - Bottleneck Diagnostics     │
                                                                               │ - 10-Stage Patient Timelines │
                                                                               └──────────────────────────────┘
```

1. **Deterministic Accuracy**: State changes occur first in ACID PostgreSQL transactions managed by Prisma ORM.
2. **Event Sourcing & Auditability**: Every operational state transition generates an immutable `HospitalEvent` and `AuditLog` entry.
3. **Sub-Second Synchronization**: NestJS `EventsGateway` broadcasts state changes over WebSockets (`hospital-events` room) to all connected clients.
4. **Active Operational Bottleneck Detection**: Rule-based heuristic analyzers continuously evaluate occupancy, queue wait times, and specimen turnarounds to highlight friction points.

---

## 3. Digital Twin Entities & Operational States

### 3.1 Patient Operational Journey (10 Stages)
Each patient in HospitalOS transitions through 10 deterministic states backed by relational records:

1. **`REGISTERED`**: Demographics and Medical Record Number (MRN) generated.
2. **`APPOINTMENT_SCHEDULED`**: Slot assigned to a physician in a specific department.
3. **`CHECKED_IN`**: Physical arrival confirmed at kiosk or reception desk.
4. **`WAITING`**: Token queued in the department waiting room.
5. **`CALLED`**: Display board announces patient token to doctor consultation room.
6. **`IN_CONSULTATION`**: Clinical encounter opened, vital signs recorded, diagnosis logged.
7. **`LABORATORY`**: Diagnostic specimen accessioned, analyzed, and pathologist report published.
8. **`PHARMACY`**: Electronic prescription routed to dispensary, verified, and dispensed with inventory decrement.
9. **`BILLING`**: Items compiled into invoice, payment processed via receipt/gateway.
10. **`ADMITTED / DISCHARGED`**: Bed allocated in inpatient ward, rounds conducted, and discharge summary recorded.

### 3.2 Inpatient Bed Operational States
- **`AVAILABLE`**: Sanitized, inspected, and ready for patient admission.
- **`OCCUPIED`**: Inpatient assigned with active admission record.
- **`RESERVED`**: Allocated for upcoming surgical or emergency transfer.
- **`CLEANING`**: Patient discharged; housekeeping workflow active.
- **`MAINTENANCE`**: Mechanical, biomedical, or facilities repair underway.
- **`BLOCKED`**: Quarantined or unavailable due to clinical protocol.

### 3.3 Outpatient Queue Operational States
- **`TICKETS`**: Real-time tickets tracked with status (`WAITING`, `CALLED`, `IN_SERVICE`, `COMPLETED`, `SKIPPED`, `CANCELLED`).
- **`PRIORITY`**: Dynamic sorting by triage priority (`NORMAL`, `URGENT`, `EMERGENCY`).
- **`WAIT TIME`**: Estimated wait time computed as `waiting_count * average_consultation_time`.

### 3.4 Diagnostic Laboratory States
- **`ORDERED`**: Diagnostic test ordered by physician during encounter.
- **`SAMPLE_COLLECTED`**: Specimen drawn, barcoded, and accessioned by phlebotomist.
- **`PROCESSING`**: Specimen placed in automated hematology/biochemistry analyzer.
- **`REPORT_READY`**: Laboratory data entered and pending validation.
- **`COMPLETED`**: Pathologist electronic signature applied, findings synchronized with patient journey.

### 3.5 Pharmacy Inventory & Prescription States
- **`PENDING`**: Prescription issued by physician; waiting in dispensing queue.
- **`DISPENSED`**: Pharmacist verification complete; stock decremented from batch.
- **`STOCK ALERTS`**: Automated flag when `quantity <= reorderLevel`.

---

## 4. Rule-Based Bottleneck Detection Engine

The Digital Twin service includes a rule engine that inspects the hospital operational state on every synchronization loop:

| Metric | Threshold | Level | Digital Twin Diagnostic Message |
| :--- | :--- | :--- | :--- |
| **Bed Occupancy** | > 85% | `CRITICAL` | High occupancy alert. Bed management protocol required. |
| **Bed Occupancy** | > 75% | `WARNING` | Moderate occupancy. Prepare discharge clearances. |
| **Queue Congestion** | > 5 waiting patients | `WARNING` | Long queue in department. Reallocate triage staff. |
| **Diagnostic Backlog** | > 10 pending orders | `WARNING` | Laboratory throughput bottleneck detected. |
| **Inventory Depletion**| Stock <= Reorder level | `CRITICAL` | Low inventory alert on essential pharmaceutical batches. |

---

## 5. WebSocket Event Topology

HospitalOS utilizes a structured Socket.IO event schema:

- **Namespace**: `/events`
- **Room**: `hospital-events`
- **Payload Event Types**:
  - `DIGITAL_TWIN_UPDATE`: Full state delta broadcast to Command Center.
  - `QUEUE_TICKET_CALLED`: Targeted token call for hallway announcement screens.
  - `BED_STATUS_CHANGED`: Ward matrix sync for nursing and housekeeping.
  - `LAB_REPORT_COMPLETED`: Real-time notification to ordering physician.
  - `PRESCRIPTION_DISPENSED`: Real-time notification to patient and billing.
