import { IsString } from 'class-validator';

export class RequestUpdateTelephoneDto {

  @IsString()
  telephone: string;

}
