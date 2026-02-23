import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import {
  Payment as BillingPayment,
  PaymentMethod,
  PaymentStatus as BillingPaymentStatus,
} from '../billing/entities/payment.entity';
import { Order, PaymentStatus as OrderPaymentStatus } from '../orders/entities/order.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { UserRole } from '../users/entities/user.entity';
import { CloseoutReportDto, CloseoutReportQueryDto } from './dto/closeout-report.dto';

type AuthUser = {
  id: string;
  role: UserRole;
  tenantId: string | null;
  restaurantId: string | null;
};

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
    @InjectRepository(BillingPayment)
    private readonly paymentsRepo: Repository<BillingPayment>,
    @InjectRepository(Restaurant)
    private readonly restaurantsRepo: Repository<Restaurant>,
  ) {}

  async getCloseoutReport(
    query: CloseoutReportQueryDto,
    user: AuthUser,
  ): Promise<CloseoutReportDto> {
    const from = new Date(query.from);
    const to = new Date(query.to);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      throw new BadRequestException('Invalid from/to datetime');
    }
    if (from >= to) {
      throw new BadRequestException('"from" must be earlier than "to"');
    }

    await this.assertRestaurantAccess(query.restaurantId, user);

    const restaurant = await this.restaurantsRepo.findOne({
      where: { id: query.restaurantId },
    });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const paidOrders = await this.ordersRepo
      .createQueryBuilder('o')
      .where('o.restaurantId = :restaurantId', { restaurantId: query.restaurantId })
      .andWhere('o.paymentStatus = :paid', { paid: OrderPaymentStatus.PAID })
      .andWhere('o.updatedAt >= :from', { from })
      .andWhere('o.updatedAt < :to', { to })
      .getMany();

    const completedPayments = await this.paymentsRepo.find({
      where: {
        restaurantId: query.restaurantId,
        status: BillingPaymentStatus.COMPLETED,
        createdAt: Between(from, to),
      },
    });

    const grossSales = this.sum(paidOrders.map((o) => Number(o.subtotalAmount ?? 0)));
    const discounts = 0;
    const netSales = this.round(grossSales - discounts);
    const taxes = this.sum(paidOrders.map((o) => Number(o.taxAmount ?? 0)));
    const tips = this.sum(paidOrders.map((o) => Number(o.tipAmount ?? 0)));

    const paymentsByType = {
      card: 0,
      cash: 0,
      other: 0,
    };

    if (completedPayments.length > 0) {
      for (const payment of completedPayments) {
        const amount = Number(payment.amount ?? 0);
        switch (payment.method) {
          case PaymentMethod.CARD:
          case PaymentMethod.ONLINE:
            paymentsByType.card = this.round(paymentsByType.card + amount);
            break;
          case PaymentMethod.CASH:
            paymentsByType.cash = this.round(paymentsByType.cash + amount);
            break;
          default:
            paymentsByType.other = this.round(paymentsByType.other + amount);
            break;
        }
      }
    } else {
      for (const order of paidOrders) {
        const amount = Number(order.totalAmount ?? 0);
        const isCard = Boolean(order.stripePaymentIntentId || order.stripeSessionId);
        if (isCard) {
          paymentsByType.card = this.round(paymentsByType.card + amount);
        } else {
          paymentsByType.cash = this.round(paymentsByType.cash + amount);
        }
      }
    }

    const totalCollected = this.round(
      paymentsByType.card + paymentsByType.cash + paymentsByType.other,
    );

    return {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      from: from.toISOString(),
      to: to.toISOString(),
      generatedAt: new Date().toISOString(),
      ordersCount: paidOrders.length,
      grossSales,
      discounts,
      netSales,
      taxes,
      tips,
      totalCollected,
      paymentsByType,
      // Not available in current schema.
      tipsByEmployee: [],
      disclaimers: ['Includes Restoflow orders only.', 'External platform sales not included.'],
    };
  }

  private async assertRestaurantAccess(restaurantId: string, user: AuthUser): Promise<void> {
    const role = user.role;
    if (role === UserRole.RESTAURANT_ADMIN || role === UserRole.STAFF) {
      if (!user.restaurantId || user.restaurantId !== restaurantId) {
        throw new ForbiddenException('You cannot access this restaurant report');
      }
      return;
    }

    if (user.tenantId) {
      const restaurant = await this.restaurantsRepo.findOne({
        where: { id: restaurantId, tenantId: user.tenantId },
      });
      if (!restaurant) {
        throw new ForbiddenException('Restaurant does not belong to your tenant');
      }
    }
  }

  private sum(values: number[]): number {
    return this.round(values.reduce((acc, value) => acc + value, 0));
  }

  private round(value: number): number {
    return Number(value.toFixed(2));
  }
}
