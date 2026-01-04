import { Controller, Post, Param, Body, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Menu } from '../menus/entities/menu.entity';
import { MenuItem } from '../menus/entities/menu-item.entity';

@Controller('public/tenants/:slug/orders')
export class PublicOrdersController {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    @InjectRepository(Menu)
    private readonly menuRepo: Repository<Menu>,
    @InjectRepository(MenuItem)
    private readonly itemRepo: Repository<MenuItem>,
    // Puedes agregar el repo de Order si ya existe
  ) {}

  @Post()
  async createOrder(@Param('slug') slug: string, @Body() body: any) {
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
    // Aquí deberías crear la orden en la DB
    // Ejemplo mínimo:
    // const order = await orderRepo.save({ ...body, restaurantId: restaurant.id });
    // return order;
    return { ok: true, received: body, tenantId: tenant.id, restaurantId: restaurant.id };
  }
}
