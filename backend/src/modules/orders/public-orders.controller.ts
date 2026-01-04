import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreatePublicOrderDto } from './dto/create-public-order.dto';
import { Order } from './entities/order.entity';

@ApiTags('Public Orders')
@Controller('public/orders')
export class PublicOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new order (public)',
    description:
      'Creates a new order from a customer. This endpoint is public and does not require authentication. ' +
      'The restaurant is identified by slug. Order items are validated and prices are calculated automatically.',
  })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: Order,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or items not available',
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurant not found',
  })
  async create(
    @Body() createPublicOrderDto: CreatePublicOrderDto,
  ): Promise<Order> {
    return this.ordersService.createPublicOrder(createPublicOrderDto);
  }
}
