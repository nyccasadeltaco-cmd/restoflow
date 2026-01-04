import { IsString, IsOptional, IsArray, IsBoolean, IsUrl, IsEnum } from 'class-validator';

export class CreateMarketingLinkDto {
  @IsOptional()
  @IsString()
  socialPostId?: string;

  @IsString()
  slug: string;

  @IsUrl()
  destinationUrl: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  utmSource?: string;

  @IsOptional()
  @IsString()
  utmMedium?: string;

  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @IsOptional()
  @IsString()
  utmTerm?: string;

  @IsOptional()
  @IsString()
  utmContent?: string;

  @IsOptional()
  @IsBoolean()
  generateQR?: boolean;
}

export class TrackLinkEventDto {
  @IsString()
  marketingLinkId: string;

  @IsEnum(['click', 'view_menu', 'add_to_cart', 'checkout_start', 'checkout_complete', 'order_placed', 'order_paid'])
  eventType: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  referrerUrl?: string;

  @IsOptional()
  @IsString()
  referrerPlatform?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
