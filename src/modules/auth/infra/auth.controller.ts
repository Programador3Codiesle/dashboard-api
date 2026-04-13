import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ThrottlerAuthGuard } from './throttler-auth.guard';
import { LoginDto } from '../application/dto/login.dto';
import { RegisterDto } from '../application/dto/register.dto';
import { RefreshTokenDto } from '../application/dto/refresh-token.dto';
import { Response, Request } from 'express';

import { LoginUseCase } from '../application/use-cases/login.usecase';
import { RegisterUseCase } from '../application/use-cases/register.usecase';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.usecase';
import { AuthService } from './auth.service';

import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly refreshUseCase: RefreshTokenUseCase,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.loginUseCase.execute(dto);

    // Cookies HttpOnly
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutos
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000, // 8 horas
      path: '/',
    });

    // El frontend solo necesita los datos de usuario
    return { user };
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute({
      email: Number(dto.email),
      password: dto.password,
      name: dto.name,
    });
  }

  @UseGuards(ThrottlerAuthGuard)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 refreshes por minuto por IP
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token no encontrado');
    }

    // Intentar obtener userId del token JWT si está disponible (opcional)
    // Si no está disponible, el servicio lo extraerá del refresh token
    const userId = (req as any).user?.sub || req.body?.userId || null;

    const { accessToken, refreshToken: newRefreshToken } =
      await this.refreshUseCase.execute(userId, refreshToken);

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000,
      path: '/',
    });

    return { ok: true };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // Intentar obtener userId del token si está disponible (aunque el guard no sea obligatorio)
    const userId = (req as any).user?.sub;

    // Si tenemos userId, invalidar el refresh token en BD
    if (userId) {
      try {
        await this.authService.logout(userId);
      } catch (error) {
        // Si falla, continuar de todas formas para borrar las cookies
        console.error('Error al invalidar refresh token:', error);
      }
    }

    const isProduction = process.env.NODE_ENV === 'production';

    // Siempre borrar las cookies HttpOnly
    res.cookie('access_token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    res.cookie('refresh_token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async profile(@Req() req: Request) {
    return (req as any).user;
  }
}
