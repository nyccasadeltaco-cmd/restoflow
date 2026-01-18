import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { RestaurantMenuService } from './restaurant-menu.service';
import {
  CreateMenuCategoryDto,
  UpdateMenuCategoryDto,
} from './dto/menu-category.dto';
import {
  CreateMenuItemDto,
  UpdateMenuItemDto,
} from './dto/menu-item.dto';
import { MenuImageUploadDto } from './dto/menu-image.dto';

@ApiTags('Restaurant Menu')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.RESTAURANT_ADMIN, UserRole.STAFF)
@Controller('restaurant/menu')
export class RestaurantMenuController {
  constructor(private readonly service: RestaurantMenuService) {}

  // ==================== CATEGORÍAS ====================

  @Get('categories')
  @ApiOperation({
    summary: 'Listar categorías del menú',
    description:
      'Retorna todas las categorías del menú del restaurante ordenadas por displayOrder y nombre.',
  })
  async listCategories(@Req() req: any) {
    const restaurantId = req.user.restaurantId;
    return this.service.listCategories(restaurantId);
  }

  @Post('categories')
  @ApiOperation({
    summary: 'Crear categoría de menú',
    description:
      'Crea una nueva categoría en el menú del restaurante. El menú principal se crea automáticamente si no existe.',
  })
  async createCategory(
    @Req() req: any,
    @Body() dto: CreateMenuCategoryDto,
  ) {
    const restaurantId = req.user.restaurantId;
    return this.service.createCategory(restaurantId, dto);
  }

  @Patch('categories/:id')
  @ApiOperation({
    summary: 'Actualizar categoría de menú',
    description:
      'Actualiza los datos de una categoría existente. Solo se actualizan los campos enviados.',
  })
  async updateCategory(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateMenuCategoryDto,
  ) {
    const restaurantId = req.user.restaurantId;
    return this.service.updateCategory(restaurantId, id, dto);
  }

  // ==================== ITEMS ====================

  @Get('items')
  @ApiOperation({
    summary: 'Listar items del menú',
    description:
      'Retorna los items del menú con filtros opcionales por categoría, búsqueda por nombre y disponibilidad.',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filtrar por ID de categoría',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Buscar por nombre del item',
  })
  @ApiQuery({
    name: 'isAvailable',
    required: false,
    description: 'Filtrar por disponibilidad (true/false)',
  })
  async listItems(
    @Req() req: any,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('isAvailable') isAvailable?: string,
  ) {
    const restaurantId = req.user.restaurantId;
    const available =
      typeof isAvailable === 'string' ? isAvailable === 'true' : undefined;

    return this.service.listItems(restaurantId, {
      categoryId,
      search,
      isAvailable: available,
    });
  }

  @Post('items')
  @ApiOperation({
    summary: 'Crear item de menú',
    description:
      'Crea un nuevo plato/producto en el menú. La categoría debe pertenecer al restaurante.',
  })
  async createItem(
    @Req() req: any,
    @Body() dto: CreateMenuItemDto,
  ) {
    const restaurantId = req.user.restaurantId;
    return this.service.createItem(restaurantId, dto);
  }

  @Patch('items/:id')
  @ApiOperation({
    summary: 'Actualizar item de menú',
    description:
      'Actualiza los datos de un plato/producto existente. Solo se actualizan los campos enviados.',
  })
  async updateItem(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateMenuItemDto,
  ) {
    const restaurantId = req.user.restaurantId;
    return this.service.updateItem(restaurantId, id, dto);
  }

  @Post('items/upload-image')
  @ApiOperation({
    summary: 'Subir imagen de item del menA§',
    description:
      'Sube una imagen a Supabase Storage usando credenciales del servidor.',
  })
  async uploadItemImage(
    @Req() req: any,
    @Body() dto: MenuImageUploadDto,
  ) {
    console.log('[MENU UPLOAD] Received upload-image request');
    const restaurantId = req.user.restaurantId;
    return this.service.uploadMenuImage(restaurantId, dto);
  }
}
