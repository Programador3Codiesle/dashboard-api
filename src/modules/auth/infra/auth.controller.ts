import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { CookieOptions } from 'express';
import { Throttle } from '@nestjs/throttler';
import { LoginDto } from '../application/dto/login.dto';
import { RegisterDto } from '../application/dto/register.dto';
import { Response, Request } from 'express';

import { LoginUseCase } from '../application/use-cases/login.usecase';
import { RegisterUseCase } from '../application/use-cases/register.usecase';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.usecase';
import { AuthService } from './auth.service';

import { JwtAuthGuard } from './jwt-auth.guard';
import {
  PERFIL_ADMIN,
  PERFIL_DEVELOPER,
  jwtSubjectToString,
} from '../domain/auth.constants';

type AuthJwtUser = { sub?: string; role?: string | number };

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (typeof header !== 'string' || header.length === 0) return undefined;
  for (const part of header.split(';')) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    if (trimmed.slice(0, eq) === name) {
      return trimmed.slice(eq + 1);
    }
  }
  return undefined;
}

function readBodyUserId(body: unknown): string | undefined {
  if (!body || typeof body !== 'object' || !('userId' in body)) {
    return undefined;
  }
  const value = (body as { userId?: unknown }).userId;
  return typeof value === 'string' ? value : undefined;
}

function readRequestUser(req: Request): AuthJwtUser | undefined {
  const raw: unknown = Reflect.get(req, 'user');
  if (!raw || typeof raw !== 'object') return undefined;
  const rec = raw as Record<string, unknown>;
  const role = rec.role;
  return {
    sub: jwtSubjectToString(rec.sub),
    role:
      typeof role === 'string' || typeof role === 'number' ? role : undefined,
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly refreshUseCase: RefreshTokenUseCase,
    private readonly authService: AuthService,
  ) {}

  private getRefreshCookieOptions(
    isProduction: boolean,
    rememberSession: boolean,
  ): CookieOptions {
    if (!rememberSession) {
      return {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
      };
    }

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      path: '/',
    };
  }

  private getRememberCookieOptions(
    isProduction: boolean,
    rememberSession: boolean,
  ): CookieOptions {
    const baseOptions: CookieOptions = {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    };

    if (rememberSession) {
      return {
        ...baseOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      };
    }

    return baseOptions;
  }

  @Throttle({ default: { limit: 250, ttl: 60_000 } })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rememberSession = dto.remember ?? false;
    const clientIp = req.ip ?? req.socket?.remoteAddress;
    const { user, accessToken, refreshToken } = await this.loginUseCase.execute(
      dto,
      clientIp,
    );

    // Cookies HttpOnly
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutos
      path: '/',
    });

    res.cookie(
      'refresh_token',
      refreshToken,
      this.getRefreshCookieOptions(isProduction, rememberSession),
    );
    res.cookie(
      'remember_session',
      rememberSession ? '1' : '0',
      this.getRememberCookieOptions(isProduction, rememberSession),
    );

    // El frontend solo necesita los datos de usuario
    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Post('register')
  async register(@Req() req: Request, @Body() dto: RegisterDto) {
    const role = Number(readRequestUser(req)?.role);
    if (role !== PERFIL_ADMIN && role !== PERFIL_DEVELOPER) {
      throw new ForbiddenException('No autorizado para registrar usuarios');
    }
    return this.registerUseCase.execute({
      email: Number(dto.email),
      password: dto.password,
      name: dto.name,
    });
  }

  @Throttle({ default: { limit: 400, ttl: 60_000 } })
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = readCookie(req, 'refresh_token');
    const rememberSession = readCookie(req, 'remember_session') === '1';

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token no encontrado');
    }

    const userId =
      readRequestUser(req)?.sub || readBodyUserId(req.body) || null;

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

    res.cookie(
      'refresh_token',
      newRefreshToken,
      this.getRefreshCookieOptions(isProduction, rememberSession),
    );
    res.cookie(
      'remember_session',
      rememberSession ? '1' : '0',
      this.getRememberCookieOptions(isProduction, rememberSession),
    );

    return { ok: true };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = readCookie(req, 'refresh_token');
    try {
      await this.authService.logoutFromRefreshToken(refreshToken);
    } catch (error) {
      console.error('Error al invalidar refresh token:', error);
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

    res.cookie('remember_session', '', {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@Req() req: Request) {
    return readRequestUser(req);
  }
}
