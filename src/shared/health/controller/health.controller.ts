import { Controller, Get, Logger } from "@nestjs/common";
import { HealthCheck, HealthCheckService } from "@nestjs/terminus";

@Controller("/health")
export class HealthController {

  private logger: Logger = new Logger(HealthController.name);

  constructor(
    private health: HealthCheckService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    this.logger.log(`Performing health check ${new Date()}`)
    return this.health.check([
    ]);
  }

}