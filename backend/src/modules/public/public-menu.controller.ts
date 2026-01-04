import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Menu } from '../menus/entities/menu.entity';
import { MenuItem } from '../menus/entities/menu-item.entity';
import { MenuCategory } from '../menus/entities/menu-category.entity';
import { FindOptionsWhere } from 'typeorm';

@Controller('public/tenants/:slug/menu')
export class PublicMenuController {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    @InjectRepository(Menu)
    private readonly menuRepo: Repository<Menu>,
    @InjectRepository(MenuItem)
    private readonly itemRepo: Repository<MenuItem>,
    @InjectRepository(MenuCategory)
    private readonly categoryRepo: Repository<MenuCategory>,
  ) {}

  @Get()
  async getMenu(@Param('slug') slug: string, @Query('view') view: string) {
    const tenant = await this.tenantRepo.findOne({ where: { slug } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    let restaurant: Restaurant | null = null;
    if (tenant.defaultRestaurantId) {
      restaurant = await this.restaurantRepo.findOne({
        where: { id: tenant.defaultRestaurantId, tenantId: tenant.id },
      });
    }
    if (!restaurant) {
      restaurant = await this.restaurantRepo.findOne({
        where: { tenantId: tenant.id },
        order: { createdAt: 'ASC' },
      });
    }
    if (!restaurant) throw new NotFoundException('Restaurant not found for tenant');
    // Busca el menú principal del tenant
    // Busca el menú principal del restaurante (ajusta si tienes varios menús por tenant)
    const menu = await this.menuRepo.findOne({ where: { restaurantId: restaurant.id } });
    if (!menu) throw new NotFoundException('Menu not found');

    // Filtrar categorías por menuId
    const categories = await this.categoryRepo.find({ where: { menuId: menu.id } });

    // Filtrar items por categoryId (si tienes relación directa) o por menuId si existe
    // Aquí se asume que los items pertenecen a categorías de ese menú
    let items: MenuItem[] = [];
    if (categories.length > 0) {
      const categoryIds = categories.map(c => c.id);
      const where: FindOptionsWhere<MenuItem>[] = categoryIds.map(id => ({ categoryId: id }));
      items = await this.itemRepo.find({ where });
    }

    return {
      categories,
      items,
    };
  }
}
