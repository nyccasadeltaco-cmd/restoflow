import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Restaurant } from '../restaurants/entities/restaurant.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Restaurant)
    private restaurantsRepository: Repository<Restaurant>,
  ) {}

  /**
   * Valida las credenciales del usuario
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { email } });
    
    if (!user) {
      return null;
    }

    if (!user.isActive) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }

    // Retornar usuario sin la contraseña
    const { password: _, ...result } = user;
    return result;
  }

  /**
   * Login con email + password
   * Devuelve token JWT y datos básicos del usuario
   */
  async login(user: any) {
    // Validaciones de negocio
    if (!user.isActive) {
      throw new ForbiddenException('Usuario desactivado');
    }

    // Reglas de restaurantId por rol
    if (user.role === UserRole.SUPER_ADMIN && user.restaurantId) {
      // SUPER_ADMIN no debe tener restaurantId
      user.restaurantId = null;
    }

    if (
      (user.role === UserRole.RESTAURANT_ADMIN || user.role === UserRole.STAFF) &&
      !user.restaurantId
    ) {
      throw new ForbiddenException(
        'Usuario de restaurante sin restaurantId asignado',
      );
    }

    let tenantId = user.tenantId;
    if (!tenantId && user.restaurantId) {
      const restaurant = await this.restaurantsRepository.findOne({
        where: { id: user.restaurantId },
      });
      tenantId = restaurant?.tenantId ?? null;
    }

    const payload: JwtPayload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role, 
      tenantId: tenantId ?? null,
      restaurantId: user.restaurantId, // Siempre incluir, incluso si es null
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        tenantId: tenantId ?? null,
        restaurantId: user.restaurantId,
      },
    };
  }

  /**
   * Selecciona un restaurante activo y devuelve un nuevo JWT
   */
  async selectRestaurant(user: any, restaurantId: string) {
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.CLIENT) {
      throw new ForbiddenException('Role not allowed to select restaurant');
    }

    const tenantId = user.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Tenant not resolved for user');
    }

    const restaurant = await this.restaurantsRepository.findOne({
      where: { id: restaurantId, tenantId },
    });
    if (!restaurant) {
      throw new ForbiddenException('Restaurant not accessible for tenant');
    }

    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      tenantId,
      restaurantId: restaurant.id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        tenantId,
        restaurantId: restaurant.id,
      },
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
      },
    };
  }

  /**
   * Valida un usuario por ID (usado por JWT Strategy)
   */
  async validateUserById(userId: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user || !user.isActive) {
      return null;
    }
    return user;
  }

  /**
   * Busca un usuario por email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  /**
   * Hash de contraseña
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Compara contraseñas
   */
  async comparePasswords(plainText: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashed);
  }
}
