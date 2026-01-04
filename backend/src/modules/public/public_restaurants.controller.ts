import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Menu } from '../menus/entities/menu.entity';
import { MenuCategory } from '../menus/entities/menu-category.entity';
import { MenuItem } from '../menus/entities/menu-item.entity';

@Controller('public')
export class PublicRestaurantsController {
  constructor(
    @InjectRepository(Restaurant) private readonly restaurantsRepo: Repository<Restaurant>,
    @InjectRepository(Menu) private readonly menusRepo: Repository<Menu>,
    @InjectRepository(MenuCategory) private readonly categoriesRepo: Repository<MenuCategory>,
    @InjectRepository(MenuItem) private readonly itemsRepo: Repository<MenuItem>,
  ) {}

  @Get('restaurants/:slug')
  async getRestaurant(@Param('slug') slug: string) {
    const restaurant = await this.restaurantsRepo.findOne({ where: { slug } });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    return {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      phone: restaurant.phone,
      email: restaurant.email,
      addressLine1: restaurant.addressLine1,
      city: restaurant.city,
      state: restaurant.state,
      postalCode: restaurant.postalCode,
      operatingHours: restaurant.operatingHours,
      logoUrl: restaurant.logoUrl,
      bannerUrl: restaurant.bannerUrl,
      primaryColor: restaurant.primaryColor,
      secondaryColor: restaurant.secondaryColor,
      accentColor: restaurant.accentColor,
      branding: restaurant.branding,
      isActive: restaurant.isActive,
    };
  }

  // opcional: includeUnavailable=1 para ver items no disponibles
  @Get('restaurants/:slug/menu')
  async getMenu(@Param('slug') slug: string, @Query('includeUnavailable') includeUnavailable?: string) {
    const restaurant = await this.restaurantsRepo.findOne({ where: { slug } });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    // menus.restaurantId es varchar, restaurant.id es uuid (string) => match como string
    let menu = await this.menusRepo.findOne({
      where: { restaurantId: restaurant.id, isActive: true },
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });
    if (!menu) {
      menu = await this.menusRepo.findOne({
        where: { restaurantId: restaurant.id },
        order: { displayOrder: 'ASC', createdAt: 'ASC' },
      });
    }
    if (!menu) {
      menu = await this.menusRepo.findOne({
        where: { restaurantId: restaurant.slug },
        order: { displayOrder: 'ASC', createdAt: 'ASC' },
      });
    }
    if (!menu) throw new NotFoundException('Menu not found for restaurant');

    const categories = await this.categoriesRepo.find({
      where: { menuId: menu.id, isActive: true },
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });
    const categoryIds = categories.map((c) => c.id);

    const itemsWhere: any = { isActive: true };
    if (categoryIds.length > 0) itemsWhere.categoryId = In(categoryIds);
    // por defecto solo disponibles
    if (includeUnavailable !== '1') itemsWhere.isAvailable = true;

    const items = categoryIds.length === 0
      ? []
      : await this.itemsRepo.find({
          where: itemsWhere,
          order: { displayOrder: 'ASC', createdAt: 'ASC' },
        });

    return {
      restaurant: { id: restaurant.id, name: restaurant.name, slug: restaurant.slug },
      menu: { id: menu.id, name: menu.name },
      categories,
      items,
    };
  }
}
