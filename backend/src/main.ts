// Global error logging for debugging
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Increase payload size limit for base64 images (50MB)
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  // Global prefix
  const apiPrefix = configService.get('API_PREFIX', 'api');
  app.setGlobalPrefix(apiPrefix, {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  // CORS - Allow all origins in development
  app.enableCors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('RestFolow API')
      .setDescription('API para plataforma de gestión de restaurantes')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Autenticación y autorización')
      .addTag('users', 'Gestión de usuarios')
      .addTag('tenants', 'Multi-tenant (SaaS)')
      .addTag('restaurants', 'Gestión de restaurantes')
      .addTag('menus', 'Menús, categorías y productos')
      .addTag('tables', 'Mesas y códigos QR')
      .addTag('orders', 'Pedidos y órdenes')
      .addTag('billing', 'Pagos y facturación')
      .addTag('stats', 'Estadísticas y dashboard')
      .addTag('notifications', 'Notificaciones')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  }

  const port = configService.get('PORT', 3000);
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap();
