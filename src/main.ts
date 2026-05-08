import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app/app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { ResponseInterceptor } from './common/interceptors/ResponseFormatter.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  const configService = app.get(ConfigService);

  const allowedOriginsRaw = configService.get<string>('ALLOWED_ORIGINS');
  const allowedOrigins = allowedOriginsRaw
    ? allowedOriginsRaw
        .split(',')
        .map((origin) => origin.trim().replace(/\/$/, ''))
    : ['http://localhost:5173', 'http://localhost:3000'];

  console.log('🚀 Allowed Origins for CORS:', allowedOrigins);

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
  });

  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.use(
    '/subscription/webhook',
    bodyParser.raw({
      type: 'application/json',
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('My Business Panel API')
    .setDescription('API documentation for My Business Panel')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log('Current config: ', configService.get('NODE_ENV'));
  console.log(`Application is running on: http://localhost:${port}/api/v1`);
  console.log(
    'Initializing AppModule with Stripe API Key length:',
    configService.get('STRIPE_API_KEY').length,
  );
}
void bootstrap();
