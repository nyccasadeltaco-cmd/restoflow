import { Injectable } from '@nestjs/common';

@Injectable()
export class MenusService {
  async findAll() {
    return [];
  }

  async findOne(id: string) {
    return null;
  }

  async create(menuData: any) {
    return null;
  }

  async update(id: string, menuData: any) {
    return null;
  }

  async remove(id: string) {
    return null;
  }
}
