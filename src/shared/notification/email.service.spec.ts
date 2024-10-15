import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import secrets from '../config/secrets';

describe('EmailServiceTest', () => {
  let app: TestingModule;
  let emailService: EmailService;

  beforeAll(async () => {
    const _app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [secrets] }),
      ],
      providers: [
        EmailService,
      ],
    }).compile();
    emailService = _app.get<EmailService>(EmailService);
    app = _app;
  });

  describe('email functionality', () => {
    it('should send an email', async () => {
      const toEmail = "test@pocoprop.co";
      const templateId = "d-797fca144a8149108bb8ca5564a79926";
      await emailService.send(toEmail, templateId, { verificationCode: "123ABC" });
    });
  });

  afterAll(async () => {
    await app.close();
  });

});
