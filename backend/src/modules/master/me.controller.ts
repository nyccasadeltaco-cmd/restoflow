import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class MeController {
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  me(@Req() req: any) {
    return {
      user: { id: req.user.id, email: req.user.email },
      role: req.user.role,
      tenantId: req.user.tenantId,
      tenantSlug: req.user.tenantSlug,
    };
  }
}
