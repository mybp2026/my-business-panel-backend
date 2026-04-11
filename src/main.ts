import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app/app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { ResponseInterceptor } from './common/interceptors/ResponseFormatter.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  const config = new DocumentBuilder()
    .setTitle('MyBusiness Panel API')
    .setDescription('Documentación de endpoints del panel de negocios')
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  app.use(cookieParser());
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      // whitelist: true,
    }),
  );
  app.use(
    '/subscription/webhook',
    bodyParser.raw({
      type: 'application/json',
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
