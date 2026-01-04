import { IsString, IsOptional, IsEnum, IsArray, IsObject, IsDateString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class PromptContextDto {
  @IsOptional()
  @IsString()
  product?: string;

  @IsOptional()
  @IsString()
  offer?: string;

  @IsOptional()
  @IsString()
  objective?: string;

  @IsOptional()
  @IsEnum(['formal', 'casual', 'urban', 'humor', 'premium', 'friendly'])
  tone?: string;

  @IsOptional()
  @IsEnum(['es', 'en'])
  language?: string;

  @IsOptional()
  @IsEnum(['order_now', 'pickup', 'delivery', 'book', 'visit', 'call'])
  ctaType?: string;

  @IsOptional()
  @IsObject()
  additional?: Record<string, any>;
}

export class CreateSocialPostDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaTypes?: string[];

  @IsOptional()
  @Type(() => PromptContextDto)
  promptContext?: PromptContextDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  platforms?: string[];
}

export class UpdateSocialPostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];

  @IsOptional()
  @IsString()
  selectedCaption?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedHashtags?: string[];

  @IsOptional()
  @IsString()
  selectedCta?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  platforms?: string[];

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

export class GenerateContentDto {
  @IsOptional()
  @Type(() => PromptContextDto)
  promptContext?: PromptContextDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  platforms?: string[];
}

export class PublishPostDto {
  @IsArray()
  @IsString({ each: true })
  platforms: string[];

  @IsOptional()
  @IsBoolean()
  scheduleNow?: boolean;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
