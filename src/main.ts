import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- 🔑 CLAVE: Configuración de CORS ---
  app.enableCors({
    origin: 'http://localhost:3001', // Reemplaza 3000 con el puerto de tu Next.js
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Importante si usas cookies o sesiones
  });
  // ----------------------------------------


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
