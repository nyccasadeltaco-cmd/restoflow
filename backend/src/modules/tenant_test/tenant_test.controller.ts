import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TenantCtx } from '../../common/decorators/tenant.decorator';

@Controller('r/:slug')
@UseGuards(AuthGuard('jwt'))
export class TenantTestController {
  @Get('whoami')
  whoami(@TenantCtx() tenant: any) {
    return { ok: true, tenant };
  }
}
