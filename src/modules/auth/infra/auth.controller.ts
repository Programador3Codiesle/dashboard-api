import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { LoginDto } from '../application/dto/login.dto';
import { RegisterDto } from '../application/dto/register.dto';
import { RefreshTokenDto } from '../application/dto/refresh-token.dto';

import { LoginUseCase } from '../application/use-cases/login.usecase';
import { RegisterUseCase } from '../application/use-cases/register.usecase';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.usecase';

import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly refreshUseCase: RefreshTokenUseCase,
  ) { }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    console.log(dto);
    return this.loginUseCase.execute(dto.nit_usuario, dto.password);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute({
      email: Number(dto.email),
      password: dto.password,
      name: dto.name,
    });
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto, @Req() req) {
    const userId = req.user?.sub ;
    return this.refreshUseCase.execute(userId, dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async profile(@Req() req) {
    return req.user;
  }
}
