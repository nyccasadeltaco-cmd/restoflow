import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Menu } from '../menus/entities/menu.entity';
import { MenuCategory } from '../menus/entities/menu-category.entity';
import { MenuItem } from '../menus/entities/menu-item.entity';
import { FeaturedSection } from '../featured/entities/featured-section.entity';
import { FeaturedItem, FeaturedItemType } from '../featured/entities/featured-item.entity';
import { Combo } from '../featured/entities/combo.entity';
import { ComboItem } from '../featured/entities/combo-item.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';

@Controller('public')
export class PublicRestaurantsController {
  constructor(
    @InjectRepository(Restaurant) private readonly restaurantsRepo: Repository<Restaurant>,
    @InjectRepository(Menu) private readonly menusRepo: Repository<Menu>,
    @InjectRepository(MenuCategory) private readonly categoriesRepo: Repository<MenuCategory>,
    @InjectRepository(MenuItem) private readonly itemsRepo: Repository<MenuItem>,
    @InjectRepository(FeaturedSection)
    private readonly featuredSectionsRepo: Repository<FeaturedSection>,
    @InjectRepository(FeaturedItem)
    private readonly featuredItemsRepo: Repository<FeaturedItem>,
    @InjectRepository(Combo)
    private readonly combosRepo: Repository<Combo>,
    @InjectRepository(ComboItem)
    private readonly comboItemsRepo: Repository<ComboItem>,
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepo: Repository<OrderItem>,
  ) {}

  @Get('restaurants/:slug')
  async getRestaurant(@Param('slug') slug: string) {
    const restaurant = await this.restaurantsRepo.findOne({ where: { slug } });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    return {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      phone: restaurant.phone,
      email: restaurant.email,
      addressLine1: restaurant.addressLine1,
      city: restaurant.city,
      state: restaurant.state,
      postalCode: restaurant.postalCode,
      operatingHours: restaurant.operatingHours,
      logoUrl: restaurant.logoUrl,
      bannerUrl: restaurant.bannerUrl,
      primaryColor: restaurant.primaryColor,
      secondaryColor: restaurant.secondaryColor,
      accentColor: restaurant.accentColor,
      branding: restaurant.branding,
      isActive: restaurant.isActive,
    };
  }

  // opcional: includeUnavailable=1 para ver items no disponibles
  @Get('restaurants/:slug/menu')
  async getMenu(@Param('slug') slug: string, @Query('includeUnavailable') includeUnavailable?: string) {
    const restaurant = await this.restaurantsRepo.findOne({ where: { slug } });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    // menus.restaurantId es varchar, restaurant.id es uuid (string) => match como string
    let menu = await this.menusRepo.findOne({
      where: { restaurantId: restaurant.id, isActive: true },
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });
    if (!menu) {
      menu = await this.menusRepo.findOne({
        where: { restaurantId: restaurant.id },
        order: { displayOrder: 'ASC', createdAt: 'ASC' },
      });
    }
    if (!menu) {
      menu = await this.menusRepo.findOne({
        where: { restaurantId: restaurant.slug },
        order: { displayOrder: 'ASC', createdAt: 'ASC' },
      });
    }
    if (!menu) throw new NotFoundException('Menu not found for restaurant');

    const categories = await this.categoriesRepo.find({
      where: { menuId: menu.id, isActive: true },
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });
    const categoryIds = categories.map((c) => c.id);

    const itemsWhere: any = { isActive: true };
    if (categoryIds.length > 0) itemsWhere.categoryId = In(categoryIds);
    // por defecto solo disponibles
    if (includeUnavailable !== '1') itemsWhere.isAvailable = true;

    const items = categoryIds.length === 0
      ? []
      : await this.itemsRepo.find({
          where: itemsWhere,
          order: { displayOrder: 'ASC', createdAt: 'ASC' },
        });

    return {
      restaurant: { id: restaurant.id, name: restaurant.name, slug: restaurant.slug },
      menu: { id: menu.id, name: menu.name },
      categories,
      items,
    };
  }

