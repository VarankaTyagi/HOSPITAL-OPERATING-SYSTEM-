import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { DigitalTwinModule } from './modules/digital-twin/digital-twin.module';
import { QueuesModule } from './modules/queues/queues.module';
import { PatientsModule } from './modules/patients/patients.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { EncountersModule } from './modules/encounters/encounters.module';
import { LaboratoryModule } from './modules/laboratory/laboratory.module';
import { PharmacyModule } from './modules/pharmacy/pharmacy.module';
import { BedsModule } from './modules/beds/beds.module';
import { AdmissionsModule } from './modules/admissions/admissions.module';
import { BillingModule } from './modules/billing/billing.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuditModule } from './modules/audit/audit.module';
import { EventsGateway } from './gateways/events.gateway';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    DigitalTwinModule,
    QueuesModule,
    PatientsModule,
    AppointmentsModule,
    EncountersModule,
    LaboratoryModule,
    PharmacyModule,
    BedsModule,
    AdmissionsModule,
    BillingModule,
    DepartmentsModule,
    DoctorsModule,
    ResourcesModule,
    NotificationsModule,
    AnalyticsModule,
    AuditModule,
  ],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class AppModule {}
