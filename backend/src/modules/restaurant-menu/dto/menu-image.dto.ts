import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class MenuImageUploadDto {
  @ApiProperty({ example: 'tacos.jpg' })
  @IsString()
  fileName: string;

  @ApiProperty({ example: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...' })
  @IsString()
  imageBase64: string;

  @ApiProperty({ required: false, example: 'uuid-item' })
  @IsOptional()
  @IsString()
  itemId?: string;
}
