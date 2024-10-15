import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import secrets from './secrets';

describe('ConfigServiceTest', () => {
  let app: TestingModule;
  let configService;

  beforeAll(async () => {
    const _app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [secrets] }),
      ],
      providers: [
      ],
    }).compile();
    configService = _app.get<ConfigService>(ConfigService);
    app = _app;
  });

  describe('lookups', () => {

    it('should get some basic values', async () => {
      expect(configService.get("host")).toEqual("localhost");
      expect(configService.get("appUrl")).toEqual("http://localhost:3000");
    });

  });

  afterAll(async () => {
    await app.close();
  });

});
