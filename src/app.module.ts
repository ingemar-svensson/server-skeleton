import { MiddlewareConsumer, Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountModule } from './account/account.module';
import { FileModule } from './file/file.module';
import { PaymentModule } from './payment/payment.module';
import secrets from './shared/config/secrets';
import { RequestLoggerMiddleware } from './shared/logging/request-logger.middleware';
import { SharedModule } from './shared/shared.module';
import { CodeModule } from './code/code.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [secrets] }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>("databaseUrl"),
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('jwtKey'),
          signOptions: { expiresIn: '7d' },
        };
      },
      inject: [ConfigService],
      global: true,
    }),
    forwardRef(() => SharedModule),
    forwardRef(() => CodeModule),
    forwardRef(() => AccountModule),
    forwardRef(() => FileModule),
    forwardRef(() => PaymentModule),
  ],
  exports: [
    MongooseModule,
    ConfigModule,
    JwtModule,
    SharedModule,
  ]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
