import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PDFParse } from 'pdf-parse';
import { In, Repository } from 'typeorm';
import { getSupabaseAdminClient } from '../../common/supabase/supabase-admin';
import { Menu } from '../menus/entities/menu.entity';
import { MenuCategory } from '../menus/entities/menu-category.entity';
import { MenuItem } from '../menus/entities/menu-item.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';

type DraftMenuItem = {
  name: string;
  description?: string;
  price?: number;
  is_available?: boolean;
  sort_order?: number;
};

type DraftMenuCategory = {
  name: string;
  is_active?: boolean;
  sort_order?: number;
  items: DraftMenuItem[];
};

@Injectable()
export class MenuConvertService {
  private static readonly IMPORT_ROOT_KEYS = new Set([
    'version',
    'mode',
    'tenant_id',
    'categories',
  ]);

  private static readonly IMPORT_CATEGORY_KEYS = new Set([
    'name',
    'description',
    'is_active',
    'sort_order',
    'items',
  ]);

  private static readonly IMPORT_ITEM_KEYS = new Set([
    'name',
    'description',
    'price',
    'is_available',
    'sort_order',
  ]);

  constructor(
    @InjectRepository(Menu)
    private readonly menusRepo: Repository<Menu>,
    @InjectRepository(MenuCategory)
    private readonly categoriesRepo: Repository<MenuCategory>,
    @InjectRepository(MenuItem)
    private readonly itemsRepo: Repository<MenuItem>,
    @InjectRepository(Restaurant)
    private readonly restaurantsRepo: Repository<Restaurant>,
  ) {}

  async convertToJson(params: {
    tenantId: string;
    file: {
      originalname: string;
      mimetype?: string;
      buffer: Buffer;
    };
  }) {
    const { tenantId, file } = params;

    const name = file.originalname.toLowerCase();
    const mime = (file.mimetype || '').toLowerCase();
    const isPdf = mime.includes('pdf') || name.endsWith('.pdf');
    if (!isPdf) {
      throw new BadRequestException('Only PDF files are supported');
    }

    let rawText = '';
    let extraction: 'pdf-text' | 'ocr' = 'pdf-text';

    const parser = new PDFParse({ data: new Uint8Array(file.buffer) });
    try {
      const parsed = await parser.getText();
      rawText = (parsed.text || '').trim();
    } finally {
      await parser.destroy();
    }

    if (rawText.length < 200) {
      throw new BadRequestException(
        'PDF without selectable text detected. Please upload a text-based PDF.',
      );
    }

    if (rawText.length < 50) {
      throw new BadRequestException('Not enough text extracted');
    }

    const { menuDraft, warnings } = this.parseMenuTextToDraft({
      tenantId,
      rawText,
    });

    return {
      menuDraft,
      warnings,
      meta: { extraction, chars: rawText.length },
    };
  }

  async importMenu(params: { tenantId: string; body: any }) {
    const client = getSupabaseAdminClient();
    if (!client) {
      throw new BadRequestException('Supabase admin no configurado');
    }

    const { data: tenantRow, error: tenantLookupError } = await client
      .from('tenants')
      .select('id')
      .eq('id', params.tenantId)
      .maybeSingle();

    if (tenantLookupError) {
      throw new BadRequestException(
        `Supabase tenant lookup failed: ${tenantLookupError.message}`,
      );
    }

    if (!tenantRow) {
      throw new BadRequestException(
        `Tenant ${params.tenantId} not found in Supabase tenants table. ` +
          'Verify backend DB and Supabase point to the same project/database and that tenant records are synced.',
      );
    }

    const payload = this.normalizeImportPayload(params.body);
    const sanitizedPayload = {
      ...payload,
      version: 'restoflow-menu-v1',
      tenant_id: params.tenantId,
    };

    const { data, error } = await client.rpc('import_menu_v1', {
      payload: sanitizedPayload,
    });

    if (error) {
      throw new BadRequestException(`import_menu_v1 failed: ${error.message}`);
    }

    const localSync = await this.syncLocalAdminMenu(
      params.tenantId,
      sanitizedPayload,
    );

    return { ok: true, result: data, localSync };
  }

