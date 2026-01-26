import { Injectable } from '@nestjs/common';
import { PrismaService } from './core/infra/prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async checkDatabaseConnection(): Promise<string> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'Conexión a la base de datos exitosa!';
    } catch (error) {
      return `Error al conectar a la base de datos: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}
