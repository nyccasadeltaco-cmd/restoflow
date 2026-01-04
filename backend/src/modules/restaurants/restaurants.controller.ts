import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RestaurantsService, RestaurantFilters } from './restaurants.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { CreateRestaurantWithOwnerDto } from './dto/create-restaurant-with-owner.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SetRestaurantOwnerDto } from './dto/set-restaurant-owner.dto';
import { UpdateAdminPasswordDto } from './dto/update-admin-password.dto';

@ApiTags('master/restaurants')
@Controller('master/restaurants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN) // Solo SUPER_ADMIN puede acceder a estas rutas
@ApiBearerAuth()
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  /**
   * GET /master/restaurants
   * Lista con búsqueda y filtros
   */
  @Get()
  @ApiOperation({ summary: 'Obtener lista de restaurantes con filtros' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre, email o slug' })
  @ApiQuery({ name: 'subscriptionStatus', required: false, description: 'Filtrar por estado de suscripción' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filtrar por activo/inactivo' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Cantidad de resultados por página' })
  findAll(@Query() filters: RestaurantFilters) {
    return this.restaurantsService.findAll(filters);
  }

  /**
   * GET /master/restaurants/:id
   * Obtener detalle de un restaurante
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un restaurante' })
  findOne(@Param('id') id: string) {
    return this.restaurantsService.findOne(id);
  }

  /**
   * POST /master/restaurants
   * Crear nuevo restaurante con usuario dueño
   * 
   * Este endpoint:
   * - Crea el restaurante
   * - Genera slug automáticamente si no se proporciona
   * - Crea el usuario dueño (RESTAURANT_ADMIN)
   * - Retorna restaurante + info del dueño (incluye contraseña temporal si fue generada)
   */
  @Post()
  @ApiOperation({ 
    summary: 'Crear un nuevo restaurante con usuario dueño',
    description: 'Crea el restaurante y automáticamente genera el usuario dueño con rol RESTAURANT_ADMIN. Si no se proporciona contraseña, se genera una temporal.'
  })
  create(@Body() createData: CreateRestaurantWithOwnerDto) {
    return this.restaurantsService.createWithOwner(createData);
  }

  /**
   * PATCH /master/restaurants/:id
   * Actualizar información general del restaurante
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar información general del restaurante' })
  update(@Param('id') id: string, @Body() updateData: UpdateRestaurantDto) {
    return this.restaurantsService.update(id, updateData);
  }

  /**
   * PATCH /master/restaurants/:id/subscription
   * Cambiar estado de suscripción (incluye HOLD)
   */
  @Patch(':id/subscription')
  @ApiOperation({ summary: 'Actualizar estado de suscripción del restaurante' })
  updateSubscription(
    @Param('id') id: string,
    @Body() subscriptionData: UpdateSubscriptionDto,
  ) {
    return this.restaurantsService.updateSubscription(id, subscriptionData);
  }

  /**
   * DELETE /master/restaurants/:id
   * Desactivar restaurante (soft delete)
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar restaurante (soft delete)' })
  remove(@Param('id') id: string) {
    return this.restaurantsService.remove(id);
  }

  /**
   * POST /master/restaurants/:id/activate
   * Reactivar un restaurante desactivado
   */
  @Post(':id/activate')
  @ApiOperation({ summary: 'Reactivar un restaurante desactivado' })
  activate(@Param('id') id: string) {
    return this.restaurantsService.activate(id);
  }

  /**
   * POST /master/restaurants/:id/owner
   * Asignar o cambiar el dueño (RESTAURANT_ADMIN) de un restaurante
   * 
   * Este endpoint:
   * - Si el email no existe, crea un nuevo usuario con rol RESTAURANT_ADMIN
   * - Si existe, actualiza ese usuario para ser el owner de este restaurante
   * - Actualiza el campo ownerUserId del restaurante
   * - Si no se proporciona contraseña, genera una temporal
   */
  @Patch(':id/admin-password')
  @ApiOperation({
    summary: 'Cambiar la contraseña del administrador del restaurante (solo SUPER_ADMIN)',
    description: 'Permite al SUPER_ADMIN cambiar la contraseña del usuario RESTAURANT_ADMIN asociado a este restaurante.',
  })
  updateAdminPassword(
    @Param('id') id: string,
    @Body() dto: UpdateAdminPasswordDto,
  ) {
    return this.restaurantsService.updateAdminPassword(id, dto);
  }

  /**
   * POST /master/restaurants/:id/owner
   * Asignar o cambiar el dueño de un restaurante
   * - Si el email no existe, crea un nuevo usuario con rol RESTAURANT_ADMIN
   * - Si existe, actualiza ese usuario para ser el owner de este restaurante
   * - Actualiza el campo ownerUserId del restaurante
   * - Si no se proporciona contraseña, genera una temporal
   */
  @Post(':id/owner')
  @ApiOperation({
    summary: 'Asignar o cambiar el dueño de un restaurante',
    description: 'Crea un nuevo usuario RESTAURANT_ADMIN o reasigna uno existente como dueño del restaurante. Si no se proporciona contraseña, se genera una temporal.',
  })
  setOwner(
    @Param('id') id: string,
    @Body() ownerData: SetRestaurantOwnerDto,
  ) {
    return this.restaurantsService.setOwner(id, ownerData);
  }
}
