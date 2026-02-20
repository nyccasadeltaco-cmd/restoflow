import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { TenantDomain } from '../tenants/entities/tenant_domain.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';

@Controller('public')
export class PublicTenantController {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(TenantDomain)
    private readonly domainRepo: Repository<TenantDomain>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
  ) {}

  @Get('resolve')
  async resolveTenant(@Query('host') host: string, @Query('slug') slug?: string) {
    const normalizedHost = this.normalizeHost(host);
    const normalizedSlug = this.normalizeSlug(slug);
    if (!normalizedHost && !normalizedSlug) {
      throw new NotFoundException('Host or slug required');
    }

    let tenant: Tenant | null = null;
    let resolvedBy: 'domain' | 'slug' | null = null;

    // 1. Buscar por dominio
    if (normalizedHost) {
      const domain = await this.domainRepo.findOne({
        where: { domain: normalizedHost, status: 'active' },
        relations: ['tenant'],
      });
      if (domain && domain.tenant) {
        tenant = domain.tenant;
        resolvedBy = 'domain';
      }
    }

    // 2. Fallback: buscar por slug
    if (!tenant && normalizedSlug) {
      tenant = await this.tenantRepo.findOne({ where: { slug: normalizedSlug } });
      if (tenant) {
        resolvedBy = 'slug';
      }
    }

    if (!tenant || !resolvedBy) {
      throw new NotFoundException('Tenant not found');
    }

    const restaurant = await this.resolveActiveRestaurant(tenant.id, tenant.defaultRestaurantId);
    return {
      by: resolvedBy,
      tenant: {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        defaultRestaurantId: tenant.defaultRestaurantId ?? null,
      },
      restaurant: restaurant
        ? {
            id: restaurant.id,
            slug: restaurant.slug,
            name: restaurant.name,
            isActive: restaurant.isActive,
          }
        : null,
    };
  }

  private async resolveActiveRestaurant(
    tenantId: string,
    defaultRestaurantId?: string | null,
  ): Promise<Restaurant | null> {
    if (defaultRestaurantId) {
      const byDefault = await this.restaurantRepo.findOne({
        where: { id: defaultRestaurantId, tenantId, isActive: true },
      });
      if (byDefault) return byDefault;
    }

    return this.restaurantRepo.findOne({
      where: { tenantId, isActive: true },
      order: { createdAt: 'ASC' },
    });
  }

  private normalizeHost(value?: string): string | null {
    if (!value) return null;
    const host = value.trim().toLowerCase().replace(/:\d+$/, '');
    if (!host) return null;
    return host.startsWith('www.') ? host.slice(4) : host;
  }

  private normalizeSlug(value?: string): string | null {
    if (!value) return null;
    const slug = value.trim().toLowerCase();
    return slug || null;
  }
}
