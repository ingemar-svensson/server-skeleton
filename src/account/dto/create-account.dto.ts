import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { AccountType } from '../domain/account.model';

export class CreateAccountDto {

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsEmail()
  telephone: string;

  @IsNotEmpty()
  @IsString()
  password: string;

}
