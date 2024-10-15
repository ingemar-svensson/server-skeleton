import { Inject, Injectable, Logger, forwardRef } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import mail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private logger: Logger = new Logger(EmailService.name);

  constructor(
    @Inject(forwardRef(() => ConfigService))
    private readonly configService: ConfigService,
    ) {
      const apiKey = configService.get("sendgridApiKey");
      mail.setApiKey(apiKey);
    }

    async send(to: string, templateId: string, templateData: any) {
      await mail.send({
        to: to,
        from: await this.configService.getOrThrow("noReplyEmail"),
        templateId: templateId,
        dynamicTemplateData: templateData,
      });
    }

}