import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdateAdminPasswordDto {
  @ApiProperty({
    description: 'Nueva contraseña para el administrador del restaurante',
    example: 'newSecurePassword123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  newPassword: string;
}
