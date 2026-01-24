import { IsBoolean, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertFeaturedSectionDto {
  @ApiProperty({ example: 'favorites' })
  @IsString()
  @Length(1, 64)
  key: string;

  @ApiProperty({ example: 'Favoritos de la Casa' })
  @IsString()
  @Length(1, 120)
  title: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
