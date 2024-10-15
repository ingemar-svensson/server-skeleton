import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { WinstonModule } from 'nest-winston';
import { transports, format } from 'winston';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './shared/exception/exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule, { 
    cors: { 
      allowedHeaders: ['authorization', 'content-type' ],
      credentials: true,
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
      ],
    },
    bodyParser: false,
    logger: WinstonModule.createLogger({
      transports: [
        new transports.File({
          filename: `logs/error.log`,
          level: 'error',
          format: format.combine(format.timestamp(), format.json()),
        }),
        new transports.File({
          filename: `logs/combined.log`,
          format: format.combine(format.timestamp(), format.json()),
        }),
        new transports.Console({
         format: format.combine(
           format.cli(),
           format.splat(),
           format.timestamp(),
           format.printf((info) => {
             return `${info.timestamp} ${info.level}: ${info.message}`;
           }),
          ),
      }),
      ],
    }),
  });
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          property: error.property,
          message: error.constraints ? error.constraints[Object.keys(error.constraints)[0]] : "Invalid request",
        }));
        let message = result[0].message;
        message = message.charAt(0).toUpperCase() + message.slice(1)
        return new BadRequestException(message);
      },
      stopAtFirstError: true,
      transform: true,
      whitelist: true,
      skipMissingProperties: true,
    }),
  );
  app.use(bodyParser.json())
  app.enableShutdownHooks();
  app.use(compression());

  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.getOrThrow("port");
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
  app.setGlobalPrefix('v1');

  const config = new DocumentBuilder()
    .setTitle('REST API')
    .setDescription('The API specification')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  logger.log(`Server is up and running, listening on ${port}`)
}
bootstrap();
