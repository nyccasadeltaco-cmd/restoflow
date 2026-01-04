import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PromptContext } from '../entities';

export interface GeneratedContent {
  captions: {
    short: string;
    medium: string;
    long: string;
  };
  hashtags: string[];
  ctas: string[];
  hooks: string[];
  variants: {
    instagram?: any;
    facebook?: any;
    tiktok?: any;
  };
}

@Injectable()
export class AIContentService {
  private readonly logger = new Logger(AIContentService.name);
  private readonly openaiApiKey: string;
  private readonly openaiModel: string;

  constructor(private configService: ConfigService) {
    this.openaiApiKey = this.configService.get('OPENAI_API_KEY') || '';
    this.openaiModel = this.configService.get('OPENAI_MODEL') || 'gpt-4';
  }

  async generateContent(
    context: PromptContext,
    restaurantName: string,
    restaurantStyle?: string,
    platforms: string[] = ['instagram', 'facebook'],
  ): Promise<GeneratedContent> {
    this.logger.log(`Generating content for ${restaurantName} on platforms: ${platforms.join(', ')}`);

    try {
      const prompt = this.buildPrompt(context, restaurantName, restaurantStyle, platforms);

      // TODO: Integrate with OpenAI API or Anthropic Claude
      // For now, return mock data
      const mockContent = this.generateMockContent(context, restaurantName, platforms);

      this.logger.log(`Content generated successfully for ${restaurantName}`);
      return mockContent;
    } catch (error) {
      this.logger.error(`Error generating content: ${error.message}`, error.stack);
      throw error;
    }
  }

  private buildPrompt(
    context: PromptContext,
    restaurantName: string,
    restaurantStyle: string | undefined,
    platforms: string[],
  ): string {
    const { product, offer, objective, tone, language, ctaType } = context;

    const systemPrompt = `Eres un experto en marketing de redes sociales para restaurantes. 
Tu objetivo es crear contenido atractivo y efectivo que genere ventas.`;

    const userPrompt = `
Necesito crear un post para ${restaurantName}${restaurantStyle ? ` (estilo: ${restaurantStyle})` : ''}.

INFORMACIÓN DEL POST:
- Producto/Plato: ${product || 'No especificado'}
- Oferta/Promoción: ${offer || 'No especificado'}
- Objetivo: ${objective || 'Generar ventas'}
- Tono: ${tone || 'casual'}
- Idioma: ${language || 'es'}
- Call to Action: ${ctaType || 'order_now'}
- Plataformas: ${platforms.join(', ')}

GENERA:
1. CAPTIONS:
   - Short (1-2 líneas, máximo 100 caracteres, directo al punto)
   - Medium (2-4 líneas, máximo 250 caracteres, con más detalles)
   - Long (4-6 líneas, máximo 500 caracteres, storytelling)

2. HASHTAGS:
   - 25-30 hashtags relevantes
   - Mezcla de: trending, nicho del restaurante, localización, producto específico
   - Ordenados por relevancia (más importantes primero)

3. CALLS TO ACTION:
   - 5 variantes de CTA atractivos
   - Específicos para ${ctaType}
   - Que generen urgencia o deseo

4. HOOKS:
   - 5 primeras líneas llamativas
   - Que detengan el scroll
   - Que generen curiosidad

5. VARIANTES POR PLATAFORMA:
${platforms.includes('instagram') ? '   - Instagram: Caption optimizado para IG (emojis, formato, hashtags al final)' : ''}
${platforms.includes('facebook') ? '   - Facebook: Caption más largo, storytelling, preguntas para engagement' : ''}
${platforms.includes('tiktok') ? '   - TikTok: Caption corto, trending, con humor si aplica' : ''}

RESPONDE EN FORMATO JSON:
{
  "captions": { "short": "", "medium": "", "long": "" },
  "hashtags": ["tag1", "tag2", ...],
  "ctas": ["cta1", "cta2", ...],
  "hooks": ["hook1", "hook2", ...],
  "variants": {
    "instagram": { "caption": "", "hashtags": [] },
    "facebook": { "caption": "" },
    "tiktok": { "caption": "", "hashtags": [] }
  }
}
`;

    return `${systemPrompt}\n\n${userPrompt}`;
  }

