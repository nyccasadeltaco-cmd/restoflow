import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Restaurant } from './entities/restaurant.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { TenantUser } from '../tenants/entities/tenant_user.entity';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { CreateRestaurantWithOwnerDto } from './dto/create-restaurant-with-owner.dto';
import { UpdateAdminPasswordDto } from './dto/update-admin-password.dto';
import { UsersService } from '../users/users.service';

export interface RestaurantFilters {
  search?: string;
  subscriptionStatus?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantsRepository: Repository<Restaurant>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    @InjectRepository(TenantUser)
    private tenantUsersRepository: Repository<TenantUser>,
    private usersService: UsersService,
  ) {}

  /**
   * GET /master/restaurants
   * Lista con búsqueda y filtros
   */
  async findAll(filters: RestaurantFilters = {}) {
    const {
      search,
      subscriptionStatus,
      isActive,
      page = 1,
      limit = 10,
    } = filters;

    // Convertir page y limit a números
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const queryBuilder = this.restaurantsRepository.createQueryBuilder('restaurant');

    // Búsqueda por nombre, email, slug
    if (search) {
      queryBuilder.where(
        '(restaurant.name ILIKE :search OR restaurant.email ILIKE :search OR restaurant.slug ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Filtro por estado de suscripción
    if (subscriptionStatus) {
      queryBuilder.andWhere('restaurant.subscriptionStatus = :subscriptionStatus', {
        subscriptionStatus,
      });
    }

    // Filtro por activo/inactivo
    if (isActive !== undefined) {
      queryBuilder.andWhere('restaurant.isActive = :isActive', { isActive });
    }

    // Ordenar por fecha de creación (más recientes primero)
    queryBuilder.orderBy('restaurant.createdAt', 'DESC');

    // Paginación
    const skip = (pageNum - 1) * limitNum;
    queryBuilder.skip(skip).take(limitNum);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * GET /master/restaurants/:id
   * Obtener detalle de un restaurante
   */
  async findOne(id: string) {
    const restaurant = await this.restaurantsRepository.findOne({
      where: { id },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    return restaurant;
  }

  /**
   * POST /master/restaurants
   * Crear nuevo restaurante con usuario dueño
   * 
   * Este método:
   * 1. Crea el restaurante
   * 2. Genera slug automáticamente si no se proporciona
   * 3. Crea el usuario dueño con rol RESTAURANT_ADMIN
   * 4. Asocia el dueño al restaurante (restaurantId)
   * 5. Retorna tanto el restaurante como la info del dueño
   */
  async createWithOwner(dto: CreateRestaurantWithOwnerDto) {
    // 1. Generar slug si no se proporciona
    const slug = dto.slug || this.generateSlug(dto.name);
    
    // 2. Generar URL del panel automáticamente
    const panelUrl = this.generatePanelUrl(slug);

    // 3. Crear tenant primero (MVP 1:1)
    const existingTenant = await this.tenantsRepository.findOne({ where: { slug } });
    if (existingTenant) {
      throw new ConflictException(`Tenant with slug ${slug} already exists`);
    }

    const tenant = this.tenantsRepository.create({
      name: dto.name,
      slug,
      contactEmail: dto.email,
      contactPhone: dto.phone,
      isActive: true,
    });

    const savedTenant = await this.tenantsRepository.save(tenant);
    
    // 4. Crear el restaurante
    const restaurantData: Partial<Restaurant> = {
      tenantId: savedTenant.id,
      name: dto.name,
      slug: slug,
      panelUrl: panelUrl,
      email: dto.email,
      phone: dto.phone,
      subscriptionPlan: dto.subscriptionPlan || 'TRIAL',
      subscriptionStatus: dto.subscriptionStatus || 'TRIAL',
      cardFeeMode: dto.cardFeeMode || 'CLIENT',
      cardFeePercent: dto.cardFeePercent?.toString() || '0',
      platformFeePercent: dto.platformFeePercent?.toString() || '0',
      currency: dto.currency || 'USD',
      timezone: dto.timezone || 'America/Mexico_City',
      // Branding
      logoUrl: dto.logoUrl,
      bannerUrl: dto.bannerUrl,
      primaryColor: dto.primaryColor,
      secondaryColor: dto.secondaryColor,
      accentColor: dto.accentColor,
      branding: dto.branding,
      isActive: true,
    };

    const restaurant = this.restaurantsRepository.create(restaurantData);
    const savedRestaurant = await this.restaurantsRepository.save(restaurant);

    // 4. Crear el usuario dueño con rol RESTAURANT_ADMIN
    const ownerUser = await this.usersService.createRestaurantOwner({
      fullName: dto.ownerFullName,
      email: dto.ownerEmail,
      password: dto.ownerPassword, // Si es undefined, se genera automáticamente
      phone: dto.ownerPhone,
      restaurantId: savedRestaurant.id,
      tenantId: savedTenant.id,
    });

    // 6. Asociar usuario al tenant
    await this.tenantUsersRepository.save(
      this.tenantUsersRepository.create({
        tenantId: savedTenant.id,
        userId: ownerUser.id,
        isActive: true,
        role: 'owner',
      }),
    );

    // 7. Actualizar el campo ownerUserId del restaurante
    savedRestaurant.ownerUserId = ownerUser.id;
    await this.restaurantsRepository.save(savedRestaurant);

    // 8. Guardar defaultRestaurantId en el tenant (MVP 1:1)
    savedTenant.defaultRestaurantId = savedRestaurant.id;
    await this.tenantsRepository.save(savedTenant);

    // 6. Retornar objeto con restaurante y datos del dueño (sin password hash)
    const response = {
      tenant: {
        id: savedTenant.id,
        name: savedTenant.name ?? '',
        slug: savedTenant.slug ?? '',
        defaultRestaurantId: savedTenant.defaultRestaurantId ?? null,
      },
      restaurant: {
        id: savedRestaurant.id,
        name: savedRestaurant.name ?? '',
        slug: savedRestaurant.slug ?? '',
      },
      admin: {
        id: ownerUser.id,
        email: ownerUser.email ?? '',
        tempPassword: (ownerUser as any).temporaryPassword ?? '',
      },
    };
    console.log('[RESTAURANT CREATE RESPONSE]', JSON.stringify(response));
    return response;
  }

  /**
   * POST /master/restaurants
   * Crear nuevo restaurante (método simple sin owner)
   */
  async create(restaurantData: Partial<Restaurant>) {
    // Generar slug si no se proporciona
    if (!restaurantData.slug && restaurantData.name) {
      restaurantData.slug = this.generateSlug(restaurantData.name);
    }
    
    // Generar panelUrl si no se proporciona
    if (!restaurantData.panelUrl && restaurantData.slug) {
      restaurantData.panelUrl = this.generatePanelUrl(restaurantData.slug);
    }

    if (!restaurantData.tenantId) {
      throw new BadRequestException('tenantId is required');
    }

    const restaurant = this.restaurantsRepository.create(restaurantData);
    return this.restaurantsRepository.save(restaurant);
  }

  /**
   * PATCH /master/restaurants/:id
   * Actualizar información general del restaurante
   */
  async update(id: string, restaurantData: Partial<Restaurant>) {
    const restaurant = await this.findOne(id);

    // Si se actualiza el nombre y no se proporciona slug, regenerar slug
    if (restaurantData.name && !restaurantData.slug) {
      restaurantData.slug = this.generateSlug(restaurantData.name);
    }

    Object.assign(restaurant, restaurantData);
    return this.restaurantsRepository.save(restaurant);
  }

  /**
   * PATCH /master/restaurants/:id/subscription
   * Actualizar estado de suscripción
   */
  async updateSubscription(id: string, subscriptionData: UpdateSubscriptionDto) {
    const restaurant = await this.findOne(id);

    // Actualizar campos de suscripción
    restaurant.subscriptionStatus = subscriptionData.subscriptionStatus;

    if (subscriptionData.subscriptionPlan !== undefined) {
      restaurant.subscriptionPlan = subscriptionData.subscriptionPlan;
    }

    if (subscriptionData.subscriptionStartedAt !== undefined) {
      restaurant.subscriptionStartedAt = subscriptionData.subscriptionStartedAt;
    }

    if (subscriptionData.subscriptionRenewsAt !== undefined) {
      restaurant.subscriptionRenewsAt = subscriptionData.subscriptionRenewsAt;
    }

    // Si el estado es HOLD, guardar la razón
    if (subscriptionData.subscriptionStatus === 'HOLD') {
      restaurant.holdReason = subscriptionData.holdReason || null;
    } else {
      // Si no está en HOLD, limpiar la razón
      restaurant.holdReason = null;
    }

    return this.restaurantsRepository.save(restaurant);
  }

  /**
   * DELETE /master/restaurants/:id
   * Desactivar restaurante (soft delete)
   */
  async remove(id: string) {
    const restaurant = await this.findOne(id);
    restaurant.isActive = false;
    await this.restaurantsRepository.save(restaurant);
    return { message: 'Restaurant deactivated successfully' };
  }

  /**
   * Reactivar un restaurante desactivado
   */
  async activate(id: string) {
    const restaurant = await this.findOne(id);
    restaurant.isActive = true;
    await this.restaurantsRepository.save(restaurant);
    return restaurant;
  }

  /**
   * POST /master/restaurants/:id/owner
   * Asignar o cambiar el dueño de un restaurante
   * 
   * Este método:
   * 1. Verifica que el restaurante exista
   * 2. Si el email no existe, crea un nuevo usuario RESTAURANT_ADMIN
   * 3. Si existe, actualiza el usuario para ser owner de este restaurante
   * 4. Actualiza el campo ownerUserId del restaurante
   * 5. Retorna el restaurante y datos del owner
   */
  async setOwner(restaurantId: string, ownerData: { fullName: string; email: string; password?: string; phone?: string }) {
    // 1. Verificar que el restaurante exista
    const restaurant = await this.findOne(restaurantId);

    if (!restaurant.tenantId) {
      throw new BadRequestException('Restaurant missing tenantId');
    }

    // 2. Crear o actualizar el usuario owner
    const { user: ownerUser, temporaryPassword } = await this.usersService.setRestaurantOwner(
      restaurantId,
      {
        fullName: ownerData.fullName,
        email: ownerData.email,
        password: ownerData.password,
        phone: ownerData.phone,
        restaurantId,
        tenantId: restaurant.tenantId,
      }
    );

    // 2b. Asegurar membresia del tenant
    const existingMembership = await this.tenantUsersRepository.findOne({
      where: { tenantId: restaurant.tenantId, userId: ownerUser.id },
    });
    if (!existingMembership) {
      await this.tenantUsersRepository.save(
        this.tenantUsersRepository.create({
          tenantId: restaurant.tenantId,
          userId: ownerUser.id,
          isActive: true,
          role: 'owner',
        }),
      );
    }

    // 3. Actualizar el campo ownerUserId del restaurante
    restaurant.ownerUserId = ownerUser.id;
    await this.restaurantsRepository.save(restaurant);

    // 4. Retornar respuesta con restaurante y owner
    return {
      restaurantId: restaurant.id,
      ownerUser: {
        id: ownerUser.id,
        fullName: `${ownerUser.firstName} ${ownerUser.lastName}`,
        email: ownerUser.email,
        role: ownerUser.role,
        restaurantId: ownerUser.restaurantId,
        phone: ownerUser.phone,
        ...(temporaryPassword && { temporaryPassword }), // Solo incluir si hay contraseña temporal
      },
    };
  }

  /**
   * Generar slug a partir del nombre
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^\w\s-]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
      .trim();
  }

  /**
   * PATCH /master/restaurants/:id/admin-password
   * Cambia la contraseña del administrador del restaurante (solo SUPER_ADMIN)
   */
  async updateAdminPassword(
    restaurantId: string,
    dto: UpdateAdminPasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    // 1. Verificar que el restaurante existe
    const restaurant = await this.restaurantsRepository.findOne({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    // 2. Buscar el usuario RESTAURANT_ADMIN de este restaurante
    const adminUser = await this.usersRepository.findOne({
      where: {
        restaurantId: restaurant.id,
        role: UserRole.RESTAURANT_ADMIN,
      },
    });

    if (!adminUser) {
      throw new ConflictException(
        'No se encontró administrador para este restaurante',
      );
    }

    // 3. Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // 4. Actualizar el password del usuario
    adminUser.password = hashedPassword;
    await this.usersRepository.save(adminUser);

    return {
      success: true,
      message: `Contraseña actualizada para ${adminUser.email}`,
    };
  }

  /**
   * Generar URL del panel del restaurante
   * Formato: http://localhost:65456/#/r/{slug}/login
   * En producción sería: https://admin.restafolow.com/r/{slug}/login
   */
  private generatePanelUrl(slug: string): string {
    const baseUrl = process.env.RESTAURANT_PANEL_BASE_URL || 'http://localhost:65456';
    return `${baseUrl}/#/r/${slug}/login`;
  }
}
