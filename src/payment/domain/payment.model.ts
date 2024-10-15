import mongoose, { Schema } from 'mongoose';
import { BaseSchema, Entity, extendSchema } from '../../shared/persistence';

export class Payment implements Entity {
  constructor(payment: {
      id?: string;
    }) {
      this.id = payment.id;
    }
    readonly id?: string;
}

export const PaymentSchema: Schema<Payment> = extendSchema(BaseSchema, {
}, { collection: "Payments" });
