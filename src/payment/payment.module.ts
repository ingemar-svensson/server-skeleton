import { Module, forwardRef } from '@nestjs/common';
import { PaymentRepository } from './repository/payment.repository';
import { PaymentService } from './service/payment.service';

@Module({
  imports: [
  ],
  providers: [
    PaymentRepository,
    PaymentService,
  ],
  exports: [
    PaymentService,
  ]
})
export class PaymentModule {}
