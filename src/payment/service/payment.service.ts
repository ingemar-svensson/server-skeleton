import { Inject, Injectable, Logger, UnauthorizedException, forwardRef } from '@nestjs/common';
import { Payment } from '../domain/payment.model';
import { PaymentRepository } from '../repository/payment.repository';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {

  private logger: Logger = new Logger(PaymentService.name);
  public readonly stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => PaymentRepository))
    private readonly paymentRepository: PaymentRepository,
    ) {
      this.stripe = new Stripe(configService.getOrThrow("stripeKey"), {});
  }

  async createPaymentId(
    email: string
  ) {
    const paymentCustomer = await this.stripe.customers.create({
      email: email,
    });
    return paymentCustomer.id;
  }

  async getPaymentMethods(
    stripeClientId: string
  ) {
    return this.stripe.paymentMethods.list(
      { customer: stripeClientId, type: 'card' }
    );
  }

  async createPaymentMethod(
    paymentId: string,
    paymentMethodId: string
  ) {

    const paymentMethods = await this.stripe.paymentMethods.list(
      {customer: paymentId, type: 'card'}
    );
    if(paymentMethods) {
      paymentMethods.data.map(async(p) => {
        await this.stripe.paymentMethods.detach(
          p.id
        );
      });
    }

    const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: paymentId,
    });
    await this.stripe.customers.update(
      paymentId,
      {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      }
    );
    //clientService.update({ _id: client._id, paymentMethod: true, last4: paymentMethod.card.last4 });
    this.logger.log(`Payment method attached [${paymentMethodId} + >> ${paymentId}]`);
    return paymentMethod;
  }

  async deletePaymentMethod(
    paymentId: string
  ) {
    const paymentMethods = await this.stripe.paymentMethods.list(
      { customer: paymentId, type: 'card' }
    );
    if(paymentMethods) {
      paymentMethods.data.map(async(p) => {
        await this.stripe.paymentMethods.detach(
          p.id
        );
      });
    };
    this.logger.log(`Payment method deleted for [${paymentId}]`); 
  }

  async getSubscriptionTypes() {
    return this.stripe;
  }

  async getSubscriptions(
    paymentId: string
  ) {
    return await this.stripe.subscriptions.list({
      limit: 10,
      customer: paymentId,
    });
  }

  async createSubscription() {
  }

  async deleteSubscription() {
  }

  async refundSubscription() {
  }

  async getTransactions(
    paymentId: string
  ) {
    return this.stripe.invoices.list({
      limit: 100,
      customer: paymentId
    });
  }
}
