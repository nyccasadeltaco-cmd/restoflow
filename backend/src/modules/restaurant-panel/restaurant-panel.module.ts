import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantPanelController } from './restaurant-panel.controller';
import { PublicRestaurantController } from './public-restaurant.controller';
import { RestaurantPanelService } from './restaurant-panel.service';
import { User } from '../users/entities/user.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Restaurant])],
  controllers: [RestaurantPanelController, PublicRestaurantController],
  providers: [RestaurantPanelService],
  exports: [RestaurantPanelService],
})
export class RestaurantPanelModule {}
