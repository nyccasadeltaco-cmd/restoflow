import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { Tenant } from './entities/tenant.entity';
import { TenantDomain } from './entities/tenant_domain.entity';
import { PublicTenantController } from './public-tenant.controller';
import { Restaurant } from '../restaurants/entities/restaurant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, TenantDomain, Restaurant])],
  controllers: [TenantsController, PublicTenantController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
