import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OperatingHoursDto } from './operating-hours.dto';

export class BrandingDto {
  @ApiProperty({ required: false, example: '#E65227' })
  @IsOptional()
  @IsString()
  primary?: string;

  @ApiProperty({ required: false, example: '#0B0B0B' })
  @IsOptional()
  @IsString()
  secondary?: string;

  @ApiProperty({ required: false, example: '#FFC107' })
  @IsOptional()
  @IsString()
  accent?: string;

  @ApiProperty({ required: false, example: '#F7F7F5' })
  @IsOptional()
  @IsString()
  background?: string;

  @ApiProperty({ required: false, example: '#FFFFFF' })
  @IsOptional()
  @IsString()
  surface?: string;

  @ApiProperty({ required: false, example: '#111111' })
  @IsOptional()
  @IsString()
  textPrimary?: string;

  @ApiProperty({ required: false, example: '#6B6B6B' })
  @IsOptional()
  @IsString()
  textSecondary?: string;

  @ApiProperty({ required: false, example: '#25D366' })
  @IsOptional()
  @IsString()
  success?: string;
}

export class UpdateRestaurantSettingsDto {
  @ApiProperty({ required: false, example: 'Super Tacos' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, example: 'Super Tacos S.A. de C.V.' })
  @IsOptional()
  @IsString()
  legalName?: string;

  @ApiProperty({ required: false, example: 'contacto@supertacos.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false, example: '+52 55 1234 5678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false, example: 'Av. Insurgentes 123' })
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @ApiProperty({ required: false, example: 'Col. Roma Norte' })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ required: false, example: 'Ciudad de México' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false, example: 'CDMX' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ required: false, example: 'México' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false, example: '06700' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ required: false, example: 'America/Mexico_City' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ required: false, example: 'MXN' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    required: false,
    enum: ['NONE', 'CLIENT', 'RESTAURANT', 'MIXED'],
    example: 'CLIENT',
  })
  @IsOptional()
  @IsEnum(['NONE', 'CLIENT', 'RESTAURANT', 'MIXED'])
  cardFeeMode?: string;

  @ApiProperty({ required: false, example: 3.5, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  cardFeePercent?: number;

  @ApiProperty({ required: false, example: 0, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cardFeeFixed?: number;

  @ApiProperty({ required: false, example: 5, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  platformFeePercent?: number;

  @ApiProperty({ 
    required: false, 
    type: OperatingHoursDto,
    description: 'Horarios de operación del restaurante por día de la semana',
    example: {
      monday: { open: '09:00', close: '22:00' },
      tuesday: { open: '09:00', close: '22:00' },
      wednesday: { open: '09:00', close: '22:00' },
      thursday: { open: '09:00', close: '22:00' },
      friday: { open: '09:00', close: '23:00' },
      saturday: { open: '10:00', close: '23:00' },
      sunday: { closed: true }
    }
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => OperatingHoursDto)
  operatingHours?: OperatingHoursDto;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false, type: BrandingDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BrandingDto)
  branding?: BrandingDto;
}
