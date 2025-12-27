import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './core/infra/prisma/prisma.module';
import { AuthModule } from './modules/auth/infra/auth.module';
import { UsuarioModule } from './modules/usuarios/infra/usuario.module';
import { TicketsModule } from './modules/tickets/infra/tickets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsuarioModule,
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
