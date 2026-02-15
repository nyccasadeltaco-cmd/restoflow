import { BadRequestException, Injectable } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';
import { createWorker } from 'tesseract.js';
import { getSupabaseAdminClient } from '../../common/supabase/supabase-admin';

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
    const isImage =
      mime.startsWith('image/') || /\.(png|jpg|jpeg|webp)$/i.test(name);

    if (!isPdf && !isImage) {
      throw new BadRequestException('Only PDF or image files are supported');
    }

    let rawText = '';
    let extraction: 'pdf-text' | 'ocr' = 'ocr';

    if (isPdf) {
      const parser = new PDFParse({ data: new Uint8Array(file.buffer) });
      try {
        const parsed = await parser.getText();
        rawText = (parsed.text || '').trim();
      } finally {
        await parser.destroy();
      }

      if (rawText.length >= 200) {
        extraction = 'pdf-text';
      } else {
        throw new BadRequestException(
          'This PDF looks scanned (no selectable text). Export it as images (JPG/PNG) and upload, or add PDF OCR pipeline.',
        );
      }
    } else {
      rawText = await this.ocrImageToText(file.buffer);
      extraction = 'ocr';
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

    return { ok: true, result: data };
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

    if (!Array.isArray(candidate.categories)) {
      throw new BadRequestException('Invalid payload: categories is required');
    }

    return candidate;
  }

  private async ocrImageToText(imageBuffer: Buffer): Promise<string> {
    const worker = await createWorker('spa+eng');

    try {
      const { data } = await worker.recognize(imageBuffer);
      return (data.text || '').trim();
    } finally {
      await worker.terminate();
    }
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
