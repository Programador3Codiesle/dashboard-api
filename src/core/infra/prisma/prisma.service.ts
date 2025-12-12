import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor(configService: ConfigService) {
        const connectionString = configService.get<string>('DATABASE_URL');
        if (!connectionString) {
            throw new Error('DATABASE_URL environment variable is not defined');
        }

        // Parse Prisma connection string to MSSQL config
        // Supports two formats:
        // 1. sqlserver://user:password@host:port;database=...
        // 2. sqlserver://host:port;database=...;user=...;password=...
        const parts = connectionString.split(';');
        const mainPart = parts[0];

        let server: string;
        let port: number;
        let user: string = '';
        let password: string = '';

        // Check if credentials are in the URL (format 1) or in parameters (format 2)
        if (mainPart.includes('@')) {
            // Format 1: sqlserver://user:password@host:port
            const url = new URL(mainPart.replace('sqlserver://', 'http://'));
            server = url.hostname;
            port = parseInt(url.port) || 1433;
            user = decodeURIComponent(url.username);
            password = decodeURIComponent(url.password);
        } else {
            // Format 2: sqlserver://host:port
            const hostPart = mainPart.replace('sqlserver://', '');
            const [host, portStr] = hostPart.split(':');
            server = host;
            port = portStr ? parseInt(portStr) : 1433;
        }

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
                trustServerCertificate: true,
                encrypt: false,
            },
        };

        // Parse additional parameters from the split parts
        for (let i = 1; i < parts.length; i++) {
            const part = parts[i];
            if (!part) continue;
            const [key, value] = part.split('=');

            if (key && value) {
                switch (key.toLowerCase()) {
                    case 'database':
                        config.options.database = value;
                        break;
                    case 'user':
                        config.user = value;
                        break;
                    case 'password':
                        config.password = value;
                        break;
                    case 'encrypt':
                        config.options.encrypt = value.toLowerCase() === 'true';
                        break;
                    case 'trustservercertificate':
                        config.options.trustServerCertificate = value.toLowerCase() === 'true';
                        break;
                }
            }
        }

        const adapter = new PrismaMssql(config);
        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
