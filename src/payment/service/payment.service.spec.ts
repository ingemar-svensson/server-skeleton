import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { PaymentService } from './payment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentRepository } from '../repository/payment.repository';
import mongoose from 'mongoose';
import { Payment } from '../domain/payment.model';
import Stripe from 'stripe';
import secrets from '../../shared/config/secrets';

describe('PaymentServiceTest', () => {
  let app: TestingModule;
  let service: PaymentService;
  let repository: PaymentRepository;
  let stripe: Stripe;

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
        PaymentRepository,
        PaymentService,
      ],
    }).compile();
    service = _app.get<PaymentService>(PaymentService);
    repository = _app.get<PaymentRepository>(PaymentRepository);
    const configService = _app.get<ConfigService>(ConfigService);
    stripe = new Stripe(configService.getOrThrow("stripeKey"), {});
    app = _app;
  });

  describe('basic functionality', () => {
    const accountId = new mongoose.Types.ObjectId();
    let saveResult: Payment;

    it('should create payment ID', async () => {
      const paymentId = await service.createPaymentId(`${uuidv4()}@pocoprop.co`);
      expect(paymentId).not.toBeNull();
      expect(paymentId.length).toEqual(18);
    });

    it('should list subscription types', async () => {
      const subscriptions = await service.getSubscriptionTypes();
    });
  });

  afterAll(async () => {
    await app.close();
  });

});
