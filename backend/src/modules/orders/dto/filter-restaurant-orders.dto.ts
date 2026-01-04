import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../entities/order.entity';

export class FilterRestaurantOrdersDto {
  @ApiProperty({
    description: 'Filter by order status',
    enum: OrderStatus,
    required: false,
    example: OrderStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({
    description: 'Start date filter (ISO 8601)',
    required: false,
    example: '2025-12-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiProperty({
    description: 'End date filter (ISO 8601)',
    required: false,
    example: '2025-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsString()
  to?: string;
}
