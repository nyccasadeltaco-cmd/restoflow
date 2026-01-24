import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeaturedSection } from './entities/featured-section.entity';
import { FeaturedItem, FeaturedItemType } from './entities/featured-item.entity';
import { Combo } from './entities/combo.entity';
import { ComboItem } from './entities/combo-item.entity';
import { CreateFeaturedItemDto, UpdateFeaturedItemDto } from './dto/featured-item.dto';
import { UpsertFeaturedSectionDto } from './dto/featured-section.dto';
import { CreateComboDto, UpdateComboDto } from './dto/combo.dto';
import { CreateComboItemDto, UpdateComboItemDto } from './dto/combo-item.dto';

@Injectable()
export class FeaturedService {
  constructor(
    @InjectRepository(FeaturedSection)
    private readonly sectionsRepo: Repository<FeaturedSection>,
    @InjectRepository(FeaturedItem)
    private readonly itemsRepo: Repository<FeaturedItem>,
    @InjectRepository(Combo)
    private readonly combosRepo: Repository<Combo>,
    @InjectRepository(ComboItem)
    private readonly comboItemsRepo: Repository<ComboItem>,
  ) {}

  getSections(restaurantId: string) {
    return this.sectionsRepo.find({
      where: { restaurantId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async upsertSection(restaurantId: string, dto: UpsertFeaturedSectionDto) {
    const existing = await this.sectionsRepo.findOne({
      where: { restaurantId, key: dto.key },
    });
    if (existing) {
      Object.assign(existing, {
        title: dto.title ?? existing.title,
        isEnabled: dto.isEnabled ?? existing.isEnabled,
        sortOrder: dto.sortOrder ?? existing.sortOrder,
      });
      return this.sectionsRepo.save(existing);
    }

    const section = this.sectionsRepo.create({
      restaurantId,
      key: dto.key,
      title: dto.title,
      isEnabled: dto.isEnabled ?? true,
      sortOrder: dto.sortOrder ?? 0,
    });
    return this.sectionsRepo.save(section);
  }

  getItems(restaurantId: string, sectionKey?: string) {
    const where = sectionKey
      ? { restaurantId, sectionKey }
      : { restaurantId };
    return this.itemsRepo.find({
      where,
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async createItem(restaurantId: string, dto: CreateFeaturedItemDto) {
    if (dto.type !== FeaturedItemType.CUSTOM && !dto.refId) {
      throw new BadRequestException('refId is required for menu_item/combo');
    }
    const item = this.itemsRepo.create({
      restaurantId,
      sectionKey: dto.sectionKey,
      type: dto.type,
      refId: dto.refId ?? null,
      titleOverride: dto.titleOverride ?? null,
      subtitleOverride: dto.subtitleOverride ?? null,
      imageUrlOverride: dto.imageUrlOverride ?? null,
      priceOverride: dto.priceOverride ?? null,
      ctaLabel: dto.ctaLabel ?? 'Order',
      isActive: dto.isActive ?? true,
      sortOrder: dto.sortOrder ?? 0,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
    });
    return this.itemsRepo.save(item);
  }

  async updateItem(restaurantId: string, id: string, dto: UpdateFeaturedItemDto) {
    const item = await this.itemsRepo.findOne({ where: { id, restaurantId } });
    if (!item) throw new NotFoundException('Featured item not found');
    Object.assign(item, {
      sectionKey: dto.sectionKey ?? item.sectionKey,
      type: dto.type ?? item.type,
      refId: dto.refId ?? item.refId,
      titleOverride: dto.titleOverride ?? item.titleOverride,
      subtitleOverride: dto.subtitleOverride ?? item.subtitleOverride,
      imageUrlOverride: dto.imageUrlOverride ?? item.imageUrlOverride,
      priceOverride: dto.priceOverride ?? item.priceOverride,
      ctaLabel: dto.ctaLabel ?? item.ctaLabel,
      isActive: dto.isActive ?? item.isActive,
      sortOrder: dto.sortOrder ?? item.sortOrder,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : item.startsAt,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : item.endsAt,
    });
    if (item.type !== FeaturedItemType.CUSTOM && !item.refId) {
      throw new BadRequestException('refId is required for menu_item/combo');
    }
    return this.itemsRepo.save(item);
  }

  async deleteItem(restaurantId: string, id: string) {
    const item = await this.itemsRepo.findOne({ where: { id, restaurantId } });
    if (!item) throw new NotFoundException('Featured item not found');
    await this.itemsRepo.delete({ id });
    return { ok: true };
  }

  getCombos(restaurantId: string) {
    return this.combosRepo.find({
      where: { restaurantId },
      order: { createdAt: 'ASC' },
    });
  }

  async createCombo(restaurantId: string, dto: CreateComboDto) {
    const combo = this.combosRepo.create({
      restaurantId,
      name: dto.name,
      description: dto.description ?? null,
      price: dto.price,
      imageUrl: dto.imageUrl ?? null,
      isAvailable: dto.isAvailable ?? true,
      isActive: dto.isActive ?? true,
    });
    return this.combosRepo.save(combo);
  }

  async updateCombo(restaurantId: string, id: string, dto: UpdateComboDto) {
    const combo = await this.combosRepo.findOne({ where: { id, restaurantId } });
    if (!combo) throw new NotFoundException('Combo not found');
    Object.assign(combo, {
      name: dto.name ?? combo.name,
      description: dto.description ?? combo.description,
      price: dto.price ?? combo.price,
      imageUrl: dto.imageUrl ?? combo.imageUrl,
      isAvailable: dto.isAvailable ?? combo.isAvailable,
      isActive: dto.isActive ?? combo.isActive,
    });
    return this.combosRepo.save(combo);
  }

  async deleteCombo(restaurantId: string, id: string) {
    const combo = await this.combosRepo.findOne({ where: { id, restaurantId } });
    if (!combo) throw new NotFoundException('Combo not found');
    await this.comboItemsRepo.delete({ comboId: id });
    await this.combosRepo.delete({ id });
    return { ok: true };
  }

  async getComboItems(restaurantId: string, comboId: string) {
    const combo = await this.combosRepo.findOne({ where: { id: comboId, restaurantId } });
    if (!combo) throw new NotFoundException('Combo not found');
    return this.comboItemsRepo.find({
      where: { comboId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async addComboItem(restaurantId: string, comboId: string, dto: CreateComboItemDto) {
    const combo = await this.combosRepo.findOne({ where: { id: comboId, restaurantId } });
    if (!combo) throw new NotFoundException('Combo not found');
    const item = this.comboItemsRepo.create({
      comboId,
      menuItemId: dto.menuItemId,
      quantity: dto.quantity ?? 1,
      isOptional: dto.isOptional ?? false,
      groupKey: dto.groupKey ?? null,
      minSelect: dto.minSelect ?? null,
      maxSelect: dto.maxSelect ?? null,
      sortOrder: dto.sortOrder ?? 0,
    });
    return this.comboItemsRepo.save(item);
  }

  async updateComboItem(
    restaurantId: string,
    comboId: string,
    itemId: string,
    dto: UpdateComboItemDto,
  ) {
    const combo = await this.combosRepo.findOne({ where: { id: comboId, restaurantId } });
    if (!combo) throw new NotFoundException('Combo not found');
    const item = await this.comboItemsRepo.findOne({ where: { id: itemId, comboId } });
    if (!item) throw new NotFoundException('Combo item not found');
    Object.assign(item, {
      menuItemId: dto.menuItemId ?? item.menuItemId,
      quantity: dto.quantity ?? item.quantity,
      isOptional: dto.isOptional ?? item.isOptional,
      groupKey: dto.groupKey ?? item.groupKey,
      minSelect: dto.minSelect ?? item.minSelect,
      maxSelect: dto.maxSelect ?? item.maxSelect,
      sortOrder: dto.sortOrder ?? item.sortOrder,
    });
    return this.comboItemsRepo.save(item);
  }

  async deleteComboItem(restaurantId: string, comboId: string, itemId: string) {
    const combo = await this.combosRepo.findOne({ where: { id: comboId, restaurantId } });
    if (!combo) throw new NotFoundException('Combo not found');
    const item = await this.comboItemsRepo.findOne({ where: { id: itemId, comboId } });
    if (!item) throw new NotFoundException('Combo item not found');
    await this.comboItemsRepo.delete({ id: itemId });
    return { ok: true };
  }
}
