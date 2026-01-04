import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  Length,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRestaurantDto {
  @ApiProperty({ description: 'Nombre del restaurante', maxLength: 150 })
  @IsString()
  @Length(1, 150)
  name: string;

  @ApiPropertyOptional({ description: 'Slug único del restaurante', maxLength: 150 })
  @IsOptional()
  @IsString()
  @Length(1, 150)
  slug?: string;

  @ApiPropertyOptional({ description: 'Nombre legal del restaurante', maxLength: 200 })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  legalName?: string;

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

  @ApiPropertyOptional({ description: 'Dirección línea 1', maxLength: 200 })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  addressLine1?: string;

  @ApiPropertyOptional({ description: 'Dirección línea 2', maxLength: 200 })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  addressLine2?: string;

  @ApiPropertyOptional({ description: 'Ciudad', maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  city?: string;

  @ApiPropertyOptional({ description: 'Estado/Provincia', maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  state?: string;

  @ApiPropertyOptional({ description: 'País', maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  country?: string;

  @ApiPropertyOptional({ description: 'Código postal', maxLength: 20 })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Zona horaria', maxLength: 80 })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  timezone?: string;

  @ApiPropertyOptional({ description: 'Moneda', maxLength: 10 })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  currency?: string;

  @ApiPropertyOptional({ description: 'UUID del usuario propietario' })
  @IsOptional()
  @IsUUID()
  ownerUserId?: string;

  @ApiPropertyOptional({ description: 'URL del logo' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'URL del banner' })
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiPropertyOptional({ description: 'Color primario', maxLength: 10 })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  primaryColor?: string;

  @ApiPropertyOptional({ description: 'Color secundario', maxLength: 10 })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  secondaryColor?: string;

  @ApiPropertyOptional({ description: 'Color de acento', maxLength: 10 })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  accentColor?: string;

  @ApiPropertyOptional({
    description:
      'Branding extendido (background/surface/textPrimary/textSecondary/success)',
    type: Object,
  })
  @IsOptional()
  @IsObject()
  branding?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Plan de suscripción', maxLength: 50 })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  subscriptionPlan?: string;

  @ApiPropertyOptional({ description: 'Estado activo', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
