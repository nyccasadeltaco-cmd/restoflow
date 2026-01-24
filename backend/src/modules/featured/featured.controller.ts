import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { FeaturedService } from './featured.service';
import { UpsertFeaturedSectionDto } from './dto/featured-section.dto';
import { CreateFeaturedItemDto, UpdateFeaturedItemDto } from './dto/featured-item.dto';
import { CreateComboDto, UpdateComboDto } from './dto/combo.dto';
import { CreateComboItemDto, UpdateComboItemDto } from './dto/combo-item.dto';

@ApiTags('Restaurant Featured')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.RESTAURANT_ADMIN, UserRole.STAFF)
@Controller('restaurant/featured')
export class FeaturedController {
  constructor(private readonly service: FeaturedService) {}

  @Get('sections')
  getSections(@Req() req: any) {
    return this.service.getSections(req.user.restaurantId);
  }

  @Post('sections')
  upsertSection(@Req() req: any, @Body() dto: UpsertFeaturedSectionDto) {
    return this.service.upsertSection(req.user.restaurantId, dto);
  }

  @Get('items')
  getItems(@Req() req: any, @Query('sectionKey') sectionKey?: string) {
    return this.service.getItems(req.user.restaurantId, sectionKey);
  }

  @Post('items')
  createItem(@Req() req: any, @Body() dto: CreateFeaturedItemDto) {
    return this.service.createItem(req.user.restaurantId, dto);
  }

  @Patch('items/:id')
  updateItem(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateFeaturedItemDto) {
    return this.service.updateItem(req.user.restaurantId, id, dto);
  }

  @Delete('items/:id')
  deleteItem(@Req() req: any, @Param('id') id: string) {
    return this.service.deleteItem(req.user.restaurantId, id);
  }
}

@ApiTags('Restaurant Combos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.RESTAURANT_ADMIN, UserRole.STAFF)
@Controller('restaurant/combos')
export class CombosController {
  constructor(private readonly service: FeaturedService) {}

  @Get()
  getCombos(@Req() req: any) {
    return this.service.getCombos(req.user.restaurantId);
  }

  @Post()
  createCombo(@Req() req: any, @Body() dto: CreateComboDto) {
    return this.service.createCombo(req.user.restaurantId, dto);
  }

  @Patch(':id')
  updateCombo(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateComboDto) {
    return this.service.updateCombo(req.user.restaurantId, id, dto);
  }

  @Delete(':id')
  deleteCombo(@Req() req: any, @Param('id') id: string) {
    return this.service.deleteCombo(req.user.restaurantId, id);
  }

  @Get(':id/items')
  getComboItems(@Req() req: any, @Param('id') comboId: string) {
    return this.service.getComboItems(req.user.restaurantId, comboId);
  }

  @Post(':id/items')
  addComboItem(
    @Req() req: any,
    @Param('id') comboId: string,
    @Body() dto: CreateComboItemDto,
  ) {
    return this.service.addComboItem(req.user.restaurantId, comboId, dto);
  }

  @Patch(':id/items/:itemId')
  updateComboItem(
    @Req() req: any,
    @Param('id') comboId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateComboItemDto,
  ) {
    return this.service.updateComboItem(req.user.restaurantId, comboId, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  deleteComboItem(
    @Req() req: any,
    @Param('id') comboId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.service.deleteComboItem(req.user.restaurantId, comboId, itemId);
  }
}
