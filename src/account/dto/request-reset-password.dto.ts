import { IsString } from 'class-validator';

export class RequestResetPasswordDto {

  @IsString()
  email: string;

}
