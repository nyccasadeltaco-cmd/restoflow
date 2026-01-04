import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '@common/guards/local-auth.guard';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { SelectRestaurantDto } from './dto/select-restaurant.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login de usuario' })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('select-restaurant')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Seleccionar restaurante activo',
    description:
      'Retorna un nuevo JWT con restaurantId seleccionado para usuarios con multiples locales.',
  })
  async selectRestaurant(@Request() req, @Body() body: SelectRestaurantDto) {
    return this.authService.selectRestaurant(req.user, body.restaurantId);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registro de nuevo usuario' })
  async register(@Body() body: any) {
    // TODO: Implementar registro
    return { message: 'Register endpoint' };
  }
}
