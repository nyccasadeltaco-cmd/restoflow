import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { UpdateRestaurantSettingsDto } from './dto/update-restaurant-settings.dto';

@Injectable()
export class RestaurantPanelService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Restaurant)
    private readonly restaurantsRepo: Repository<Restaurant>,
  ) {}

  /**
   * Obtiene la información del usuario logueado y su restaurante
   */
  async getMe(input: { userId: string; restaurantId?: string }) {
    const user = await this.usersRepo.findOne({
      where: { id: input.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!input.restaurantId) {
      // Puede pasar para SUPER_ADMIN, pero este endpoint solo debe ser accedido por RESTAURANT_ADMIN/STAFF
      throw new NotFoundException('Restaurant not assigned to user');
    }

    const restaurant = await this.restaurantsRepo.findOne({
      where: { id: input.restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    // Devuelve solo lo que necesita el panel admin
    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
      },
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        legalName: restaurant.legalName,
        slug: restaurant.slug,
        email: restaurant.email,
        phone: restaurant.phone,
        addressLine1: restaurant.addressLine1,
        addressLine2: restaurant.addressLine2,
        city: restaurant.city,
        state: restaurant.state,
        country: restaurant.country,
        postalCode: restaurant.postalCode,
        subscriptionStatus: restaurant.subscriptionStatus,
        subscriptionPlan: restaurant.subscriptionPlan,
        subscriptionStartedAt: restaurant.subscriptionStartedAt,
        subscriptionRenewsAt: restaurant.subscriptionRenewsAt,
        timezone: restaurant.timezone,
        currency: restaurant.currency,
        isActive: restaurant.isActive,
        logoUrl: restaurant.logoUrl,
        bannerUrl: restaurant.bannerUrl,
        primaryColor: restaurant.primaryColor,
        secondaryColor: restaurant.secondaryColor,
        accentColor: restaurant.accentColor,
        branding: restaurant.branding,
      },
    };
  }

  /**
   * Obtiene la configuración completa del restaurante
   */
  async getSettings(restaurantId: string) {
    const restaurant = await this.restaurantsRepo.findOne({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return {
      id: restaurant.id,
      name: restaurant.name,
      legalName: restaurant.legalName,
      slug: restaurant.slug,
      email: restaurant.email,
      phone: restaurant.phone,
      addressLine1: restaurant.addressLine1,
      addressLine2: restaurant.addressLine2,
      city: restaurant.city,
      state: restaurant.state,
      country: restaurant.country,
      postalCode: restaurant.postalCode,
      timezone: restaurant.timezone,
      currency: restaurant.currency,
      logoUrl: restaurant.logoUrl,
      bannerUrl: restaurant.bannerUrl,
      primaryColor: restaurant.primaryColor,
      secondaryColor: restaurant.secondaryColor,
      accentColor: restaurant.accentColor,
      cardFeeMode: restaurant.cardFeeMode,
      cardFeePercent: parseFloat(restaurant.cardFeePercent),
      cardFeeFixed: parseFloat(restaurant.cardFeeFixed),
      platformFeePercent: parseFloat(restaurant.platformFeePercent),
      operatingHours: restaurant.operatingHours,
      branding: restaurant.branding,
      isActive: restaurant.isActive,
      subscriptionPlan: restaurant.subscriptionPlan,
      subscriptionStatus: restaurant.subscriptionStatus,
      subscriptionStartedAt: restaurant.subscriptionStartedAt,
      subscriptionRenewsAt: restaurant.subscriptionRenewsAt,
      createdAt: restaurant.createdAt,
      updatedAt: restaurant.updatedAt,
    };
  }

  /**
   * Lista restaurantes del tenant (multi-local)
   */
  async listRestaurants(tenantId: string) {
    if (!tenantId) {
      throw new NotFoundException('Tenant not assigned to user');
    }

    const restaurants = await this.restaurantsRepo.find({
      where: { tenantId },
      order: { createdAt: 'ASC' },
    });

    return restaurants.map((restaurant) => ({
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      isActive: restaurant.isActive,
    }));
  }

  /**
   * Actualiza la configuración del restaurante
   */
  async updateSettings(
    restaurantId: string,
    dto: UpdateRestaurantSettingsDto,
  ) {
    const restaurant = await this.restaurantsRepo.findOne({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    // Actualizar solo los campos que vienen en el DTO
    Object.assign(restaurant, {
      name: dto.name ?? restaurant.name,
      legalName: dto.legalName ?? restaurant.legalName,
      email: dto.email ?? restaurant.email,
      phone: dto.phone ?? restaurant.phone,
      addressLine1: dto.addressLine1 ?? restaurant.addressLine1,
      addressLine2: dto.addressLine2 ?? restaurant.addressLine2,
      city: dto.city ?? restaurant.city,
      state: dto.state ?? restaurant.state,
      country: dto.country ?? restaurant.country,
      postalCode: dto.postalCode ?? restaurant.postalCode,
      timezone: dto.timezone ?? restaurant.timezone,
      currency: dto.currency ?? restaurant.currency,
      cardFeeMode: dto.cardFeeMode ?? restaurant.cardFeeMode,
      cardFeePercent:
        dto.cardFeePercent !== undefined
          ? dto.cardFeePercent.toString()
          : restaurant.cardFeePercent,
      cardFeeFixed:
        dto.cardFeeFixed !== undefined
          ? dto.cardFeeFixed.toString()
          : restaurant.cardFeeFixed,
      platformFeePercent:
        dto.platformFeePercent !== undefined
          ? dto.platformFeePercent.toString()
          : restaurant.platformFeePercent,
      operatingHours: dto.operatingHours ?? restaurant.operatingHours,
      branding: dto.branding ?? restaurant.branding,
      isActive:
        dto.isActive !== undefined ? dto.isActive : restaurant.isActive,
    });

    const saved = await this.restaurantsRepo.save(restaurant);

    // Retornar la configuración actualizada
    return this.getSettings(saved.id);
  }
}
