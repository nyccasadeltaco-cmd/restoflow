import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { FilterRestaurantOrdersDto } from './dto/filter-restaurant-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus } from './entities/order.entity';

@ApiTags('Restaurant Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.RESTAURANT_ADMIN, UserRole.STAFF)
@Controller('restaurant/orders')
export class RestaurantOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all orders for restaurant',
    description:
      'Returns all orders for the authenticated restaurant. Can be filtered by status and date range.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: OrderStatus,
    description: 'Filter by order status',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    type: String,
    description: 'Start date (ISO 8601)',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    type: String,
    description: 'End date (ISO 8601)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of orders',
    type: [Order],
  })
  async findAll(
    @Request() req,
    @Query() filters: FilterRestaurantOrdersDto,
  ): Promise<Order[]> {
    const restaurantId = req.user.restaurantId;
    return this.ordersService.findAllForRestaurant(restaurantId, filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get order details',
    description:
      'Returns detailed information about a specific order including items.',
  })
  @ApiResponse({
    status: 200,
    description: 'Order details',
    type: Order,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async findOne(@Request() req, @Param('id') id: string): Promise<Order> {
    const restaurantId = req.user.restaurantId;
    return this.ordersService.findOneForRestaurant(restaurantId, id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update order status',
    description:
      'Changes the order status. Validates state transitions and updates timestamps automatically.',
  })
  @ApiResponse({
    status: 200,
    description: 'Order status updated',
    type: Order,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status transition',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const restaurantId = req.user.restaurantId;
    return this.ordersService.updateStatus(restaurantId, id, updateStatusDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update order details',
    description:
      'Updates order details like notes or table assignment. Does not change order status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Order updated',
    type: Order,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    const restaurantId = req.user.restaurantId;
    return this.ordersService.updateOrder(restaurantId, id, updateOrderDto);
  }
}
