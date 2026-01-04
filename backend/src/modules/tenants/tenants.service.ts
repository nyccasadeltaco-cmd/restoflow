import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
  ) {}

  async findAll() {
    return this.tenantsRepository.find();
  }

  async findOne(id: string) {
    return this.tenantsRepository.findOne({ where: { id } });
  }

  async create(tenantData: Partial<Tenant>) {
    const tenant = this.tenantsRepository.create(tenantData);
    return this.tenantsRepository.save(tenant);
  }

  async update(id: string, tenantData: Partial<Tenant>) {
    await this.tenantsRepository.update(id, tenantData);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.tenantsRepository.delete(id);
  }
}
