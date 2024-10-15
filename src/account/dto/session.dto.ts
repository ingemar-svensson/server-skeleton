import { IsNotEmpty, IsString } from 'class-validator';
import { Account } from '../domain/account.model';
import { Expose } from 'class-transformer';

export class CreateSessionDto {

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

}

export class SessionDto {

  @IsNotEmpty()
  @IsString()
  @Expose()
  id: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  token: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  account: Account;

}