import { Module } from '@nestjs/common';
import { TenantTestController } from './tenant_test.controller';

@Module({
  controllers: [TenantTestController],
})
export class TenantTestModule {}
