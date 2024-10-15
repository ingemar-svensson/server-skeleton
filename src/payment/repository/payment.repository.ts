import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { BaseRepository } from "../../shared/persistence/base.repository";
import { Payment, PaymentSchema } from "../domain/payment.model";

export class PaymentRepository
  extends BaseRepository<Payment>
{
  constructor(@InjectConnection() connection: Connection) {
    super({
      Default: { type: Payment, schema: PaymentSchema },
    }, connection);
  }

}