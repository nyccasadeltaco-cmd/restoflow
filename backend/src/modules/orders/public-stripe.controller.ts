import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { OrdersService } from './orders.service';
import { StripeService } from './stripe.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@ApiTags('Public Stripe')
@Controller('public/stripe')
export class PublicStripeController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly stripeService: StripeService,
  ) {}

  @Post('checkout-session')
  @ApiOperation({ summary: 'Create Stripe Checkout session (public)' })
  @ApiResponse({ status: 201, description: 'Checkout session created' })
  async createCheckoutSession(
    @Body() dto: CreateCheckoutSessionDto,
    @Req() req: Request,
  ) {
    const restaurant = await this.stripeService.getRestaurantBySlug(
      dto.restaurantSlug,
    );

    const account = await this.stripeService.ensureConnectAccount(restaurant);
    if (!account.charges_enabled) {
      const baseUrl = this.resolveBaseUrl(dto, req);
      const refreshUrl = `${baseUrl}/connect/refresh`;
      const returnUrl = `${baseUrl}/connect/return`;
      const onboardingUrl = await this.stripeService.createAccountLink(
        account.id,
        returnUrl,
        refreshUrl,
      );
      return { requiresOnboarding: true, onboardingUrl };
    }

    const order = await this.ordersService.createPublicOrder(dto);

    const baseUrl = this.resolveBaseUrl(dto, req);
    const slugParam = encodeURIComponent(restaurant.slug);
    const successUrl =
      dto.successUrl ??
      `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&slug=${slugParam}`;
    const cancelUrl = dto.cancelUrl ?? `${baseUrl}/payment-cancel?slug=${slugParam}`;

    const session = await this.stripeService.createCheckoutSession({
      order: order as any,
      restaurant,
      successUrl,
      cancelUrl,
    });

    if (!session.url) {
      throw new BadRequestException('Stripe session URL missing');
    }

    return { url: session.url, orderId: order.id };
  }

  @Post('connect/onboard')
  @ApiOperation({ summary: 'Create Stripe Connect onboarding link' })
  async createOnboarding(
    @Body('restaurantSlug') restaurantSlug: string,
    @Body('returnUrl') returnUrl: string,
    @Body('refreshUrl') refreshUrl: string,
  ) {
    if (!restaurantSlug) {
      throw new BadRequestException('restaurantSlug is required');
    }
    const restaurant = await this.stripeService.getRestaurantBySlug(
      restaurantSlug,
    );
    const account = await this.stripeService.ensureConnectAccount(restaurant);
    const baseUrl =
      returnUrl?.trim() ||
      process.env.FRONTEND_RESTAURANT_URL ||
      'http://localhost:8081';
    const safeBase = baseUrl.replace(/\/$/, '');
    const onboardingUrl = await this.stripeService.createAccountLink(
      account.id,
      returnUrl?.trim() || `${safeBase}/connect/return`,
      refreshUrl?.trim() || `${safeBase}/connect/refresh`,
    );
    return { onboardingUrl };
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook' })
  async webhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature?: string,
  ) {
    const rawBody = (req as any).rawBody as Buffer | undefined;
    if (!rawBody) {
      throw new BadRequestException('Missing raw body');
    }
    const event = this.stripeService.constructEvent(rawBody, signature);
    await this.stripeService.handleEvent(event);
    return { received: true };
  }

  private resolveBaseUrl(dto: CreateCheckoutSessionDto, req: Request): string {
    const fromDto = dto.returnUrl?.trim();
    if (fromDto) return fromDto.replace(/\/$/, '');
    const fromEnv = process.env.FRONTEND_RESTAURANT_URL;
    if (fromEnv) return fromEnv.replace(/\/$/, '');
    const origin = req.headers.origin;
    if (origin) return origin.replace(/\/$/, '');
    const host = req.headers.host;
    if (host) return `http://${host}`;
    return 'http://localhost:8081';
  }
}
