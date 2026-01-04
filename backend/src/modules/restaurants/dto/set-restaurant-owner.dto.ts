import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SetRestaurantOwnerDto {
  @ApiProperty({
    description: 'Nombre completo del dueño del restaurante',
    example: 'Juan Pérez García',
  })
  @IsString()
  @MinLength(3)
  fullName: string;

  @ApiProperty({
    description: 'Email del dueño (será usado para login)',
    example: 'juan.perez@restaurant.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Contraseña (si no se proporciona, se genera una temporal)',
    example: 'SecurePass123!',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto del dueño',
    example: '+52 55 1234 5678',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
