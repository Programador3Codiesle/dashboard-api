import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Use Cases
import { LoginUseCase } from '../application/use-cases/login.usecase';
import { RegisterUseCase } from '../application/use-cases/register.usecase';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.usecase';

// Infra
import { AuthService } from './auth.service';
import { JwtStrategy } from './auth.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserPrismaRepository } from './repositories/user.prisma.repository';
import { PrismaService } from '../../../core/infra/prisma/prisma.service';

// Controller
import { AuthController } from './auth.controller';

// Domain
import { IUserRepository } from '../domain/user.repository';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],

  controllers: [AuthController],

  providers: [
    PrismaService,

    // repos
    {
      provide: IUserRepository,
      useClass: UserPrismaRepository,
    },

    // services
    AuthService,

    // auth
    JwtStrategy,
    JwtAuthGuard,

    // use cases
    LoginUseCase,
    RegisterUseCase,
    RefreshTokenUseCase,
  ],

  exports: [AuthService],
})
export class AuthModule {}