  private generateMockContent(
    context: PromptContext,
    restaurantName: string,
    platforms: string[],
  ): GeneratedContent {
    const { product, offer, tone, ctaType } = context;
    const isSpanish = context.language === 'es' || !context.language;

    // Generate captions based on tone
    const captions = this.generateCaptions(restaurantName, product, offer, tone, isSpanish);
    const hashtags = this.generateHashtags(product, restaurantName, isSpanish);
    const ctas = this.generateCTAs(ctaType, isSpanish);
    const hooks = this.generateHooks(product, offer, tone, isSpanish);
    const variants = this.generatePlatformVariants(captions, hashtags, platforms, isSpanish);

    return { captions, hashtags, ctas, hooks, variants };
  }

  private generateCaptions(
    restaurantName: string,
    product?: string,
    offer?: string,
    tone?: string,
    isSpanish = true,
  ): { short: string; medium: string; long: string } {
    const productName = product || (isSpanish ? 'nuestros platillos' : 'our dishes');
    const offerText = offer || (isSpanish ? 'promoción especial' : 'special offer');

    if (tone === 'premium') {
      return {
        short: isSpanish
          ? `✨ ${productName} que deleitan tu paladar en ${restaurantName}`
          : `✨ ${productName} that delight your palate at ${restaurantName}`,
        medium: isSpanish
          ? `Experiencia gastronómica única con ${productName}. ${offerText} disponible ahora en ${restaurantName}. 🍽️`
          : `Unique gastronomic experience with ${productName}. ${offerText} available now at ${restaurantName}. 🍽️`,
        long: isSpanish
          ? `En ${restaurantName}, cada ${productName} es una obra maestra culinaria. Nuestro chef ha creado algo especial: ${offerText}. Ven y descubre por qué somos el favorito del barrio. ¡Te esperamos! 👨‍🍳✨`
          : `At ${restaurantName}, every ${productName} is a culinary masterpiece. Our chef has created something special: ${offerText}. Come and discover why we're the neighborhood favorite. We're waiting for you! 👨‍🍳✨`,
      };
    } else if (tone === 'humor') {
      return {
        short: isSpanish
          ? `🤤 ${productName} tan buenos que vas a querer más`
          : `🤤 ${productName} so good you'll want more`,
        medium: isSpanish
          ? `Advertencia: ${productName} altamente adictivos. 😅 ${offerText} en ${restaurantName}. No nos hacemos responsables de tu nueva obsesión. 🍕`
          : `Warning: highly addictive ${productName}. 😅 ${offerText} at ${restaurantName}. We're not responsible for your new obsession. 🍕`,
        long: isSpanish
          ? `Plot twist: Viniste por ${offerText}, te vas con el corazón lleno y el estómago feliz. 💕 En ${restaurantName} sabemos cómo hacer que tu día sea mejor con ${productName}. ¿Te atreves a probar? Spoiler: sí vas a querer repetir. 😋`
          : `Plot twist: You came for ${offerText}, you leave with a full heart and happy stomach. 💕 At ${restaurantName} we know how to make your day better with ${productName}. Dare to try? Spoiler: you'll want more. 😋`,
      };
    } else {
      return {
        short: isSpanish
          ? `🔥 ${productName} en ${restaurantName} - ${offerText}`
          : `🔥 ${productName} at ${restaurantName} - ${offerText}`,
        medium: isSpanish
          ? `¡Tenemos ${offerText}! Disfruta de ${productName} frescos y deliciosos en ${restaurantName}. ¡Ordena ahora! 🍴`
          : `We have ${offerText}! Enjoy fresh and delicious ${productName} at ${restaurantName}. Order now! 🍴`,
        long: isSpanish
          ? `¿Antojo de ${productName}? En ${restaurantName} preparamos cada platillo con amor y los mejores ingredientes. ${offerText} disponible por tiempo limitado. ¡No te lo pierdas! Ordena para pickup o delivery. 🚀`
          : `Craving ${productName}? At ${restaurantName} we prepare each dish with love and the best ingredients. ${offerText} available for limited time. Don't miss it! Order for pickup or delivery. 🚀`,
      };
    }
  }

