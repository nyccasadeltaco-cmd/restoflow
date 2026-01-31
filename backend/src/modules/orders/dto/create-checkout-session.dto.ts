import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreatePublicOrderDto } from './create-public-order.dto';

export class CreateCheckoutSessionDto extends CreatePublicOrderDto {
  @ApiPropertyOptional({
    description: 'Success URL override',
    example: 'https://restoflow.com/r/super-tacos/success/123',
  })
  @IsOptional()
  @IsString()
  successUrl?: string;

  @ApiPropertyOptional({
    description: 'Cancel URL override',
    example: 'https://restoflow.com/r/super-tacos/cart',
  })
  @IsOptional()
  @IsString()
  cancelUrl?: string;

  @ApiPropertyOptional({
    description: 'Base URL to build success/cancel URLs',
    example: 'https://restoflow.com',
  })
  @IsOptional()
  @IsString()
  returnUrl?: string;
}
