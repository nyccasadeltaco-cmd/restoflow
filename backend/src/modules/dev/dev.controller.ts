import { Body, Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';
import { TenantUser } from '../tenants/entities/tenant_user.entity';

@Controller('api/dev')
export class DevController {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(TenantUser) private tenantUsersRepo: Repository<TenantUser>,
  ) {}

  @Post('seed-master')
  async seed(@Body() body: { email?: string; password?: string }) {
    const email = body.email ?? 'admin@plataforma.com';
    const password = body.password ?? 'master123';

    let user = await this.usersRepo.findOne({ where: { email } });
    if (!user) {
      user = this.usersRepo.create({
        email,
        password: await bcrypt.hash(password, 10),
        firstName: 'Master',
        lastName: 'Admin',
        role: UserRole.SUPER_ADMIN,
      });
      await this.usersRepo.save(user);
    }
    return { ok: true, userId: user.id, email: user.email };
  }
}
