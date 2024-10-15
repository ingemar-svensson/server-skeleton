import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class AccountDto {

  @IsNotEmpty()
  @IsString()
  @Expose()
  id: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  name: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  telephone: string;

}