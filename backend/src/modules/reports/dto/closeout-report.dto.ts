import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CloseoutReportQueryDto {
  @ApiProperty({
    description: 'Restaurant ID',
    example: '471747fe-6f25-4273-96bb-b2d41ea12d32',
  })
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({
    description: 'Range start (inclusive), ISO8601',
    example: '2026-02-23T00:00:00.000Z',
  })
  @IsDateString()
  from: string;

  @ApiProperty({
    description: 'Range end (exclusive), ISO8601',
    example: '2026-02-24T00:00:00.000Z',
  })
  @IsDateString()
  to: string;
}

export class CloseoutPaymentsByTypeDto {
  @ApiProperty({ example: 120.5 })
  card: number;

  @ApiProperty({ example: 42.0 })
  cash: number;

  @ApiProperty({ example: 0 })
  other: number;
}

export class CloseoutTipsByEmployeeDto {
  @ApiProperty({ example: '570fb959-0b8c-4490-a246-fb23d39ec846' })
  employeeId: string;

  @ApiProperty({ example: 'Kitchen Staff' })
  employeeName: string;

  @ApiProperty({ example: 18.25 })
  tips: number;
}

export class CloseoutReportDto {
  @ApiProperty({ example: '471747fe-6f25-4273-96bb-b2d41ea12d32' })
  restaurantId: string;

  @ApiProperty({ example: 'Casa Del Taco NYC' })
  restaurantName: string;

  @ApiProperty({ example: '2026-02-23T00:00:00.000Z' })
  from: string;

  @ApiProperty({ example: '2026-02-24T00:00:00.000Z' })
  to: string;

  @ApiProperty({ example: '2026-02-23T21:44:00.000Z' })
  generatedAt: string;

  @ApiProperty({ example: 24 })
  ordersCount: number;

  @ApiProperty({ example: 420.0 })
  grossSales: number;

  @ApiProperty({ example: 0 })
  discounts: number;

  @ApiProperty({ example: 420.0 })
  netSales: number;

  @ApiProperty({ example: 36.75 })
  taxes: number;

  @ApiProperty({ example: 24.5 })
  tips: number;

  @ApiProperty({ example: 481.25 })
  totalCollected: number;

  @ApiProperty({ type: () => CloseoutPaymentsByTypeDto })
  paymentsByType: CloseoutPaymentsByTypeDto;

  @ApiProperty({
    type: () => [CloseoutTipsByEmployeeDto],
    required: false,
    description: 'Included only when staff-level tip allocation is available',
  })
  tipsByEmployee?: CloseoutTipsByEmployeeDto[];

  @ApiProperty({
    type: [String],
    example: ['Includes Restoflow orders only.', 'External platform sales not included.'],
  })
  disclaimers: string[];
}
