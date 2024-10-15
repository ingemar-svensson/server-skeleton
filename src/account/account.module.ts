import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccountController } from './controller/account.controller';
import { AccountService } from './service/account.service';
import { AccountRepository } from './repository/account.repository';
import { CodeModule } from '../code/code.module';
import { JwtModule } from '@nestjs/jwt';
import { PaymentModule } from '../payment/payment.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('jwtKey'),
          signOptions: { expiresIn: '7d' },
        };
      },
      inject: [ConfigService]
    }),
    ConfigModule,
    CodeModule,
    PaymentModule,
    SharedModule,
  ],
  controllers: [
    AccountController,
  ],
  providers: [
    AccountRepository,
    AccountService,
  ],
  exports: [
    AccountService,
  ]
})
export class AccountModule {}
