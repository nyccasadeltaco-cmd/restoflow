import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { MenuItem } from '../menus/entities/menu-item.entity';
import { Menu } from '../menus/entities/menu.entity';
import { MenuCategory } from '../menus/entities/menu-category.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { FilterRestaurantOrdersDto } from './dto/filter-restaurant-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreatePublicOrderDto } from './dto/create-public-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(MenuItem)
    private menuItemsRepository: Repository<MenuItem>,
    @InjectRepository(Menu)
    private menusRepository: Repository<Menu>,
    @InjectRepository(MenuCategory)
    private menuCategoriesRepository: Repository<MenuCategory>,
    @InjectRepository(Restaurant)
    private restaurantsRepository: Repository<Restaurant>,
  ) {}

  /**
   * Get all orders for a restaurant with optional filters
   */
  async findAllForRestaurant(
    restaurantId: string,
    filters: FilterRestaurantOrdersDto,
  ): Promise<Order[]> {
    const query = this.ordersRepository
      .createQueryBuilder('order')
      .where('order.restaurantId = :restaurantId', { restaurantId })
      .orderBy('order.createdAt', 'DESC');

    // Filter by status
    if (filters.status) {
      query.andWhere('order.status = :status', { status: filters.status });
    }

    // Filter by date range
    if (filters.from && filters.to) {
      query.andWhere('order.createdAt BETWEEN :from AND :to', {
        from: new Date(filters.from),
        to: new Date(filters.to),
      });
    } else if (filters.from) {
      query.andWhere('order.createdAt >= :from', {
        from: new Date(filters.from),
      });
    } else if (filters.to) {
      query.andWhere('order.createdAt <= :to', {
        to: new Date(filters.to),
      });
    }

    return query.getMany();
  }

  /**
   * Get a single order by ID for a restaurant
   */
  async findOneForRestaurant(
    restaurantId: string,
    orderId: string,
  ): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, restaurantId },
    });

    if (!order) {
      throw new NotFoundException(
        `Order with ID ${orderId} not found for this restaurant`,
      );
    }

    // Load order items
    const items = await this.orderItemsRepository.find({
      where: { orderId: order.id },
    });

    const hydratedItems = await this.attachMenuItems(items);
    return { ...order, items: hydratedItems } as any;
  }

  /**
   * Update order status with validation and timestamp updates
   */
  async updateStatus(
    restaurantId: string,
    orderId: string,
    updateStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, restaurantId },
    });

    if (!order) {
      throw new NotFoundException(
        `Order with ID ${orderId} not found for this restaurant`,
      );
    }

    // Validate status transition
    this.validateStatusTransition(order.status, updateStatusDto.status);

    // Update status
    order.status = updateStatusDto.status;

    // Update timestamp fields based on new status
    const now = new Date();
    if (updateStatusDto.status === OrderStatus.READY) {
      order.readyAt = now;
    } else if (updateStatusDto.status === OrderStatus.DELIVERED) {
      order.deliveredAt = now;
    } else if (updateStatusDto.status === OrderStatus.CANCELED) {
      order.canceledAt = now;
    }

    return this.ordersRepository.save(order);
  }

  /**
   * Update order details (notes, table, etc.)
   */
  async updateOrder(
    restaurantId: string,
    orderId: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, restaurantId },
    });

    if (!order) {
      throw new NotFoundException(
        `Order with ID ${orderId} not found for this restaurant`,
      );
    }

    // Update allowed fields
    if (updateOrderDto.notes !== undefined) {
      order.notes = updateOrderDto.notes;
    }
    if (updateOrderDto.tableId !== undefined) {
      order.tableId = updateOrderDto.tableId;
    }

    return this.ordersRepository.save(order);
  }

  /**
   * Create a public order (from customer)
   */
  async createPublicOrder(
    createOrderDto: CreatePublicOrderDto,
  ): Promise<Order> {
    // 1. Resolve restaurant by slug
    const restaurant = await this.restaurantsRepository.findOne({
      where: { slug: createOrderDto.restaurantSlug },
    });

    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with slug "${createOrderDto.restaurantSlug}" not found`,
      );
    }

    // 2. Load menu items and calculate totals
    const menuItemIds = createOrderDto.items.map((item) => item.menuItemId);
    const uniqueItemIds = Array.from(new Set(menuItemIds));

    const menus = await this.menusRepository.find({
      where: { restaurantId: restaurant.id },
    });
    if (menus.length === 0) {
      throw new BadRequestException('Menu not found for this restaurant');
    }

    const menuIds = menus.map((menu) => menu.id);
    const categories = await this.menuCategoriesRepository.find({
      where: { menuId: In(menuIds) },
    });
    if (categories.length === 0) {
      throw new BadRequestException('Menu categories not found for this restaurant');
    }

    const categoryIds = categories.map((category) => category.id);
    const menuItems = await this.menuItemsRepository.find({
      where: {
        id: In(uniqueItemIds),
        categoryId: In(categoryIds),
      },
    });

    if (menuItems.length !== uniqueItemIds.length) {
      throw new BadRequestException('One or more menu items not found for this restaurant');
    }

    // Check all items are available
    const unavailableItems = menuItems.filter((item) => !item.isAvailable);
    if (unavailableItems.length > 0) {
      throw new BadRequestException(
        `Items not available: ${unavailableItems.map((i) => i.name).join(', ')}`,
      );
    }

    // Calculate subtotal
    let subtotal = 0;
    const orderItems: Partial<OrderItem>[] = [];

    for (const itemDto of createOrderDto.items) {
      const menuItem = menuItems.find((mi) => mi.id === itemDto.menuItemId);
      if (!menuItem) continue;

      const unitPrice = Number(menuItem.price);
      const totalPrice = unitPrice * itemDto.quantity;
      subtotal += totalPrice;

      orderItems.push({
        menuItemId: menuItem.id,
        quantity: itemDto.quantity,
        unitPrice,
        totalPrice,
        notes: itemDto.notes || null,
        modifiers: itemDto.modifiers || null,
      });
    }

    // 3. Calculate taxes, fees, and total
    // TODO: Implement tax calculation based on restaurant settings
    const taxAmount = 0; // For now, no tax
    const tipAmount = createOrderDto.tipAmount || 0;
    const cardFeeAmount = 0; // TODO: Calculate if payment with card
    const platformFeeAmount = 0; // TODO: Calculate platform fee
    const totalAmount = subtotal + taxAmount + tipAmount + cardFeeAmount + platformFeeAmount;

    // 4. Create order
    const order = this.ordersRepository.create({
      restaurantId: restaurant.id,
      tableId: createOrderDto.tableId || null,
      source: createOrderDto.source,
      status: OrderStatus.PENDING,
      customerName: createOrderDto.customerName || null,
      customerPhone: createOrderDto.customerPhone || null,
      notes: createOrderDto.notes || null,
      subtotalAmount: subtotal,
      taxAmount,
      tipAmount,
      cardFeeAmount,
      platformFeeAmount,
      totalAmount,
    });

    const savedOrder = await this.ordersRepository.save(order);

    // 5. Create order items
    for (const itemData of orderItems) {
      const orderItem = this.orderItemsRepository.create({
        ...itemData,
        orderId: savedOrder.id,
      });
      await this.orderItemsRepository.save(orderItem);
    }

    // 6. Load items and return complete order
    const items = await this.orderItemsRepository.find({
      where: { orderId: savedOrder.id },
    });

    const hydratedItems = await this.attachMenuItems(items);
    return { ...savedOrder, items: hydratedItems } as any;
  }

  private async attachMenuItems(items: OrderItem[]): Promise<any[]> {
    if (!items.length) return [];
    const menuItemIds = Array.from(new Set(items.map((item) => item.menuItemId)));
    const menuItems = await this.menuItemsRepository.find({
      where: { id: In(menuItemIds) },
    });
    const menuItemMap = new Map(menuItems.map((item) => [item.id, item]));

    return items.map((item) => {
      const menuItem = menuItemMap.get(item.menuItemId);
      return {
        ...item,
        menuItem: menuItem
          ? {
              id: menuItem.id,
              name: menuItem.name,
              description: menuItem.description,
            }
          : null,
      };
    });
  }

  /**
   * Validate status transition rules
   */
  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): void {
    // Define allowed transitions
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELED],
      [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELED],
      [OrderStatus.READY]: [OrderStatus.DELIVERED, OrderStatus.CANCELED],
      [OrderStatus.DELIVERED]: [OrderStatus.CANCELED], // Special case if needed
      [OrderStatus.CANCELED]: [], // Cannot change from canceled
    };

    const allowed = allowedTransitions[currentStatus];

    if (!allowed || !allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}
