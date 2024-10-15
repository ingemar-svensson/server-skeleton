import { IsOptional, IsString } from 'class-validator';
import { AccountStatus } from '../domain/account.model';
import { CreateAccountDto } from './create-account.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateAccountDto extends OmitType(CreateAccountDto, ['password'] as const) {

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  cover?: string;

  @IsOptional()
  @IsString()
  addressLine1?: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsOptional()
  @IsString()
  addressLine3?: string;

  @IsOptional()
  @IsString()
  town?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  status?: AccountStatus;

}
