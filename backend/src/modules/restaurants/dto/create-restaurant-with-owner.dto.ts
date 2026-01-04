import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  Length,
  Min,
  Max,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRestaurantWithOwnerDto {
  // Datos del restaurante
  @ApiProperty({ description: 'Nombre del restaurante', maxLength: 150 })
  @IsString()
  @Length(1, 150)
  name: string;

  @ApiPropertyOptional({ description: 'Slug único del restaurante', maxLength: 150 })
  @IsOptional()
  @IsString()
  @Length(1, 150)
  slug?: string;

  @ApiPropertyOptional({ description: 'Email del restaurante', maxLength: 150 })
  @IsOptional()
  @IsEmail()
  @Length(1, 150)
  email?: string;

  @ApiPropertyOptional({ description: 'Teléfono del restaurante', maxLength: 50 })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  phone?: string;

  @ApiPropertyOptional({ description: 'Plan de suscripción (FREE, BASIC, PREMIUM)', maxLength: 50 })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  subscriptionPlan?: string;

  @ApiPropertyOptional({ description: 'Estado de suscripción (TRIAL, ACTIVE, HOLD, CANCELED)', maxLength: 30 })
  @IsOptional()
  @IsString()
  @Length(1, 30)
  subscriptionStatus?: string;

  @ApiPropertyOptional({ description: 'Modo de cobro de comisión de tarjeta (CLIENT, RESTAURANT)', maxLength: 20 })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  cardFeeMode?: string;

  @ApiPropertyOptional({ description: 'Porcentaje de comisión de tarjeta', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  cardFeePercent?: number;

  @ApiPropertyOptional({ description: 'Porcentaje de comisión de plataforma', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  platformFeePercent?: number;

  @ApiPropertyOptional({ description: 'Moneda', maxLength: 10 })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  currency?: string;

  @ApiPropertyOptional({ description: 'Zona horaria', maxLength: 80 })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  timezone?: string;

  // Branding
  @ApiPropertyOptional({ description: 'URL del logo del restaurante' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'URL del banner del restaurante' })
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiPropertyOptional({ description: 'Color primario (formato hex: #FF5733)', maxLength: 7 })
  @IsOptional()
  @IsString()
  @Length(4, 7)
  primaryColor?: string;

  @ApiPropertyOptional({ description: 'Color secundario (formato hex: #33A1FF)', maxLength: 7 })
  @IsOptional()
  @IsString()
  @Length(4, 7)
  secondaryColor?: string;

  @ApiPropertyOptional({ description: 'Color de acento (formato hex: #FFD700)', maxLength: 7 })
  @IsOptional()
  @IsString()
  @Length(4, 7)
  accentColor?: string;

  @ApiPropertyOptional({
    description:
      'Branding extendido (background/surface/textPrimary/textSecondary/success)',
    type: Object,
  })
  @IsOptional()
  @IsObject()
  branding?: Record<string, string>;

  // Datos del dueño
  @ApiProperty({ description: 'Nombre completo del dueño', maxLength: 200 })
  @IsString()
  @Length(1, 200)
  ownerFullName: string;

  @ApiProperty({ description: 'Email del dueño (será su usuario de acceso)' })
  @IsEmail()
  ownerEmail: string;

  @ApiPropertyOptional({ description: 'Contraseña temporal del dueño. Si no se envía, se genera automáticamente', minLength: 8 })
  @IsOptional()
  @IsString()
  @Length(8, 100)
  ownerPassword?: string;

  @ApiPropertyOptional({ description: 'Teléfono del dueño', maxLength: 50 })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  ownerPhone?: string;
}
