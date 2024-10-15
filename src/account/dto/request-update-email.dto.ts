import { IsString } from 'class-validator';

export class RequestUpdateEmailDto {

  @IsString()
  email: string;

}
