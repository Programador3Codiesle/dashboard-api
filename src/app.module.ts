import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from './core/infra/prisma/prisma.module';
import { AuthModule } from './modules/auth/infra/auth.module';
import { UsuarioModule } from './modules/usuarios/infra/usuario.module';
import { TicketsModule } from './modules/tickets/infra/tickets.module';
import { AdministracionModule } from './modules/administracion/administracion.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Caché en memoria para endpoints de lectura frecuente
    CacheModule.register({
      isGlobal: true,
      ttl: 5 * 60 * 1000, // 5 minutos por defecto
      max: 100, // máximo 100 items en caché
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120, // 120 req/min por IP (evita abuso sin bloquear uso normal)
      },
    ]),
    PrismaModule,
    AuthModule,
    UsuarioModule,
    TicketsModule,
    AdministracionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
