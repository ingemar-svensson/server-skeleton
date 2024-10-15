import { IsString } from 'class-validator';

export class ResetPasswordDto {

  @IsString()
  email: string;

  @IsString()
  code: string;

  @IsString()
  password: string;

}
