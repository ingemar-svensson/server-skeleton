import { IsString } from 'class-validator';

export class UpdateEmailDto {

  @IsString()
  code: string;

}