  @Get('restaurants/:slug/featured')
  async getFeatured(@Param('slug') slug: string) {
    const restaurant = await this.restaurantsRepo.findOne({ where: { slug } });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    const sections = await this.featuredSectionsRepo.find({
      where: { restaurantId: restaurant.id, isEnabled: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });

    const sectionList = sections.length > 0
      ? sections
      : [
          {
            id: 'favorites',
            restaurantId: restaurant.id,
            key: 'favorites',
            title: 'Favoritos de la Casa',
            isEnabled: true,
            sortOrder: 0,
          } as FeaturedSection,
          {
            id: 'combos',
            restaurantId: restaurant.id,
            key: 'combos',
            title: 'Combos',
            isEnabled: true,
            sortOrder: 1,
          } as FeaturedSection,
          {
            id: 'daily',
            restaurantId: restaurant.id,
            key: 'daily',
            title: 'Plato del dia',
            isEnabled: true,
            sortOrder: 2,
          } as FeaturedSection,
        ];

    const now = new Date();
    const manualItems = await this.featuredItemsRepo.find({
      where: { restaurantId: restaurant.id, isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });

    const manualActive = manualItems.filter((item) => {
      if (item.startsAt && item.startsAt > now) return false;
      if (item.endsAt && item.endsAt < now) return false;
      return true;
    });

    const resultSections = [];
    for (const section of sectionList) {
      const sectionItems = manualActive.filter((item) => item.sectionKey === section.key);

      if (section.key === 'favorites' && sectionItems.length === 0) {
        const autoFavorites = await this.buildAutoFavorites(restaurant.id);
        resultSections.push({
          key: section.key,
          title: section.title,
          items: autoFavorites,
        });
        continue;
      }

      if (section.key === 'combos' && sectionItems.length === 0) {
        const comboItems = await this.buildComboItems(restaurant.id);
        if (comboItems.length > 0) {
          resultSections.push({
            key: section.key,
            title: section.title,
            items: comboItems,
          });
          continue;
        }
      }

      const mapped = await this.mapFeaturedItems(sectionItems);
      resultSections.push({
        key: section.key,
        title: section.title,
        items: mapped,
      });
    }

    return { sections: resultSections };
  }

  private async buildAutoFavorites(restaurantId: string) {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const rows = await this.orderItemsRepo
      .createQueryBuilder('oi')
      .innerJoin(Order, 'o', 'o.id = oi.orderId')
      .select('oi.menuItemId', 'menuItemId')
      .addSelect('SUM(oi.quantity)', 'qty')
      .where('o.restaurantId = :restaurantId', { restaurantId })
      .andWhere('o.status != :canceled', { canceled: 'CANCELED' })
      .andWhere('o.createdAt >= :since', { since })
      .andWhere('oi.itemType = :itemType', { itemType: 'menu_item' })
      .groupBy('oi.menuItemId')
      .orderBy('qty', 'DESC')
      .limit(8)
      .getRawMany<{ menuItemId: string }>();

    if (rows.length === 0) return [];
    const ids = rows.map((row) => row.menuItemId);
    const items = await this.itemsRepo.find({
      where: { id: In(ids), isActive: true, isAvailable: true },
    });
    const itemById = new Map(items.map((item) => [item.id, item]));

    return ids
      .map((id) => itemById.get(id))
      .filter((item): item is MenuItem => Boolean(item))
      .map((item) => ({
        type: FeaturedItemType.MENU_ITEM,
        id: item.id,
        title: item.name,
        subtitle: item.description,
        price: Number(item.price),
        imageUrl: item.imageUrl,
        ctaLabel: 'Order',
        requiresConfiguration: false,
      }));
  }

  private async buildComboItems(restaurantId: string) {
    const combos = await this.combosRepo.find({
      where: { restaurantId, isActive: true, isAvailable: true },
      order: { createdAt: 'ASC' },
    });
    if (combos.length === 0) return [];
    const comboIds = combos.map((combo) => combo.id);
    const comboItems = await this.comboItemsRepo.find({
      where: { comboId: In(comboIds) },
    });
    const comboGroups = comboItems.reduce<Record<string, ComboItem[]>>((acc, item) => {
      acc[item.comboId] = acc[item.comboId] ?? [];
      acc[item.comboId].push(item);
      return acc;
    }, {});

    return combos.map((combo) => {
      const items = comboGroups[combo.id] ?? [];
      const requiresConfiguration = items.some(
        (item) =>
          item.isOptional ||
          item.minSelect != null ||
          item.maxSelect != null,
      );
      return {
        type: FeaturedItemType.COMBO,
        id: combo.id,
        title: combo.name,
        subtitle: combo.description,
        price: Number(combo.price),
        imageUrl: combo.imageUrl,
        ctaLabel: 'Order',
        requiresConfiguration,
      };
    });
  }

  private async mapFeaturedItems(featuredItems: FeaturedItem[]) {
    if (featuredItems.length === 0) return [];
    const menuItemIds = featuredItems
      .filter((item) => item.type === FeaturedItemType.MENU_ITEM && item.refId)
      .map((item) => item.refId);
    const comboIds = featuredItems
      .filter((item) => item.type === FeaturedItemType.COMBO && item.refId)
      .map((item) => item.refId);

    const menuItems = menuItemIds.length > 0
      ? await this.itemsRepo.find({ where: { id: In(menuItemIds) } })
      : [];
    const combos = comboIds.length > 0
      ? await this.combosRepo.find({ where: { id: In(comboIds) } })
      : [];
    const menuById = new Map(menuItems.map((item) => [item.id, item]));
    const comboById = new Map(combos.map((combo) => [combo.id, combo]));

    return featuredItems.map((item) => {
      if (item.type === FeaturedItemType.MENU_ITEM && item.refId) {
        const menuItem = menuById.get(item.refId);
        return {
          type: item.type,
          id: item.refId,
          title: item.titleOverride || menuItem?.name || '',
          subtitle: item.subtitleOverride || menuItem?.description,
          price: item.priceOverride != null
            ? Number(item.priceOverride)
            : Number(menuItem?.price ?? 0),
          imageUrl: item.imageUrlOverride || menuItem?.imageUrl,
          ctaLabel: item.ctaLabel || 'Order',
          requiresConfiguration: false,
        };
      }

      if (item.type === FeaturedItemType.COMBO && item.refId) {
        const combo = comboById.get(item.refId);
        return {
          type: item.type,
          id: item.refId,
          title: item.titleOverride || combo?.name || '',
          subtitle: item.subtitleOverride || combo?.description,
          price: item.priceOverride != null
            ? Number(item.priceOverride)
            : Number(combo?.price ?? 0),
          imageUrl: item.imageUrlOverride || combo?.imageUrl,
          ctaLabel: item.ctaLabel || 'Order',
          requiresConfiguration: true,
        };
      }

      return {
        type: item.type,
        id: item.refId || item.id,
        title: item.titleOverride || 'Promo',
        subtitle: item.subtitleOverride,
        price: item.priceOverride != null ? Number(item.priceOverride) : 0,
        imageUrl: item.imageUrlOverride,
        ctaLabel: item.ctaLabel || 'Order',
        requiresConfiguration: true,
      };
    });
  }
}
