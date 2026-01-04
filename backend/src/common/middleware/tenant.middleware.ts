import { Injectable, NestMiddleware, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
import { Tenant } from '../../modules/tenants/entities/tenant.entity';
import { TenantUser } from '../../modules/tenants/entities/tenant_user.entity';
import { TenantDomain } from '../../modules/tenants/entities/tenant_domain.entity';

export interface TenantRequest extends Request {
  tenant?: { id: string; slug: string; name: string };
  user?: { id: string; role: string; tenantId?: string | null };
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly dataSource: DataSource) {}

  async use(req: TenantRequest, _res: Response, next: NextFunction) {
    const host = req.headers.host?.replace(/:\d+$/, ''); // remove port if present
    const slug = (req.params as any)?.slug;

    const tenantRepo = this.dataSource.getRepository(Tenant);
    const tenantUserRepo = this.dataSource.getRepository(TenantUser);
    const domainRepo = this.dataSource.getRepository(TenantDomain);

    let tenant: Tenant | null = null;
    // 1. Buscar por dominio activo
    if (host) {
      const domain = await domainRepo.findOne({ where: { domain: host, status: 'active' }, relations: ['tenant'] });
      if (domain && domain.tenant) {
        tenant = domain.tenant;
      }
    }
    // 2. Fallback: buscar por slug
    if (!tenant && slug) {
      tenant = await tenantRepo.findOne({ where: { slug } });
    }
    if (!tenant) throw new NotFoundException('Tenant not found');

    // Debe existir req.user porque esto corre en rutas protegidas (AuthGuard('jwt'))
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('Unauthorized');

    const membership = await tenantUserRepo.findOne({
      where: { tenantId: tenant.id, userId, isActive: true },
    });
    if (!membership) throw new UnauthorizedException('Not allowed for this tenant');

    req.tenant = { id: tenant.id, slug: tenant.slug, name: tenant.name };
    next();
  }
}
