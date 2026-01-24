import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { FeaturedItemType } from '../entities/featured-item.entity';

export class CreateFeaturedItemDto {
  @ApiProperty({ example: 'daily' })
  @IsString()
  sectionKey: string;

  @ApiProperty({ enum: FeaturedItemType, example: FeaturedItemType.MENU_ITEM })
  @IsEnum(FeaturedItemType)
  type: FeaturedItemType;

  @ApiProperty({ required: false, example: 'uuid-menu-item' })
  @IsOptional()
  @IsString()
  refId?: string;

  @ApiProperty({ required: false, example: 'Plato del dia' })
  @IsOptional()
  @IsString()
  titleOverride?: string;

  @ApiProperty({ required: false, example: 'Descripcion corta' })
  @IsOptional()
  @IsString()
  subtitleOverride?: string;

  @ApiProperty({ required: false, example: 'https://...' })
  @IsOptional()
  @IsString()
  imageUrlOverride?: string;

  @ApiProperty({ required: false, example: 14.99 })
  @IsOptional()
  @IsNumber()
  priceOverride?: number;

  @ApiProperty({ required: false, example: 'Order' })
  @IsOptional()
  @IsString()
  ctaLabel?: string;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false, example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiProperty({ required: false, example: '2025-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiProperty({ required: false, example: '2025-01-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  endsAt?: string;
}

export class UpdateFeaturedItemDto {
  @ApiProperty({ required: false, example: 'daily' })
  @IsOptional()
  @IsString()
  sectionKey?: string;

  @ApiProperty({ enum: FeaturedItemType, required: false })
  @IsOptional()
  @IsEnum(FeaturedItemType)
  type?: FeaturedItemType;

  @ApiProperty({ required: false, example: 'uuid-menu-item' })
  @IsOptional()
  @IsString()
  refId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  titleOverride?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subtitleOverride?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imageUrlOverride?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  priceOverride?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ctaLabel?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endsAt?: string;
}
