import {
  Body,
  BadRequestException,
  Controller,
  ForbiddenException,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { MenuConvertService } from './menu-convert.service';

@ApiTags('Restaurant Menu')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.RESTAURANT_ADMIN, UserRole.STAFF)
@Controller('tenants/:tenantId/menu')
export class MenuConvertController {
  constructor(private readonly svc: MenuConvertService) {}

  @Post('convert')
  @ApiOperation({
    summary: 'Convertir brochure (PDF) a menu JSON',
    description:
      'Extrae texto desde PDF y genera un draft en formato restoflow-menu-v1.',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  async convert(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @UploadedFile() file?: any,
  ) {
    if (!file) {
      throw new BadRequestException('file is required');
    }

    const userTenantId = req?.user?.tenantId;
    if (!userTenantId || userTenantId !== tenantId) {
      throw new ForbiddenException('Not allowed for this tenant');
    }

    return this.svc.convertToJson({ tenantId, file });
  }

  @Post('import')
  @ApiOperation({
    summary: 'Importar menu draft validado',
    description:
      'Importa el JSON revisado llamando la RPC import_menu_v1 en Supabase.',
  })
  async importMenu(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Body() body: any,
  ) {
    const userTenantId = req?.user?.tenantId;
    if (!userTenantId || userTenantId !== tenantId) {
      throw new ForbiddenException('Not allowed for this tenant');
    }

    return this.svc.importMenu({ tenantId, body });
  }
}
