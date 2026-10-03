# HospitalOS — Real-Time WebSocket & Event Synchronization

## 1. Overview

HospitalOS provides sub-second event-driven state propagation across clinical workstations using **Socket.IO** running on the NestJS backend and consumed via `socket.io-client` on the Next.js frontend.

---

## 2. Gateway Architecture

The NestJS `EventsGateway` is hosted under the `/events` namespace with CORS origins configured to accept connections from the web frontend:

```typescript
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/events',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Broadcasts event to the hospital-wide room
  broadcast(event: string, data: any) {
    this.server.to('hospital-events').emit(event, data);
  }
}
```

---

## 3. Real-Time Rooms & Channel Subscriptions

Clients subscribe to channel rooms upon connection:

1. **`hospital-events`**: Hospital-wide operational events (Command Center, Digital Twin layout, queue alerts).
2. **`user:<userId>`**: Targeted notifications (e.g. appointment updates, test result readiness, prescription ready alerts).
3. **`department:<deptId>`**: Department-level work queues and ticket displays.

---

## 4. Operational Event Types

| Event Name | Producer | Consumer | Action |
| :--- | :--- | :--- | :--- |
| `hospital:event` | Any backend service | Digital Twin, Command Center | Adds real-time entry to event stream. |
| `digital-twin:sync` | Backend cron / state change | Digital Twin View | Full state delta refresh without reload. |
| `queue:token_called`| Doctor Consultation / Queue Module | Reception, Waiting Room Display | Flashes token, plays chime, updates ticket status. |
| `bed:status_changed`| Nurse Station / Admissions | Command Center, Ward Board | Re-renders bed matrix color (Available, Occupied, Cleaning). |
| `lab:report_ready` | Laboratory Module | Doctor Workstation, Patient Portal | Notifies physician that diagnostic results are available. |
| `pharmacy:dispensed`| Pharmacy Dispensary | Patient Portal, Billing | Notifies patient that medication is ready for pickup. |
