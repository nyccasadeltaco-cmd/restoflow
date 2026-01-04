import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { TenantTestModule } from './modules/tenant_test/tenant_test.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

// Config
import { ConfigModule as AppConfigModule } from './config/config.module';
import { ormConfig } from './config/ormconfig';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { MeController } from './modules/master/me.controller';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { PublicModule } from './modules/public/public.module';
import { MenusModule } from './modules/menus/menus.module';
import { TablesModule } from './modules/tables/tables.module';
import { OrdersModule } from './modules/orders/orders.module';
import { BillingModule } from './modules/billing/billing.module';
import { StatsModule } from './modules/stats/stats.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { RestaurantPanelModule } from './modules/restaurant-panel/restaurant-panel.module';
import { RestaurantMenuModule } from './modules/restaurant-menu/restaurant-menu.module';
import { SocialMediaModule } from './modules/social-media/social-media.module';
import { AiModule } from './modules/ai/ai.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: require('path').join(process.cwd(), 'backend/.env'),
    }),
    
    // Database
    TypeOrmModule.forRootAsync({
      useFactory: ormConfig,
    }),

    // App Config
    AppConfigModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    TenantsModule,
    RestaurantsModule,
    MenusModule,
    TablesModule,
    OrdersModule,
    BillingModule,
    StatsModule,
    NotificationsModule,
    RestaurantPanelModule,
    RestaurantMenuModule,
    SocialMediaModule,
    AiModule,
    TenantTestModule,
    PublicModule,
    // Seed master admin
    require('./modules/seed/seed.module').SeedModule,
    // Dev tools (temporal)
    ...(process.env.NODE_ENV !== 'production'
      ? [require('./modules/dev/dev.module').DevModule]
      : []),
  ],
  controllers: [MeController, HealthController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: 'r/:slug/*', method: RequestMethod.ALL });
  }
}
