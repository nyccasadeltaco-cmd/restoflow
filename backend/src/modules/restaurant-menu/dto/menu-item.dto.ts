import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'uuid-categoria' })
  @IsString()
  categoryId: string;

  @ApiProperty({ example: 'Tacos al Pastor' })
  @IsString()
  name: string;

  @ApiProperty({ required: false, example: 'Deliciosos tacos con piña y cilantro' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 45.50 })
  @IsNumber()
  price: number;

  @ApiProperty({ required: false, example: 'https://example.com/tacos.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false, example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiProperty({ required: false, example: ['gluten', 'lactosa'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];

  @ApiProperty({ required: false, example: ['picante', 'popular'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false, example: 15 })
  @IsOptional()
  @IsInt()
  @Min(0)
  preparationTime?: number;
}

export class UpdateMenuItemDto {
  @ApiProperty({ required: false, example: 'uuid-categoria' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ required: false, example: 'Tacos al Pastor' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, example: 'Deliciosos tacos con piña y cilantro' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, example: 45.50 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ required: false, example: 'https://example.com/tacos.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false, example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiProperty({ required: false, example: ['gluten', 'lactosa'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];

  @ApiProperty({ required: false, example: ['picante', 'popular'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false, example: 15 })
  @IsOptional()
  @IsInt()
  @Min(0)
  preparationTime?: number;
}
