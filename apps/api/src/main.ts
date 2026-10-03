import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('HospitalOS-Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global API Prefix
  app.setGlobalPrefix('api');

  // CORS Configuration
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Swagger OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('HospitalOS REST API')
    .setDescription(
      'HospitalOS — Real-Time Hospital Operations & Patient Journey Management Platform API Documentation',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('digital-twin', 'Real-Time Operational State & Bottleneck Detection')
    .addTag('queues', 'Queue & Token Management')
    .addTag('patients', 'Patient Journey & Profiles')
    .addTag('appointments', 'Appointment Scheduling & Check-in')
    .addTag('encounters', 'Clinical Consultations & Diagnoses')
    .addTag('laboratory', 'Lab Orders, Sample Processing & Reports')
    .addTag('pharmacy', 'Medicines Inventory & Dispensing')
    .addTag('beds', 'Bed Capacity & Occupancy')
    .addTag('admissions', 'Inpatient Admissions & Discharges')
    .addTag('billing', 'Invoicing, Itemization & Payments')
    .addTag('analytics', 'Descriptive Operational Analytics')
    .addTag('auth', 'Authentication & Profile Management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`HospitalOS Backend API is running on: http://localhost:${port}/api`);
  logger.log(`Swagger OpenAPI Documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
