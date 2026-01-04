import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SubscriptionStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  HOLD = 'HOLD',
  CANCELED = 'CANCELED',
}

export class UpdateSubscriptionDto {
  @ApiProperty({
    description: 'Estado de la suscripción',
    enum: SubscriptionStatus,
  })
  @IsEnum(SubscriptionStatus)
  subscriptionStatus: SubscriptionStatus;

  @ApiPropertyOptional({ description: 'Plan de suscripción', maxLength: 50 })
  @IsOptional()
  @IsString()
  subscriptionPlan?: string;

  @ApiPropertyOptional({ description: 'Fecha de inicio de suscripción' })
  @IsOptional()
  @IsDateString()
  subscriptionStartedAt?: Date;

  @ApiPropertyOptional({ description: 'Fecha de renovación de suscripción' })
  @IsOptional()
  @IsDateString()
  subscriptionRenewsAt?: Date;

  @ApiPropertyOptional({ description: 'Razón de suspensión (requerido si status es HOLD)' })
  @IsOptional()
  @IsString()
  holdReason?: string;
}
