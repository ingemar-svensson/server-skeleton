import { 
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Inject,
  Post,
  Put,
  Res,
  UseGuards,
  UseInterceptors,
  forwardRef
} from '@nestjs/common';
import { AccountService } from '../service/account.service';
import { AuthorizedAccount } from '../../shared/auth/account.decorator';
import { UpdateAccountDto } from '../dto/update-account.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { RequestUpdateEmailDto } from '../dto/request-update-email.dto';
import { Account } from '../domain/account.model';
import { CreateAccountDto } from '../dto/create-account.dto';
import { VerificationDto } from '../dto/verification.dto';
import { CreateSessionDto, SessionDto } from '../dto/session.dto';
import { RequestResetPasswordDto } from '../dto/request-reset-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { UpdateEmailDto } from '../dto/update-email.dto';
import { UpdateAccountTypeDto } from '../../account/dto/update-account-type.dto';
import { AuthGuard } from '../../shared/auth/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { AccountDto } from '../../account/dto/account.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('Account')
@Controller('accounts')
@UseInterceptors(ClassSerializerInterceptor)
export class AccountController {
  constructor(
    @Inject(forwardRef(() => AccountService))
    private readonly accountService: AccountService,
  ) {}

  @Post()
  async createAccount(
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<AccountDto> {
    const account = await this.accountService.createAccount(createAccountDto);
    return plainToInstance(AccountDto, account, { excludeExtraneousValues: true });
  }

  @Post('verifications')
  async verify(
    @Body() verificationDto: VerificationDto,
  ): Promise<SessionDto> {
    return await this.accountService.verifyAccount(verificationDto);
  }

  @Post('sessions')
  async createSession(
    @Body() sessionDto: CreateSessionDto,
  ): Promise<SessionDto> {
    return await this.accountService.signIn(sessionDto);
  }

  @Delete('sessions')
  async deleteSession(
  ) {
  }

  @Delete('passwords')
  async deletePassword(
    @Body() requestResetPasswordDto: RequestResetPasswordDto,
  ) {
    await this.accountService.requestResetPassword(requestResetPasswordDto);
  }

  @Post('passwords/resets')
  async passwordReset(
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    await this.accountService.resetPassword(resetPasswordDto);
  }

  @UseGuards(AuthGuard)
  @Put("types")
  async updateAccountType(
    @AuthorizedAccount() account: Account,
    @Body() updateAccountTypeDto: UpdateAccountTypeDto,
  ): Promise<AccountDto> {
    const result = await this.accountService.updateAccount(
      new Account({
        type: updateAccountTypeDto.type,
        id: account.id,
      }), account.id);
    return plainToInstance(AccountDto, result, { excludeExtraneousValues: true });
  }

  @UseGuards(AuthGuard)
  @Put()
  async updateAccount(
    @AuthorizedAccount() account: Account,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<AccountDto> {
    const result = await this.accountService.updateAccount(
      new Account({
        ...updateAccountDto,
        id: account.id,
      }), account.id);
    return plainToInstance(AccountDto, result, { excludeExtraneousValues: true });
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getAccount(@AuthorizedAccount() account: Account): Promise<AccountDto> {
    const result = await this.accountService.getAccountById(account.id);
    return plainToInstance(AccountDto, result, { excludeExtraneousValues: true });
  }

  @UseGuards(AuthGuard)
  @Put('passwords')
  async updatePassword(
    @AuthorizedAccount() account: Account,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.accountService.updatePassword(updatePasswordDto, account.id);
  }

  @UseGuards(AuthGuard)
  @Put('emails')
  async updateEmails(
    @AuthorizedAccount() account: Account,
    @Body() requestUpdateEmailDto: RequestUpdateEmailDto,
  ) {
    await this.accountService.updateEmail(requestUpdateEmailDto, account.id);
  }

  @UseGuards(AuthGuard)
  @Put('emails/verifications')
  async verifyUpdateEmails(
    @AuthorizedAccount() account: Account,
    @Body() updateEmailDto: UpdateEmailDto,
  ) {
    await this.accountService.verifyUpdatedEmail(updateEmailDto, account.id);
  }

}
