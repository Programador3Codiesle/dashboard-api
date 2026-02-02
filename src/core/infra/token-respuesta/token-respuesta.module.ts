import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TokenRespuestaService } from './token-respuesta.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [TokenRespuestaService],
  exports: [TokenRespuestaService],
})
export class TokenRespuestaModule {}
