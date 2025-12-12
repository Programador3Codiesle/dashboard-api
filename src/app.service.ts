import { Injectable } from '@nestjs/common';
import { PrismaService } from './core/infra/prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) { }

  getHello(): string {
    return 'Hello World!';
  }

  async checkDatabaseConnection(): Promise<string> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'Conexión a la base de datos exitosa!';
    } catch (error) {
      return `Error al conectar a la base de datos: ${error.message}`;
    }
  }

  async pruebaTraerUsuario(): Promise<any> {

    const usuario = await this.prisma.w_sist_usuarios.findFirst({
      where: {
        nit_usuario: 1095944273
      }
    })
    return JSON.stringify(usuario, (key, value) => (typeof value === 'bigint' ? value.toString() : value));
  }

}
