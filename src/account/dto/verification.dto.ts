import { IsNotEmpty, IsString } from "class-validator";

export class VerificationDto {

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  code: string;

}
