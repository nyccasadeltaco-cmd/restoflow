import { Injectable } from '@nestjs/common';

@Injectable()
export class StatsService {
  async getDashboard() {
    return {
      totalOrders: 0,
      totalRevenue: 0,
      todayOrders: 0,
    };
  }
}
