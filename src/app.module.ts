import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
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
