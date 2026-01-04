import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OrderSource } from '../entities/order.entity';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'Menu item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  menuItemId: string;

  @ApiProperty({
    description: 'Quantity',
    example: 2,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Special instructions for this item',
    required: false,
    example: 'Sin cebolla',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Item modifiers (extras, customizations)',
    required: false,
    example: { extras: ['queso', 'aguacate'], size: 'grande' },
  })
  @IsOptional()
  modifiers?: any;
}

export class CreatePublicOrderDto {
  @ApiProperty({
    description: 'Restaurant slug or ID',
    example: 'super-tacos',
  })
  @IsNotEmpty()
  @IsString()
  restaurantSlug: string;

  @ApiProperty({
    description: 'Order source',
    enum: OrderSource,
    example: OrderSource.LINK,
  })
  @IsNotEmpty()
  @IsEnum(OrderSource)
  source: OrderSource;

  @ApiProperty({
    description: 'Customer name',
    required: false,
    example: 'Juan Pérez',
  })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({
    description: 'Customer phone',
    required: false,
    example: '8091234567',
  })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiProperty({
    description: 'Order items',
    type: [CreateOrderItemDto],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiProperty({
    description: 'General order notes',
    required: false,
    example: 'Entregar en la puerta',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Tip amount',
    required: false,
    example: 5.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tipAmount?: number;

  @ApiProperty({
    description: 'Table ID (for ON_SITE orders)',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  tableId?: string;
}
