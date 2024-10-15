import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { AccountType } from '../domain/account.model';

export class UpdateAccountTypeDto {

  @IsNotEmpty()
  @IsString()
  type: AccountType;

}
