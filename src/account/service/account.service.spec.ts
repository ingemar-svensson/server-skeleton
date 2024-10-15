import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { AccountService } from './account.service';
import { AccountRepository } from '../repository/account.repository';
import { AccountStatus, AccountType } from '../domain/account.model';
import { CodeService } from '../../code/service/code.service';
import { CodeType } from '../../code/domain/code.model';
import { JwtModule } from '@nestjs/jwt';
import { CodeModule } from '../../code/code.module';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentModule } from '../../payment/payment.module';
import secrets from '../../shared/config/secrets';
import { SharedModule } from '../../shared/shared.module';
import { forwardRef } from '@nestjs/common';
import { faker } from '@faker-js/faker';

describe('AccountServiceTest', () => {
  let app: TestingModule;
  let service: AccountService;
  let codeService: CodeService;

  beforeAll(async () => {
    const _app: TestingModule = await Test.createTestingModule({
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
        forwardRef(() => PaymentModule),
      ],
      providers: [
        AccountRepository,
        AccountService,
      ],
    }).compile();
    service = _app.get<AccountService>(AccountService);
    codeService = _app.get<CodeService>(CodeService);
    app = _app;
  });

  describe('basic functionality', () => {
    const account = {
      name: 'name-' + uuidv4(),
      email: uuidv4() + '@test.com',
      telephone: faker.phone.number(),
      password: 'password',
      type: AccountType.User,
      status: AccountStatus.New,
    };
    it('should do verification', async () => {
      const createdAccount = await service.createAccount(account);
      const accountId = createdAccount.id;
      if(!accountId) fail("No account ID");
      const code = (await codeService.getCodeByReferenceId(accountId, CodeType.EmailVerification));
      if(code) {
        const session = await service.verifyAccount({
          code: code.value,
          email: account.email
        });
        expect(session?.account.id).toEqual(createdAccount.id);
        expect(session?.token).not.toBeNull();
      } else {
        fail('Invalid code');
      }
      const verifiedAccount = await service.getAccountById(createdAccount.id);
      expect(verifiedAccount?.status).toEqual(AccountStatus.Active);
    });
    it('should fail with duplicate email', async () => {
      try {
        await service.createAccount(account);
        fail('Should error on dup email')
      } catch (error) {
      }
    });
    it('should sign in', async () => {
      const activeAccount = await service.getAccountByEmail(account.email);
      const session = await service.signIn({
        email: account.email,
        password: account.password,
      });
      expect(session.id).toEqual(activeAccount?.id);
      expect(session.token).not.toBeNull();
    });
    it('should fail to sign in', async () => {
      try {
        await service.signIn({
          email: account.email,
          password: 'invalid-password',
        });
        fail('Should fail to sign in');
      } catch (error) {
        expect(error.status).toEqual(403);
      }
    });
    it('should update password', async () => {
      const updatedPassword = 'updatedPassword';
      const activeAccount = await service.getAccountByEmail(account.email);
      if(activeAccount && activeAccount.id) {
        await service.updatePassword({
          oldPassword: 'password',
          newPassword: updatedPassword
        }, activeAccount.id);
      }
      const session = await service.signIn({
        email: account.email,
        password: updatedPassword,
      });
      expect(session.id).toEqual(activeAccount?.id);
      expect(session.token).not.toBeNull();
    });
    it('should reset password', async () => {
      const activeAccount = await service.getAccountByEmail(account.email);
      if(activeAccount && activeAccount.id) {
        await service.requestResetPassword({
          email: account.email,
        });
        const code = await codeService.getCodeByReferenceId(activeAccount.id, CodeType.PasswordReset);
        expect(code).not.toBeNull;
        const resetPassword = 'reset-pw';
        if(code && activeAccount.email) {
          await service.resetPassword({
            code: code.value,
            email: activeAccount.email,
            password: resetPassword,
          });
        }
        const session = await service.signIn({
          email: account.email,
          password: resetPassword,
        });
        expect(session.id).toEqual(activeAccount?.id);
        expect(session.token).not.toBeNull();  
      };
    });
  });

  afterAll(async () => {
    await app.close();
  });

});
