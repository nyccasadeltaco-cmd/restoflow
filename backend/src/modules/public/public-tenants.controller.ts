import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';

@Controller('public/tenants')
export class PublicTenantsController {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
  ) {}

  @Get(':slug')
  async getTenant(@Param('slug') slug: string) {
    const tenant = await this.tenantRepo.findOne({ where: { slug } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    // Puedes ajustar los campos según lo que necesite el frontend
    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      defaultRestaurantId: tenant.defaultRestaurantId ?? null,
      logo: tenant.settings?.logo,
      colors: tenant.settings?.colors,
      hours: tenant.settings?.hours,
      contactEmail: tenant.contactEmail,
      contactPhone: tenant.contactPhone,
      plan: tenant.plan,
      status: tenant.status,
    };
  }
}
