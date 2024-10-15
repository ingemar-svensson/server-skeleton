import { Module, forwardRef } from '@nestjs/common';
import { HealthController } from './health/controller/health.controller';
import { EmailService } from './notification/email.service';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [
    TerminusModule,
  ],
  controllers: [
    HealthController,
  ],
  providers: [
    EmailService,
  ],
  exports: [
    EmailService,
  ]
})
export class SharedModule {}
