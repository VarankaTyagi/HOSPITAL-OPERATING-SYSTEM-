import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PharmacyService } from './pharmacy.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrescriptionStatus, InventoryStatus } from '../../generated/client/enums';

@ApiTags('pharmacy')
@Controller('pharmacy')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Get('medicines')
  @ApiOperation({ summary: 'List medicines catalog with search and category filters' })
  async findAllMedicines(
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.pharmacyService.findAllMedicines({ search, category });
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Get current pharmacy inventory and stock levels' })
  async getInventory(@Query('status') status?: InventoryStatus) {
    return this.pharmacyService.getInventory(status);
  }

  @Get('prescriptions')
  @ApiOperation({ summary: 'List prescriptions' })
  async getPrescriptions(
    @Query('status') status?: PrescriptionStatus,
    @Query('patientId') patientId?: string,
  ) {
    return this.pharmacyService.getPrescriptions({ status, patientId });
  }

  @Post('prescriptions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate digital prescription for a patient' })
  async createPrescription(
    @Body()
    body: {
      patientId: string;
      doctorId: string;
      encounterId?: string;
      notes?: string;
      items: Array<{
        medicineId: string;
        medicineName: string;
        dosage: string;
        frequency: string;
        durationDays: number;
        quantity: number;
        instructions?: string;
      }>;
    },
  ) {
    return this.pharmacyService.createPrescription(body);
  }

  @Patch('prescriptions/:id/dispense')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dispense medicines and deduct inventory stocks' })
  async dispensePrescription(
    @Param('id') prescriptionId: string,
    @Body('dispensedBy') dispensedBy: string,
  ) {
    return this.pharmacyService.dispensePrescription(prescriptionId, dispensedBy);
  }
}
