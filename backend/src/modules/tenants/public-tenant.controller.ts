import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { TenantDomain } from '../tenants/entities/tenant_domain.entity';

@Controller('public')
export class PublicTenantController {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(TenantDomain)
    private readonly domainRepo: Repository<TenantDomain>,
  ) {}

  @Get('resolve')
  async resolveTenant(@Query('host') host: string, @Query('slug') slug?: string) {
    if (!host && !slug) {
      throw new NotFoundException('Host or slug required');
    }
    // 1. Buscar por dominio
    if (host) {
      const domain = await this.domainRepo.findOne({ where: { domain: host, status: 'active' }, relations: ['tenant'] });
      if (domain && domain.tenant) {
        return { tenant: domain.tenant, by: 'domain' };
      }
    }
    // 2. Fallback: buscar por slug
    if (slug) {
      const tenant = await this.tenantRepo.findOne({ where: { slug } });
      if (tenant) {
        return { tenant, by: 'slug' };
      }
    }
    throw new NotFoundException('Tenant not found');
  }
}
