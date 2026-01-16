import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Menu } from '../menus/entities/menu.entity';
import { MenuCategory } from '../menus/entities/menu-category.entity';
import { MenuItem } from '../menus/entities/menu-item.entity';
import { randomUUID } from 'crypto';
import {
  CreateMenuCategoryDto,
  UpdateMenuCategoryDto,
} from './dto/menu-category.dto';
import {
  CreateMenuItemDto,
  UpdateMenuItemDto,
} from './dto/menu-item.dto';
import { MenuImageUploadDto } from './dto/menu-image.dto';
import { getSupabaseAdminClient } from '../../common/supabase/supabase-admin';

@Injectable()
export class RestaurantMenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menusRepo: Repository<Menu>,
    @InjectRepository(MenuCategory)
    private readonly categoriesRepo: Repository<MenuCategory>,
    @InjectRepository(MenuItem)
    private readonly itemsRepo: Repository<MenuItem>,
  ) {}

  /**
   * Obtiene o crea el menú principal del restaurante
   */
  private async getOrCreateMenu(restaurantId: string): Promise<Menu> {
    let menu = await this.menusRepo.findOne({
      where: { restaurantId, isActive: true },
      order: { displayOrder: 'ASC' },
    });

    if (!menu) {
      // Crear menú por defecto si no existe
      menu = this.menusRepo.create({
        restaurantId,
        name: 'Menú Principal',
        description: 'Menú del restaurante',
        isActive: true,
        displayOrder: 0,
      });
      menu = await this.menusRepo.save(menu);
    }

    return menu;
  }

  // ==================== CATEGORÍAS ====================

  /**
   * Lista todas las categorías del menú del restaurante
   */
  async listCategories(restaurantId: string) {
    const menu = await this.getOrCreateMenu(restaurantId);

    return this.categoriesRepo.find({
      where: { menuId: menu.id },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Crea una nueva categoría en el menú
   */
  async createCategory(
    restaurantId: string,
    dto: CreateMenuCategoryDto,
  ) {
    const menu = await this.getOrCreateMenu(restaurantId);

    const category = this.categoriesRepo.create({
      menuId: menu.id,
      name: dto.name,
      description: dto.description,
      imageUrl: dto.imageUrl,
      displayOrder: dto.displayOrder ?? 0,
      isActive: dto.isActive ?? true,
    });

    return this.categoriesRepo.save(category);
  }

  /**
   * Actualiza una categoría existente
   */
  async updateCategory(
    restaurantId: string,
    categoryId: string,
    dto: UpdateMenuCategoryDto,
  ) {
    const menu = await this.getOrCreateMenu(restaurantId);

    const category = await this.categoriesRepo.findOne({
      where: { id: categoryId, menuId: menu.id },
    });

    if (!category) {
      throw new NotFoundException('Category not found or does not belong to this restaurant');
    }

    Object.assign(category, {
      name: dto.name ?? category.name,
      description: dto.description ?? category.description,
      imageUrl: dto.imageUrl ?? category.imageUrl,
      displayOrder:
        dto.displayOrder !== undefined
          ? dto.displayOrder
          : category.displayOrder,
      isActive:
        dto.isActive !== undefined ? dto.isActive : category.isActive,
    });

    return this.categoriesRepo.save(category);
  }

  // ==================== ITEMS ====================

  /**
   * Lista items del menú con filtros opcionales
   */
  async listItems(
    restaurantId: string,
    opts: { categoryId?: string; search?: string; isAvailable?: boolean },
  ) {
    const menu = await this.getOrCreateMenu(restaurantId);

    // Obtener todas las categorías del restaurante
    const categories = await this.categoriesRepo.find({
      where: { menuId: menu.id },
    });

    if (categories.length === 0) {
      return [];
    }

    const categoryIds = categories.map((c) => c.id);

    // Construir condiciones de búsqueda
    const where: any = {
      categoryId: opts.categoryId
        ? opts.categoryId
        : categoryIds.length === 1
        ? categoryIds[0]
        : undefined,
    };

    // Si no hay categoryId específico y hay múltiples categorías, buscar en todas
    if (!opts.categoryId && categoryIds.length > 1) {
      delete where.categoryId;
    }

    if (opts.isAvailable !== undefined) {
      where.isAvailable = opts.isAvailable;
    }

    if (opts.search) {
      where.name = ILike(`%${opts.search}%`);
    }

    // Si tenemos múltiples categorías y no hay filtro específico, hacer búsqueda manual
    if (!opts.categoryId && categoryIds.length > 1) {
      const queryBuilder = this.itemsRepo.createQueryBuilder('item');
      queryBuilder.where('item.categoryId IN (:...categoryIds)', {
        categoryIds,
      });

      if (opts.isAvailable !== undefined) {
        queryBuilder.andWhere('item.isAvailable = :isAvailable', {
          isAvailable: opts.isAvailable,
        });
      }

      if (opts.search) {
        queryBuilder.andWhere('item.name ILIKE :search', {
          search: `%${opts.search}%`,
        });
      }

      queryBuilder.orderBy('item.displayOrder', 'ASC');
      queryBuilder.addOrderBy('item.name', 'ASC');

      return queryBuilder.getMany();
    }

    return this.itemsRepo.find({
      where,
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Crea un nuevo item en el menú
   */
  async createItem(restaurantId: string, dto: CreateMenuItemDto) {
    const menu = await this.getOrCreateMenu(restaurantId);

    // Verificar que la categoría pertenece al menú del restaurante
    const category = await this.categoriesRepo.findOne({
      where: { id: dto.categoryId, menuId: menu.id },
    });

    if (!category) {
      throw new BadRequestException(
        'Category not found or does not belong to this restaurant',
      );
    }

    const item = this.itemsRepo.create({
      categoryId: dto.categoryId,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      imageUrl: dto.imageUrl,
      isAvailable: dto.isAvailable ?? true,
      isActive: dto.isActive ?? true,
      displayOrder: dto.displayOrder ?? 0,
      allergens: dto.allergens ?? [],
      tags: dto.tags ?? [],
      preparationTime: dto.preparationTime,
    });

    return this.itemsRepo.save(item);
  }

  /**
   * Actualiza un item existente
   */
  async updateItem(
    restaurantId: string,
    itemId: string,
    dto: UpdateMenuItemDto,
  ) {
    const menu = await this.getOrCreateMenu(restaurantId);

    // Obtener el item y verificar que pertenece al restaurante
    const item = await this.itemsRepo.findOne({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Menu item not found');
    }

    // Verificar que la categoría actual del item pertenece al menú del restaurante
    const currentCategory = await this.categoriesRepo.findOne({
      where: { id: item.categoryId, menuId: menu.id },
    });

    if (!currentCategory) {
      throw new NotFoundException(
        'Item does not belong to this restaurant',
      );
    }

    // Si se está cambiando de categoría, verificar que la nueva también pertenece al restaurante
    if (dto.categoryId && dto.categoryId !== item.categoryId) {
      const newCategory = await this.categoriesRepo.findOne({
        where: { id: dto.categoryId, menuId: menu.id },
      });

      if (!newCategory) {
        throw new BadRequestException(
          'New category not found or does not belong to this restaurant',
        );
      }
    }

    Object.assign(item, {
      categoryId: dto.categoryId ?? item.categoryId,
      name: dto.name ?? item.name,
      description: dto.description ?? item.description,
      price: dto.price ?? item.price,
      imageUrl: dto.imageUrl ?? item.imageUrl,
      isAvailable:
        dto.isAvailable !== undefined
          ? dto.isAvailable
          : item.isAvailable,
      isActive:
        dto.isActive !== undefined ? dto.isActive : item.isActive,
      displayOrder:
        dto.displayOrder !== undefined
          ? dto.displayOrder
          : item.displayOrder,
      allergens: dto.allergens ?? item.allergens,
      tags: dto.tags ?? item.tags,
      preparationTime:
        dto.preparationTime ?? item.preparationTime,
    });

    return this.itemsRepo.save(item);
  }

  async uploadMenuImage(restaurantId: string, dto: MenuImageUploadDto) {
    const client = getSupabaseAdminClient();
    if (!client) {
      throw new BadRequestException('Supabase admin no configurado');
    }

    const imageBuffer = this._decodeBase64(dto.imageBase64);
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new BadRequestException('Imagen invalida');
    }

    const safeName = this._sanitizeFileName(dto.fileName);
    const itemId = dto.itemId?.trim();
    const fileId = itemId && itemId.length > 0 ? itemId : randomUUID();
    const fileSlug =
      itemId && itemId.length > 0
        ? fileId
        : `${fileId}-${this._stripExtension(safeName)}`;
    const path = `restaurants/${restaurantId}/menu/${fileSlug}.jpg`;

    const bucket = 'product-images';
    const { error } = await client.storage.from(bucket).upload(path, imageBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

    if (error) {
      throw new BadRequestException(`No se pudo subir la imagen: ${error.message}`);
    }

    const { data } = client.storage.from(bucket).getPublicUrl(path);
    return { publicUrl: data.publicUrl, path };
  }

  private _decodeBase64(value: string): Buffer {
    const trimmed = value.trim();
    const commaIndex = trimmed.indexOf(',');
    const base64 = commaIndex >= 0 ? trimmed.substring(commaIndex + 1) : trimmed;
    return Buffer.from(base64, 'base64');
  }

  private _sanitizeFileName(name: string): string {
    const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, '_');
    return cleaned.length > 0 ? cleaned.toLowerCase() : 'image';
  }

  private _stripExtension(name: string): string {
    const dot = name.lastIndexOf('.');
    if (dot <= 0) {
      return name;
    }
    return name.substring(0, dot);
  }
}
