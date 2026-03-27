import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser = require('cookie-parser');
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);
  app.use(cookieParser());
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // Aquí abrimos la puerta tanto para tu compu local como para Vercel en la nube
  app.enableCors({
    origin: ['http://localhost:5173', 'https://academic-ddd-frontend-alpha.vercel.app'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();