  private normalizeImportPayload(body: any) {
    if (!body || typeof body !== 'object') {
      throw new BadRequestException('Body must be a JSON object');
    }

    const candidate =
      typeof body.payload === 'object' && body.payload
        ? body.payload
        : typeof body.menuDraft === 'object' && body.menuDraft
          ? body.menuDraft
          : body;

    const normalized = this.normalizeObjectKeys(candidate);
    if (normalized.client_id && !normalized.tenant_id) {
      normalized.tenant_id = normalized.client_id;
    }

    if (!Array.isArray(normalized.categories)) {
      throw new BadRequestException('Invalid payload: categories is required');
    }

    const categories = normalized.categories
      .map((rawCategory: any, categoryIndex: number) => {
        if (!rawCategory || typeof rawCategory !== 'object') {
          return null;
        }

        const categoryNormalized = this.normalizeObjectKeys(rawCategory);
        const itemSource = Array.isArray(categoryNormalized.items)
          ? categoryNormalized.items
          : Array.isArray(categoryNormalized.products)
            ? categoryNormalized.products
            : [];

        const items = itemSource
          .map((rawItem: any, itemIndex: number) => {
            if (!rawItem || typeof rawItem !== 'object') {
              return null;
            }

            const itemNormalized = this.pickKeys(
              this.normalizeObjectKeys(rawItem),
              MenuConvertService.IMPORT_ITEM_KEYS,
            );

            const name = String(itemNormalized.name ?? '').trim();
            if (!name) {
              return null;
            }

            const priceRaw = itemNormalized.price;
            const price =
              typeof priceRaw === 'number'
                ? priceRaw
                : typeof priceRaw === 'string'
                  ? Number(priceRaw.replace(',', '.'))
                  : undefined;

            return {
              ...itemNormalized,
              name,
              price:
                typeof price === 'number' && Number.isFinite(price)
                  ? price
                  : undefined,
              sort_order:
                typeof itemNormalized.sort_order === 'number'
                  ? itemNormalized.sort_order
                  : itemIndex + 1,
            };
          })
          .filter((item: any) => item !== null);

        const categoryPicked = this.pickKeys(
          categoryNormalized,
          MenuConvertService.IMPORT_CATEGORY_KEYS,
        );
        const categoryName = String(categoryPicked.name ?? '').trim();
        if (!categoryName) {
          return null;
        }

        return {
          ...categoryPicked,
          name: categoryName,
          sort_order:
            typeof categoryPicked.sort_order === 'number'
              ? categoryPicked.sort_order
              : categoryIndex + 1,
          items,
        };
      })
      .filter((category: any) => category !== null);

    if (!categories.length) {
      throw new BadRequestException('Invalid payload: categories is empty');
    }

    return {
      ...this.pickKeys(normalized, MenuConvertService.IMPORT_ROOT_KEYS),
      categories,
    };
  }

  private normalizeObjectKeys(value: any): any {
    if (Array.isArray(value)) {
      return value.map((entry) => this.normalizeObjectKeys(entry));
    }
    if (!value || typeof value !== 'object') {
      return value;
    }

    const out: Record<string, any> = {};
    for (const [rawKey, rawVal] of Object.entries(value)) {
      const key = this.toSnakeCase(rawKey);
      out[key] = this.normalizeObjectKeys(rawVal);
    }
    return out;
  }

  private toSnakeCase(key: string): string {
    return key
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }

  private pickKeys(input: Record<string, any>, allowed: Set<string>) {
    const out: Record<string, any> = {};
    for (const key of Object.keys(input)) {
      if (allowed.has(key)) {
        out[key] = input[key];
      }
    }
    return out;
  }

