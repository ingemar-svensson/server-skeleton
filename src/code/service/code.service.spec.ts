import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CodeService } from './code.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Code } from '../domain/code.model';
import { CodeRepository } from '../repository/code.repository';
import mongoose from 'mongoose';
import { addHours } from "date-fns";
import secrets from '../../shared/config/secrets';

describe('CodeServiceTest', () => {
  let app: TestingModule;
  let service: CodeService;
  let repository: CodeRepository;

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
      ],
      providers: [
        CodeRepository,
        CodeService,
      ],
    }).compile();
    service = _app.get<CodeService>(CodeService);
    repository = _app.get<CodeRepository>(CodeRepository);
    app = _app;
  });

  describe('basic functionality', () => {
    const accountId = new mongoose.Types.ObjectId();
    let saveResult: Code;

    it('should create a code', async () => {
      saveResult = await service.createAccountVerificationCode(accountId.toHexString());
      expect(saveResult.id).not.toBeNull();
      expect(saveResult.value).not.toBeNull();
      expect(saveResult.createdAt).not.toBeNull();
      expect(accountId).toEqual(saveResult?.referenceId);
    });
    it('should verify code successfully', async () => {
      const result = await service.verifyCode(saveResult.referenceId.toHexString(), saveResult.value);
      expect(result);
    });
    it('should expiry code', async () => {
      const anHourAgo = addHours(new Date(), -1);
      saveResult = await service.createAccountVerificationCode(accountId.toHexString());
      saveResult = { ...saveResult, createdAt: anHourAgo};
      await repository.save(saveResult);
      try {
        await service.verifyCode(saveResult.referenceId.toHexString(), saveResult.value);
        fail("Code should be expired")
      } catch(error) {
        expect(error.message).toEqual("Code expired");
      }
    });
  });

  afterAll(async () => {
    await app.close();
  });

});
