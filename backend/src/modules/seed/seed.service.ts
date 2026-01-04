import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  async onModuleInit() {
    const email = 'admin@plataforma.com';
    const pass = 'master123';

    const existing = await this.usersRepo.findOne({ where: { email } });
    if (!existing) {
      const user = this.usersRepo.create({
        email,
        password: await bcrypt.hash(pass, 10),
        firstName: 'Master',
        lastName: 'Admin',
      });
      await this.usersRepo.save(user);
      console.log('[SEED] Master admin created:', email);
    } else {
      console.log('[SEED] Master admin exists:', email);
    }
  }
}
