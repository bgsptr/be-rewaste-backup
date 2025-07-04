import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DomainExceptionsFilter } from './shared/filters/domain-exception.filter';
import { LoggerService } from './infrastructure/logger/logger.service';
import * as dotenv from 'dotenv';
import { ZodValidationFilter } from './shared/filters/zod.filter';
import * as express from 'express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import * as bodyParser from 'body-parser';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  // app.use(bodyParser.json());

  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     transform: true,
  //     whitelist: true,
  //   })
  // )

  const loggerService = await app.resolve(LoggerService);
  app.useGlobalFilters(
    new ZodValidationFilter(),
    new DomainExceptionsFilter(loggerService),
  );

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
