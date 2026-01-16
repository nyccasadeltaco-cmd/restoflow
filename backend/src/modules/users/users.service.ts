import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import {
  findSupabaseUserIdByEmail,
  getSupabaseAdminClient,
} from '../../common/supabase/supabase-admin';

export interface CreateRestaurantOwnerDto {
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  restaurantId: string;
  tenantId?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll() {
    const users = await this.usersRepository.find();
    return users.map(({ password, ...user }) => user);
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) return null;
    const { password, ...rest } = user;
    return rest as User;
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(userData: Partial<User>) {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async update(id: string, userData: Partial<User>) {
    await this.usersRepository.update(id, userData);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.usersRepository.delete(id);
  }

  /**
   * Crear usuario dueño de restaurante (RESTAURANT_ADMIN)
   * Validaciones:
   * - Email no debe existir
   * - Genera contraseña temporal si no se proporciona
   * - Hashea la contraseña con bcrypt
   */
  async createRestaurantOwner(data: CreateRestaurantOwnerDto): Promise<User> {
    if (!data.tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    // Verificar que el email no exista
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException(`User with email ${data.email} already exists`);
    }

    // Generar contraseña temporal si no se proporciona
    const plainPassword = data.password || this.generateTemporaryPassword();

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Separar nombre completo en firstName y lastName
    const nameParts = data.fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || 'Sin Apellido';

    // Crear usuario con rol RESTAURANT_ADMIN
    const user = this.usersRepository.create({
      email: data.email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: data.phone,
      role: UserRole.RESTAURANT_ADMIN,
      restaurantId: data.restaurantId,
      tenantId: data.tenantId,
      isActive: true,
    });

    const savedUser = await this.usersRepository.save(user);

    await this.syncSupabasePassword(data.email, plainPassword);

    // Retornar usuario con la contraseña temporal en texto plano (para mostrarla al admin)
    // NOTA: Esta contraseña solo se devuelve en la creación, no se almacena en texto plano
    (savedUser as any).temporaryPassword = plainPassword ?? '';

    return savedUser;
  }

  /**
   * Asignar o actualizar el dueño de un restaurante
   * - Si el email no existe, crea un nuevo usuario RESTAURANT_ADMIN
   * - Si existe, lo actualiza para ser el owner del restaurante
   */
  async setRestaurantOwner(
    restaurantId: string,
    data: CreateRestaurantOwnerDto,
  ): Promise<{ user: User; temporaryPassword?: string }> {
    if (!data.tenantId) {
      throw new BadRequestException('tenantId is required');
    }

    // Buscar usuario por email
    let user = await this.findByEmail(data.email);
    let temporaryPassword: string | undefined;

    if (!user) {
      // Usuario no existe -> crear nuevo
      const plainPassword = data.password || this.generateTemporaryPassword();
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      // Separar nombre completo
      const nameParts = data.fullName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || 'Sin Apellido';

      user = this.usersRepository.create({
        email: data.email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: data.phone,
        role: UserRole.RESTAURANT_ADMIN,
        restaurantId,
        tenantId: data.tenantId,
        isActive: true,
      });

      await this.usersRepository.save(user);
      temporaryPassword = plainPassword;
      await this.syncSupabasePassword(user.email, plainPassword);
    } else {
      // Usuario existe -> actualizar
      const nameParts = data.fullName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || user.lastName;

      // Actualizar campos
      user.firstName = firstName;
      user.lastName = lastName;
      user.role = UserRole.RESTAURANT_ADMIN;
      user.restaurantId = restaurantId;
      user.tenantId = data.tenantId;
      user.isActive = true;

      if (data.phone) {
        user.phone = data.phone;
      }

      // Si se proporciona nueva contraseña, actualizarla
      if (data.password) {
        user.password = await bcrypt.hash(data.password, 10);
        temporaryPassword = data.password;
        await this.syncSupabasePassword(user.email, data.password);
      } else {
        const supabaseUserId = await this.getSupabaseUserId(user.email);
        if (!supabaseUserId) {
          const generatedPassword = this.generateTemporaryPassword();
          user.password = await bcrypt.hash(generatedPassword, 10);
          temporaryPassword = generatedPassword;
          await this.syncSupabasePassword(user.email, generatedPassword);
        }
      }

      await this.usersRepository.save(user);
    }

    return {
      user,
      temporaryPassword,
    };
  }

  /**
   * Resetear contraseña de un usuario
   * Solo puede ser llamado por SUPER_ADMIN
   */
  async resetUserPassword(userId: string, newPassword: string) {
    const user = await this.findOne(userId);
    
    if (!user) {
      throw new ConflictException('Usuario no encontrado');
    }

    // Hashear la nueva contraseña
    const password = await bcrypt.hash(newPassword, 10);

    // Actualizar el usuario
    await this.usersRepository.update(userId, {
      password,
    });

    if (user.email) {
      await this.syncSupabasePassword(user.email, newPassword);
    }

    return {
      message: 'Contraseña actualizada exitosamente',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }

  /**
   * Generar contraseña temporal aleatoria
   */
  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private async getSupabaseUserId(email?: string): Promise<string | null> {
    if (!email) {
      return null;
    }

    const adminClient = getSupabaseAdminClient();
    if (!adminClient) {
      return null;
    }

    return findSupabaseUserIdByEmail(adminClient, email);
  }

  async syncSupabasePassword(
    email: string | null | undefined,
    password: string,
  ) {
    if (!email) {
      return;
    }

    const adminClient = getSupabaseAdminClient();
    if (!adminClient) {
      return;
    }

    const userId = await this.getSupabaseUserId(email);

    if (userId) {
      const { error } = await adminClient.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
      });

      if (error) {
        throw new BadRequestException(
          `Supabase Auth update failed: ${error.message}`,
        );
      }

      return;
    }

    const { error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      throw new BadRequestException(
        `Supabase Auth create failed: ${error.message}`,
      );
    }
  }
}
