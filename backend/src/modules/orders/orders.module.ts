import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { RestaurantOrdersController } from './restaurant-orders.controller';
import { PublicOrdersController } from './public-orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { MenuItem } from '../menus/entities/menu-item.entity';
import { Menu } from '../menus/entities/menu.entity';
import { MenuCategory } from '../menus/entities/menu-category.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, MenuItem, Menu, MenuCategory, Restaurant]),
  ],
  controllers: [
    RestaurantOrdersController,
    PublicOrdersController,
  ],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
