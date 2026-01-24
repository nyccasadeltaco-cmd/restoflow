import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateComboItemDto {
  @ApiProperty({ example: 'uuid-menu-item' })
  @IsString()
  menuItemId: string;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;

  @ApiProperty({ required: false, example: 'Choose meats' })
  @IsOptional()
  @IsString()
  groupKey?: string;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  minSelect?: number;

  @ApiProperty({ required: false, example: 3 })
  @IsOptional()
  @IsInt()
  maxSelect?: number;

  @ApiProperty({ required: false, example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateComboItemDto {
  @ApiProperty({ required: false, example: 'uuid-menu-item' })
  @IsOptional()
  @IsString()
  menuItemId?: string;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;

  @ApiProperty({ required: false, example: 'Choose meats' })
  @IsOptional()
  @IsString()
  groupKey?: string;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  minSelect?: number;

  @ApiProperty({ required: false, example: 3 })
  @IsOptional()
  @IsInt()
  maxSelect?: number;

  @ApiProperty({ required: false, example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
