import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { StripeService } from './stripe.service';
import { RestaurantOrdersController } from './restaurant-orders.controller';
import { PublicOrdersController } from './public-orders.controller';
import { PublicStripeController } from './public-stripe.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { MenuItem } from '../menus/entities/menu-item.entity';
import { Menu } from '../menus/entities/menu.entity';
import { MenuCategory } from '../menus/entities/menu-category.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Combo } from '../featured/entities/combo.entity';
import { ComboItem } from '../featured/entities/combo-item.entity';
import { TwilioNotificationService } from './twilio-notification.service';
import { OrderNotification } from './entities/order-notification.entity';
import { OrderNotificationsService } from './order-notifications.service';
import { TwilioWebhookController } from './twilio-webhook.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      MenuItem,
      Menu,
      MenuCategory,
      Restaurant,
      Combo,
      ComboItem,
      OrderNotification,
    ]),
  ],
  controllers: [
    RestaurantOrdersController,
    PublicOrdersController,
    PublicStripeController,
    TwilioWebhookController,
  ],
  providers: [
    OrdersService,
    StripeService,
    TwilioNotificationService,
    OrderNotificationsService,
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
