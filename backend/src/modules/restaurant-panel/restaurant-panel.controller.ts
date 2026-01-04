import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { RestaurantPanelService } from './restaurant-panel.service';
import { UpdateRestaurantSettingsDto } from './dto/update-restaurant-settings.dto';

@ApiTags('Restaurant Panel')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.RESTAURANT_ADMIN, UserRole.STAFF)
@Controller('restaurant')
export class RestaurantPanelController {
  constructor(private readonly service: RestaurantPanelService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Obtener información del usuario logueado y su restaurante',
    description:
      'Retorna los datos del usuario autenticado (RESTAURANT_ADMIN o STAFF) junto con la información completa de su restaurante.',
  })
  async getMe(@Req() req: any) {
    const userId = req.user.id;
    const restaurantId = req.user.restaurantId;
    return this.service.getMe({ userId, restaurantId });
  }

  @Get('settings')
  @ApiOperation({
    summary: 'Obtener configuración del restaurante',
    description:
      'Retorna toda la configuración del restaurante incluyendo datos básicos, dirección, tarifas, y preferencias.',
  })
  async getSettings(@Req() req: any) {
    const restaurantId = req.user.restaurantId;
    return this.service.getSettings(restaurantId);
  }

  @Get('restaurants')
  @ApiOperation({
    summary: 'Listar restaurantes del tenant',
    description:
      'Retorna los restaurantes asociados al tenant del usuario autenticado.',
  })
  async listRestaurants(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.service.listRestaurants(tenantId);
  }

  @Patch('settings')
  @ApiOperation({
    summary: 'Actualizar configuración del restaurante',
    description:
      'Permite al RESTAURANT_ADMIN actualizar la configuración de su restaurante. Solo se actualizan los campos enviados.',
  })
  async updateSettings(
    @Req() req: any,
    @Body() dto: UpdateRestaurantSettingsDto,
  ) {
    const restaurantId = req.user.restaurantId;
    return this.service.updateSettings(restaurantId, dto);
  }
}