  private async syncLocalAdminMenu(tenantId: string, payload: any) {
    return this.categoriesRepo.manager.transaction(async (manager) => {
      const restaurantsRepo = manager.getRepository(Restaurant);
      const menusRepo = manager.getRepository(Menu);
      const categoriesRepo = manager.getRepository(MenuCategory);
      const itemsRepo = manager.getRepository(MenuItem);

      const restaurant = await restaurantsRepo.findOne({
        where: { tenantId, isActive: true },
        order: { createdAt: 'ASC' },
      });

      if (!restaurant) {
        throw new BadRequestException(
          `No active restaurant found for tenant ${tenantId}`,
        );
      }

      let menu = await menusRepo.findOne({
        where: { restaurantId: restaurant.id, isActive: true },
        order: { displayOrder: 'ASC' },
      });

      if (!menu) {
        menu = menusRepo.create({
          restaurantId: restaurant.id,
          name: 'Menú Principal',
          description: 'Menú del restaurante',
          isActive: true,
          displayOrder: 0,
        });
        menu = await menusRepo.save(menu);
      }

      const mode = String(payload?.mode ?? 'replace').toLowerCase();
      if (mode === 'replace') {
        const existingCategories = await categoriesRepo.find({
          where: { menuId: menu.id },
          select: ['id'],
        });
        const categoryIds = existingCategories.map((entry) => entry.id);
        if (categoryIds.length > 0) {
          await itemsRepo.delete({ categoryId: In(categoryIds) });
        }
        await categoriesRepo.delete({ menuId: menu.id });
      }

      let categoriesCreated = 0;
      let itemsCreated = 0;
      const categories = Array.isArray(payload?.categories)
        ? payload.categories
        : [];

      for (const rawCategory of categories) {
        const categoryName = String(rawCategory?.name ?? '').trim();
        if (!categoryName) {
          continue;
        }

        const category = await categoriesRepo.save(
          categoriesRepo.create({
            menuId: menu.id,
            name: categoryName,
            description:
              typeof rawCategory?.description === 'string'
                ? rawCategory.description
                : null,
            isActive: rawCategory?.is_active !== false,
            displayOrder:
              typeof rawCategory?.sort_order === 'number'
                ? rawCategory.sort_order
                : categoriesCreated + 1,
          }),
        );
        categoriesCreated += 1;

        const rawItems = Array.isArray(rawCategory?.items)
          ? rawCategory.items
          : [];
        for (let i = 0; i < rawItems.length; i += 1) {
          const rawItem = rawItems[i];
          const itemName = String(rawItem?.name ?? '').trim();
          if (!itemName) {
            continue;
          }

          const parsedPrice =
            typeof rawItem?.price === 'number'
              ? rawItem.price
              : typeof rawItem?.price === 'string'
                ? Number(rawItem.price.replace(',', '.'))
                : NaN;
          if (!Number.isFinite(parsedPrice)) {
            continue;
          }

          await itemsRepo.save(
            itemsRepo.create({
              categoryId: category.id,
              name: itemName,
              description:
                typeof rawItem?.description === 'string'
                  ? rawItem.description
                  : null,
              price: parsedPrice,
              isAvailable: rawItem?.is_available !== false,
              isActive: true,
              displayOrder:
                typeof rawItem?.sort_order === 'number'
                  ? rawItem.sort_order
                  : i + 1,
              allergens: [],
              tags: [],
            }),
          );
          itemsCreated += 1;
        }
      }

      return {
        restaurantId: restaurant.id,
        menuId: menu.id,
        categoriesCreated,
        itemsCreated,
        mode,
      };
    });
  }

  private parseMenuTextToDraft(input: { tenantId: string; rawText: string }) {
    const warnings: string[] = [];

    const lines = input.rawText
      .split('\n')
      .map((line) => line.replace(/\s+/g, ' ').trim())
      .filter((line) => line.length > 0);

    const priceRegex = /(?:\$?\s*)(\d{1,3}(?:[.,]\d{2})?)/;

    const categories: DraftMenuCategory[] = [];
    let current: DraftMenuCategory = {
      name: 'Menu',
      is_active: true,
      sort_order: 1,
      items: [],
    };
    categories.push(current);

    let catOrder = 1;
    let itemOrder = 1;
    let lastItem: DraftMenuItem | null = null;

    const isCategory = (line: string) => {
      if (priceRegex.test(line)) return false;
      if (line.length > 28) return false;
      const mostlyCaps = line === line.toUpperCase() && /[A-Z]/.test(line);
      const endsColon = line.endsWith(':');

      if (/http|www\.|instagram|facebook|hours|address|phone/i.test(line)) {
        return false;
      }

      return mostlyCaps || endsColon;
    };

    const parsePrice = (line: string) => {
      const match = line.match(priceRegex);
      if (!match) return undefined;
      const num = Number(match[1].replace(',', '.'));
      return Number.isFinite(num) ? num : undefined;
    };

    for (const rawLine of lines) {
      const line = rawLine.replace(/\u2022/g, '').trim();

      if (isCategory(line)) {
        const name = line.replace(/:$/, '').trim();
        catOrder += 1;
        current = {
          name,
          is_active: true,
          sort_order: catOrder,
          items: [],
        };
        categories.push(current);
        lastItem = null;
        itemOrder = 1;
        continue;
      }

      const price = parsePrice(line);
      if (price !== undefined) {
        const itemName = line
          .replace(priceRegex, '')
          .replace(/[-\u2013\u2014]+$/, '')
          .trim();

        if (!itemName) {
          warnings.push(`Price found but no name: "${line}"`);
          continue;
        }

        lastItem = {
          name: itemName,
          price,
          is_available: true,
          sort_order: itemOrder++,
        };
        current.items.push(lastItem);
        continue;
      }

      if (lastItem) {
        if (!/tax|gratuity|not included/i.test(line)) {
          lastItem.description = lastItem.description
            ? `${lastItem.description} ${line}`
            : line;
        }
      } else if (line.length <= 60 && /[A-Za-z]/.test(line)) {
        warnings.push(`Possible item without price: "${line}"`);
      }
    }

    const cleaned = categories.filter((category, index) => {
      return index === 0 || category.items.length > 0;
    });

    return {
      menuDraft: {
        version: 'restoflow-menu-v1',
        mode: 'replace',
        tenant_id: input.tenantId,
        categories: cleaned,
      },
      warnings,
    };
  }
}
