import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeaturedSection } from './entities/featured-section.entity';
import { FeaturedItem } from './entities/featured-item.entity';
import { Combo } from './entities/combo.entity';
import { ComboItem } from './entities/combo-item.entity';
import { FeaturedService } from './featured.service';
import { FeaturedController, CombosController } from './featured.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FeaturedSection, FeaturedItem, Combo, ComboItem])],
  providers: [FeaturedService],
  controllers: [FeaturedController, CombosController],
  exports: [FeaturedService],
})
export class FeaturedModule {}
