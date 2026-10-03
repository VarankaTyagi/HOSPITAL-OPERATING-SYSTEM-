import { IsEmail, IsNotEmpty, IsEnum, MinLength, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../generated/client/enums';

export class RegisterDto {
  @ApiProperty({ example: 'patient@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Secret123!' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ enum: UserRole, default: UserRole.PATIENT })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ example: '+1-555-0199' })
  @IsOptional()
  @IsString()
  phone?: string;
}
