import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevController } from './dev.controller';
import { User } from '../users/entities/user.entity';
import { TenantUser } from '../tenants/entities/tenant_user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, TenantUser])],
  controllers: [DevController],
})
export class DevModule {}
