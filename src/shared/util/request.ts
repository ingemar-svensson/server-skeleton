import { BadRequestException, PipeTransform, ValidationPipe } from "@nestjs/common"
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RawBody = createParamDecorator(
  (data: string, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest();
    if(request.body[data]) {
      return JSON.parse(request.body[data]);
    } else {
      {}
    }
  }
);

export const ValidBody = (property: string) =>
  RawBody(
    property,
    new ValidationPipe({
      validateCustomDecorators: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          property: error.property,
          message: error.constraints ? error.constraints[Object.keys(error.constraints)[0]] : "Invalid request",
        }));
        let message = result[0].message;
        message = message.charAt(0).toUpperCase() + message.slice(1)
        return new BadRequestException(message);
      },
      stopAtFirstError: true,
    })
  );