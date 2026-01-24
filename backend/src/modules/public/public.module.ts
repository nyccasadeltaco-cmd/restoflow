import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicTenantsController } from './public-tenants.controller';
import { PublicMenuController } from './public-menu.controller';
import { PublicOrdersController } from './public-orders.controller';
import { PublicRestaurantsController } from './public_restaurants.controller';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Menu } from '../menus/entities/menu.entity';
import { MenuItem } from '../menus/entities/menu-item.entity';
import { MenuCategory } from '../menus/entities/menu-category.entity';
import { FeaturedSection } from '../featured/entities/featured-section.entity';
import { FeaturedItem } from '../featured/entities/featured-item.entity';
import { Combo } from '../featured/entities/combo.entity';
import { ComboItem } from '../featured/entities/combo-item.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tenant,
      Restaurant,
      Menu,
      MenuItem,
      MenuCategory,
      FeaturedSection,
      FeaturedItem,
      Combo,
      ComboItem,
      Order,
      OrderItem,
    ]),
  ],
  controllers: [
    PublicTenantsController,
    PublicMenuController,
    PublicOrdersController,
    PublicRestaurantsController,
  ],
})
export class PublicModule {}
