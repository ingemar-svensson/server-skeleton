import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { Logger } from "@nestjs/common";

const logger: Logger = new Logger("Secrets");

export default async (): Promise<Record<string, string>> => {
  try {
    const configName = process.env.CONFIG_NAME;
    const client = new SecretsManagerClient({ region: process.env.AWS_REGION });
     try {
      const response = await client.send(
        new GetSecretValueCommand({
          SecretId: configName,
        }),
      );
      if (response.SecretString) {
        const secret = JSON.parse(response.SecretString);
        return secret as Record<string, string>;
      }
    } catch(e) {
      logger.error(e);
    }
  } catch (err) {
    logger.error(err);
  }
  return {};
};