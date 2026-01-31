import Stripe from 'stripe';
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Order, OrderStatus, PaymentStatus } from './entities/order.entity';

@Injectable()
export class StripeService {
  private stripe?: Stripe;
  private webhookSecret?: string;
  private mode: 'test' | 'live';

  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
  ) {
    this.mode = (process.env.STRIPE_MODE || 'test') === 'live' ? 'live' : 'test';
    const secretKey =
      this.mode === 'live'
        ? process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY
        : process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY;
    if (secretKey) {
      this.stripe = new Stripe(secretKey);
    }
    this.webhookSecret =
      this.mode === 'live'
        ? process.env.STRIPE_WEBHOOK_SECRET_LIVE || process.env.STRIPE_WEBHOOK_SECRET
        : process.env.STRIPE_WEBHOOK_SECRET_TEST || process.env.STRIPE_WEBHOOK_SECRET;
  }

  private getClient(): Stripe {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }
    return this.stripe;
  }

  async ensureConnectAccount(restaurant: Restaurant): Promise<Stripe.Account> {
    if (restaurant.stripeAccountId) {
      return this.getClient().accounts.retrieve(restaurant.stripeAccountId);
    }

    const account = await this.getClient().accounts.create({
      type: 'express',
      business_type: 'company',
      metadata: {
        restaurantId: restaurant.id,
        restaurantSlug: restaurant.slug,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    await this.restaurantRepo.update(restaurant.id, {
      stripeAccountId: account.id,
    });

    return account;
  }

  async createAccountLink(
    accountId: string,
    returnUrl: string,
    refreshUrl: string,
  ): Promise<string> {
    const link = await this.getClient().accountLinks.create({
      account: accountId,
      type: 'account_onboarding',
      return_url: returnUrl,
      refresh_url: refreshUrl,
    });
    return link.url;
  }

  async createCheckoutSession(params: {
    order: Order & { items?: any[] };
    restaurant: Restaurant;
    successUrl: string;
    cancelUrl: string;
  }): Promise<Stripe.Checkout.Session> {
    const { order, restaurant, successUrl, cancelUrl } = params;
    if (!restaurant.stripeAccountId) {
      throw new BadRequestException('Stripe account not configured');
    }

    const currency = (restaurant.currency || 'usd').toLowerCase();
    const items = order.items ?? [];

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item) => {
        const name =
          item.itemType === 'combo'
            ? item.displayName || 'Combo'
            : item.menuItem?.name || item.displayName || 'Item';
        const unitAmount = Math.round(Number(item.unitPrice) * 100);
        return {
          price_data: {
            currency,
            product_data: { name },
            unit_amount: unitAmount,
          },
          quantity: item.quantity ?? 1,
        };
      },
    );

    const taxAmount = Math.round(Number(order.taxAmount || 0) * 100);
    if (taxAmount > 0) {
      lineItems.push({
        price_data: {
          currency,
          product_data: { name: 'Tax' },
          unit_amount: taxAmount,
        },
        quantity: 1,
      });
    }

    const tipAmount = Math.round(Number(order.tipAmount || 0) * 100);
    if (tipAmount > 0) {
      lineItems.push({
        price_data: {
          currency,
          product_data: { name: 'Tip' },
          unit_amount: tipAmount,
        },
        quantity: 1,
      });
    }

    const totalCents = lineItems.reduce((sum, item) => {
      const amount = (item.price_data?.unit_amount ?? 0) * (item.quantity ?? 1);
      return sum + amount;
    }, 0);

    const feePercent = Number(restaurant.platformFeePercent || 0);
    const applicationFee = Math.max(
      0,
      Math.round(totalCents * (feePercent / 100)),
    );

    const session = await this.getClient().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: order.id,
      metadata: {
        orderId: order.id,
        restaurantId: restaurant.id,
        restaurantSlug: restaurant.slug,
        stripeAccountId: restaurant.stripeAccountId,
      },
      payment_intent_data: {
        application_fee_amount: applicationFee,
        transfer_data: {
          destination: restaurant.stripeAccountId,
        },
        metadata: {
          orderId: order.id,
          restaurantId: restaurant.id,
          restaurantSlug: restaurant.slug,
        },
      },
    });

    await this.ordersRepo.update(order.id, {
      stripeSessionId: session.id,
      stripeAccountId: restaurant.stripeAccountId,
    });

    return session;
  }

  constructEvent(rawBody: Buffer, signature?: string): Stripe.Event {
    if (!this.webhookSecret) {
      throw new BadRequestException('Missing STRIPE_WEBHOOK_SECRET');
    }
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature');
    }
    return this.getClient().webhooks.constructEvent(
      rawBody,
      signature,
      this.webhookSecret,
    );
  }

  async handleEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.client_reference_id || session.metadata?.orderId;
        if (!orderId) return;
        await this.ordersRepo.update(orderId, {
          paymentStatus: PaymentStatus.PAID,
          status: OrderStatus.CONFIRMED,
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent?.toString(),
          stripeAccountId: session.metadata?.stripeAccountId,
        });
        return;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;
        const orderId = intent.metadata?.orderId;
        if (!orderId) return;
        await this.ordersRepo.update(orderId, {
          paymentStatus: PaymentStatus.FAILED,
          stripePaymentIntentId: intent.id,
        });
        return;
      }
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.client_reference_id || session.metadata?.orderId;
        if (!orderId) return;
        await this.ordersRepo.update(orderId, {
          paymentStatus: PaymentStatus.FAILED,
          stripeSessionId: session.id,
        });
        return;
      }
      default:
        return;
    }
  }

  async getRestaurantBySlug(slug: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepo.findOne({ where: { slug } });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    return restaurant;
  }
}
