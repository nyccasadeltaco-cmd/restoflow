import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';

@ApiTags('Public')
@Controller('public/restaurants')
export class PublicRestaurantController {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
  ) {}

  @Get(':slug/branding')
  @ApiOperation({
    summary: 'Obtener branding de un restaurante por slug (público)',
    description:
      'Endpoint público que devuelve el branding (logo, colores, nombre) de un restaurante basado en su slug. Útil para personalizar la pantalla de login.',
  })
  async getBrandingBySlug(@Param('slug') slug: string) {
    const restaurant = await this.restaurantRepository.findOne({
      where: { slug, isActive: true },
      select: [
        'id',
        'name',
        'slug',
        'logoUrl',
        'bannerUrl',
        'primaryColor',
        'secondaryColor',
        'accentColor',
      ],
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurante con slug "${slug}" no encontrado`);
    }

    return {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      logoUrl: restaurant.logoUrl,
      bannerUrl: restaurant.bannerUrl,
      primaryColor: restaurant.primaryColor,
      secondaryColor: restaurant.secondaryColor,
      accentColor: restaurant.accentColor,
    };
  }
}