  private generateHashtags(product?: string, restaurantName?: string, isSpanish = true): string[] {
    const baseHashtags = isSpanish
      ? [
          '#ComidaCasera',
          '#RestauranteLocal',
          '#FoodPorn',
          '#Foodie',
          '#Delicioso',
          '#ComidaFresca',
          '#Antojo',
          '#OrdenYa',
          '#Delivery',
          '#Pickup',
          '#SupportLocal',
          '#FoodLovers',
          '#InstaFood',
          '#Yummy',
          '#FoodPhotography',
        ]
      : [
          '#HomemadeFood',
          '#LocalRestaurant',
          '#FoodPorn',
          '#Foodie',
          '#Delicious',
          '#FreshFood',
          '#Craving',
          '#OrderNow',
          '#Delivery',
          '#Pickup',
          '#SupportLocal',
          '#FoodLovers',
          '#InstaFood',
          '#Yummy',
          '#FoodPhotography',
        ];

    const productSpecific = product ? [`#${product.replace(/\s+/g, '')}`, `#${product}Lovers`] : [];
    const restaurantSpecific = restaurantName ? [`#${restaurantName.replace(/\s+/g, '')}`] : [];

    return [...restaurantSpecific, ...productSpecific, ...baseHashtags].slice(0, 30);
  }

  private generateCTAs(ctaType?: string, isSpanish = true): string[] {
    const ctaMap = {
      order_now: isSpanish
        ? ['¡Ordena ahora!', '¡Pide ya!', 'Haz tu pedido', 'Ordena aquí', '¡No esperes más!']
        : ['Order now!', 'Order today!', 'Place your order', 'Order here', "Don't wait!"],
      pickup: isSpanish
        ? ['Pickup en 15 min', 'Recoge tu orden', 'Listo para recoger', 'Pasa por tu pedido', '¡Pickup rápido!']
        : ['Pickup in 15 min', 'Pick up your order', 'Ready for pickup', 'Grab your order', 'Fast pickup!'],
      delivery: isSpanish
        ? ['Delivery a tu puerta', 'Entrega a domicilio', 'Te lo llevamos', 'Delivery gratis', '¡Delivery rápido!']
        : ['Delivery to your door', 'Home delivery', "We'll bring it", 'Free delivery', 'Fast delivery!'],
    };

    return ctaMap[ctaType] || ctaMap.order_now;
  }

  private generateHooks(product?: string, offer?: string, tone?: string, isSpanish = true): string[] {
    if (tone === 'humor') {
      return isSpanish
        ? [
            '🚨 Alerta de antojo: esto no es un simulacro 🚨',
            'POV: Acabas de descubrir tu nuevo lugar favorito',
            'Nadie: ... Absolutamente nadie: ... Nosotros: ¡TENEMOS PROMO!',
            '¿Hambre? Sí. ¿Solución? También.',
            'Breaking news: Tu estómago necesita ver esto 👀',
          ]
        : [
            '🚨 Craving alert: this is not a drill 🚨',
            'POV: You just discovered your new favorite spot',
            'Nobody: ... Absolutely nobody: ... Us: WE HAVE A PROMO!',
            'Hungry? Yes. Solution? Also yes.',
            'Breaking news: Your stomach needs to see this 👀',
          ];
    } else {
      return isSpanish
        ? [
            `🔥 ${offer || 'Oferta especial'} que no puedes perderte`,
            '¿Tienes hambre? Tenemos la solución perfecta',
            '✨ El sabor que estabas buscando está aquí',
            `💕 ${product || 'Nuestros platillos'} frescos todos los días`,
            '👨‍🍳 Hecho con amor, servido con pasión',
          ]
        : [
            `🔥 ${offer || 'Special offer'} you can't miss`,
            'Hungry? We have the perfect solution',
            '✨ The flavor you were looking for is here',
            `💕 ${product || 'Our dishes'} fresh every day`,
            '👨‍🍳 Made with love, served with passion',
          ];
    }
  }

  private generatePlatformVariants(
    captions: { short: string; medium: string; long: string },
    hashtags: string[],
    platforms: string[],
    isSpanish = true,
  ): any {
    const variants: any = {};

    if (platforms.includes('instagram')) {
      variants.instagram = {
        caption: `${captions.medium}\n\n${isSpanish ? '📍 Ordena ahora' : '📍 Order now'} 👆\n\n${hashtags.slice(0, 20).join(' ')}`,
        hashtags: hashtags.slice(0, 30),
      };
    }

    if (platforms.includes('facebook')) {
      variants.facebook = {
        caption: `${captions.long}\n\n${isSpanish ? '👉 Haz clic para ordenar' : '👉 Click to order'}`,
      };
    }

    if (platforms.includes('tiktok')) {
      variants.tiktok = {
        caption: `${captions.short} ${hashtags.slice(0, 5).join(' ')}`,
        hashtags: hashtags.slice(0, 10),
      };
    }

    return variants;
  }
}
