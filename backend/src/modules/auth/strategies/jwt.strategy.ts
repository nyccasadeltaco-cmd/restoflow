import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { JwtPayload, AuthenticatedUser } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  /**
   * Se llama automáticamente cuando el token es válido sintácticamente.
   * Valida que el usuario siga activo en la base de datos.
   */
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    // Validar que el usuario siga activo
    const user = await this.authService.validateUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado o desactivado');
    }

    // Devolvemos lo que estará en request.user
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
      restaurantId: payload.restaurantId,
      // Info extra útil del usuario
      fullName: user.fullName,
    };
  }
}
