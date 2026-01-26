import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';

/**
 * Servicio de Prisma para la conexión con SQL Server
 * Extiende PrismaClient y maneja el ciclo de vida de la conexión
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor(configService: ConfigService) {
        // Obtener la cadena de conexión desde las variables de entorno
        const connectionString = configService.get<string>('DATABASE_URL');
        if (!connectionString) {
            throw new Error('DATABASE_URL environment variable is not defined');
        }

        // Parsear la cadena de conexión de Prisma a configuración de MSSQL
        // Soporta dos formatos:
        // 1. sqlserver://usuario:contraseña@host:puerto;database=...
        // 2. sqlserver://host:puerto;database=...;user=...;password=...
        const parts = connectionString.split(';');
        const mainPart = parts[0];

        let server: string;
        let port: number;
        let user: string = '';
        let password: string = '';

        // Verificar si las credenciales están en la URL (formato 1) o en parámetros (formato 2)
        if (mainPart.includes('@')) {
            // Formato 1: sqlserver://usuario:contraseña@host:puerto
            const url = new URL(mainPart.replace('sqlserver://', 'http://'));
            server = url.hostname;
            port = parseInt(url.port) || 1433;
            user = decodeURIComponent(url.username);
            password = decodeURIComponent(url.password);
        } else {
            // Formato 2: sqlserver://host:puerto
            const hostPart = mainPart.replace('sqlserver://', '');
            const [host, portStr] = hostPart.split(':');
            server = host;
            port = portStr ? parseInt(portStr) : 1433;
        }

        // Configuración para el adaptador de SQL Server
        const config: {
            server: string;
            port: number;
            user: string;
            password: string;
            options: {
                trustServerCertificate: boolean;
                encrypt: boolean;
                database?: string;
            };
        } = {
            server,
            port,
            user,
            password,
            options: {
                trustServerCertificate: true,  // Confiar en certificados auto-firmados
                encrypt: false,                 // Desactivar encriptación por defecto
            },
        };

        // Parsear parámetros adicionales de la cadena de conexión
        for (let i = 1; i < parts.length; i++) {
            const part = parts[i];
            if (!part) continue;
            const [key, value] = part.split('=');

            if (key && value) {
                switch (key.toLowerCase()) {
                    case 'database':
                        // Nombre de la base de datos
                        config.options.database = value;
                        break;
                    case 'user':
                        // Usuario de la base de datos
                        config.user = value;
                        break;
                    case 'password':
                        // Contraseña del usuario
                        config.password = value;
                        break;
                    case 'encrypt':
                        // Habilitar/deshabilitar encriptación
                        config.options.encrypt = value.toLowerCase() === 'true';
                        break;
                    case 'trustservercertificate':
                        // Confiar en el certificado del servidor
                        config.options.trustServerCertificate = value.toLowerCase() === 'true';
                        break;
                }
            }
        }

        // Crear el adaptador de MSSQL e inicializar PrismaClient
        const adapter = new PrismaMssql(config);
        super({ adapter });
    }

    /**
     * Se ejecuta cuando el módulo se inicializa
     * Establece la conexión con la base de datos
     */
    async onModuleInit() {
        await this.$connect();
    }

    /**
     * Se ejecuta cuando el módulo se destruye
     * Cierra la conexión con la base de datos
     */
    async onModuleDestroy() {
        await this.$disconnect();
    }
}
