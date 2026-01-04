import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import {
  SocialConnection,
  SocialPost,
  SocialPostPublication,
  MarketingLink,
  LinkEvent,
} from './entities';
import { SocialMediaController } from './social-media.controller';
import { SocialMediaService } from './services/social-media.service';
import { AIContentService } from './services/ai-content.service';
import { LinkTrackingService } from './services/link-tracking.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      SocialConnection,
      SocialPost,
      SocialPostPublication,
      MarketingLink,
      LinkEvent,
    ]),
  ],
  controllers: [SocialMediaController],
  providers: [
    SocialMediaService,
    AIContentService,
    LinkTrackingService,
  ],
  exports: [
    SocialMediaService,
    AIContentService,
    LinkTrackingService,
  ],
})
export class SocialMediaModule {}
