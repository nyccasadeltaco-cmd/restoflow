import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantMenuController } from './restaurant-menu.controller';
import { RestaurantMenuService } from './restaurant-menu.service';
import { MenuConvertController } from './menu-convert.controller';
import { MenuConvertService } from './menu-convert.service';
import { Menu } from '../menus/entities/menu.entity';
import { MenuCategory } from '../menus/entities/menu-category.entity';
import { MenuItem } from '../menus/entities/menu-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, MenuCategory, MenuItem])],
  controllers: [RestaurantMenuController, MenuConvertController],
  providers: [RestaurantMenuService, MenuConvertService],
  exports: [RestaurantMenuService],
})
export class RestaurantMenuModule {}
