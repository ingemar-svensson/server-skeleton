import { BadRequestException, ForbiddenException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException, UnprocessableEntityException, forwardRef } from '@nestjs/common';
import { Account, AccountStatus, AccountType } from '../domain/account.model';
import { AccountRepository } from '../repository/account.repository';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { comparePassword, hashPassword } from '../../shared/util/password';
import { RequestUpdateEmailDto } from '../dto/request-update-email.dto';
import { CreateAccountDto } from '../dto/create-account.dto';
import { VerificationDto } from '../dto/verification.dto';
import { CreateSessionDto, SessionDto } from '../dto/session.dto';
import { JwtService } from '@nestjs/jwt';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { RequestResetPasswordDto } from '../dto/request-reset-password.dto';
import { JwtPayloadDto } from '../dto/jwt.dto';
import { CodeService } from '../../code/service/code.service';
import { CodeType } from '../../code/domain/code.model';
import { PaymentService } from '../../payment/service/payment.service';
import { EmailService } from '../../shared/notification/email.service';
import { ConfigService } from '@nestjs/config';
import { UpdateEmailDto } from '../dto/update-email.dto';

@Injectable()
export class AccountService {

  private logger: Logger = new Logger(AccountService.name);

  constructor(
    private readonly configServide: ConfigService,
    @Inject(forwardRef(() => AccountRepository))
    private readonly accountRepository: AccountRepository,
    @Inject(forwardRef(() => JwtService))
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => CodeService))
    private codeService: CodeService,
    @Inject(forwardRef(() => PaymentService))
    private paymentService: PaymentService,
    @Inject(forwardRef(() => EmailService))
    private emailService: EmailService,
    ) {
  }

  async getAccountById(id?: string): Promise<Account> {
    return this.accountRepository.getById(id);
  }

  async getAccountByEmail(email: string): Promise<Account | null> {
    const filters = { email: email, status: AccountStatus.Active };
    const results = await this.accountRepository.getAll({ filters });
    if(results.length > 0) {
      return results[0];
    } else {
      return null;
    }
  }

  async updateAccount(account: Account, accountId?: string): Promise<Account> {
    const result = await this.accountRepository.save(account, { userId: accountId});
    this.logger.log(`Updated account '${account.id}'`);
    return result;
  }

  async updatePassword(updatePasswordDto: UpdatePasswordDto, accountId?: string) {
    const account = await this.accountRepository
      .getById(accountId, { select: ["id", "email", "password"] });
    if(account
      && account.password
      && comparePassword(updatePasswordDto.oldPassword, account.password)) {
      const newPassword = hashPassword(updatePasswordDto.newPassword);
      await this.accountRepository.save({
        id: accountId,
        password: newPassword,
      }, { userId: account.id });
      this.logger.log(`Account ${accountId} password updated`);
    } else {
      this.logger.log(`Failed to change password for account ${accountId}`);  
    }
  }

  async updateEmail(updateEmailDto: RequestUpdateEmailDto, id?: string) {
    const account = await this.accountRepository.getById(id);
    const code = await this.codeService.createAccountVerificationCode(account.id);
    code.prop1 = updateEmailDto.email;
    this.codeService.updateCode(code);
    const templateId = this.configServide.getOrThrow("emailVerificationTemplate");
    if(account.email) {
      this.emailService.send(account.email, templateId, { verificationCode: code.value });
    }
    this.logger.log(`Updating email [${account.email}]`);
  }

  async verifyUpdatedEmail(updateEmailDto: UpdateEmailDto, accountId?: string) {
    if (!accountId) throw new BadRequestException('The given account ID must be valid');
    const account = await this.accountRepository.getById(accountId);
    if(!account) {
      throw new BadRequestException(`Invalid account`);
    }
    const code = await this.codeService.getCodeByReferenceId(accountId, CodeType.EmailVerification);
    if(code && code.value === updateEmailDto.code) {
      await this.accountRepository.save({
        email: code.prop1,
        id: accountId,
      });
    }
    this.logger.log(`Verified updated email [${account.email}]`);
  }

  async createAccount(createAccountDto: CreateAccountDto): Promise<Account> {
    const existingEmail = await this.accountRepository.getAll({
      filters: {
        email: createAccountDto.email
      }
    });
    if(existingEmail.length > 0) {
      throw new BadRequestException('The email is already signed up');
    }
    const paymentId = await this.paymentService.createPaymentId(createAccountDto.email);
    const newAccount = await this.accountRepository.save<Account>(new Account({
      name: createAccountDto.name,
      email: createAccountDto.email.toLowerCase().trim(),
      telephone: createAccountDto.telephone,
      password: hashPassword(createAccountDto.password),
      status: AccountStatus.New,
      type: AccountType.User,
      paymentId,
    }));

    const code = await this.codeService.createAccountVerificationCode(newAccount.id);
    const templateId = this.configServide.getOrThrow("emailVerificationTemplate");
    if(newAccount.email) {
      this.emailService.send(newAccount.email, templateId, { verificationCode: code.value });
    }
    this.logger.log(`Signed up [${createAccountDto.email}]`);
    return newAccount;
  }

  async verifyAccount(verificationDto: VerificationDto): Promise<SessionDto>{
    const accounts = await this.accountRepository.getAll({
      filters: {
        email: verificationDto.email,
        status: AccountStatus.New,
      }
    });
    if(!accounts[0]) {
      throw new ForbiddenException();
    }
    const accountId = accounts[0].id;
    if(accountId) {
      const code = await this.codeService.getCodeByReferenceId(accountId, CodeType.EmailVerification);
      if(code && code.value === verificationDto.code) {
        await this.accountRepository.save({
          id: accounts[0].id,
          status: AccountStatus.Active
        });
        const session = await this.createSession(verificationDto.email, accounts[0]);
        this.logger.log(`Verified [${accounts[0].id}]`);
        return session;
      }
    }
    this.logger.error(`Invalid verification code`)
    throw new ForbiddenException();
  }

  async signIn(sessionDto: CreateSessionDto): Promise<SessionDto> {
    const accounts = await this.accountRepository.getAll({
      filters: {
        email: sessionDto.email.toLowerCase().trim(),
        status: AccountStatus.Active,
      },
      select: ["id", "email", "password"],
    });
    if(accounts.length == 0) throw new ForbiddenException();
    const account = accounts[0];
    if(account
      && account.password
      && comparePassword(sessionDto.password, account.password)) {
      await this.accountRepository.save({
        id: account.id,
        lastLoginAt: new Date(),
      },{ userId: account.id });
      const latestAccount = await this.accountRepository.getById(account.id);
      return this.createSession(sessionDto.email, latestAccount);
    }
    this.logger.error(`Failed to sign in ${sessionDto.email}`);
    throw new ForbiddenException();
  }

  async verifyJwt(token: string): Promise<JwtPayloadDto> {
    return this.jwtService.verifyAsync(token);
  }

  async requestResetPassword(requestResetPasswordDto: RequestResetPasswordDto ) {
    const account = await this.getAccountByEmail(requestResetPasswordDto.email);
    if(account && account.id && account.email && account.name) {
      const code = await this.codeService.createResetPasswordCode(account.id, account.email, account.name);
      const templateId = this.configServide.getOrThrow("passwordResetTemplate");
      this.emailService.send(account.email, templateId, { verificationCode: code.value });
      this.logger.log(`Sending password reset code to [${account.email}]`);
    } else {
      this.logger.error("Invalid password reset data", account);
      throw new ForbiddenException();
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const account = await this.getAccountByEmail(resetPasswordDto.email);
    const accountId = account?.id;
    if (!accountId) throw new BadRequestException('The given account ID must be valid');
    const code = await this.codeService.getCodeByReferenceId(accountId, CodeType.PasswordReset);
    if(account && account.id && code?.value === resetPasswordDto.code) {
      const newPassword = hashPassword(resetPasswordDto.password);
      await this.accountRepository.save({
        id: account.id,
        password: newPassword,
      });
      if(code.id) {
        await this.codeService.delete(code.id);
      }
      this.logger.log(`Updated password for ${account.id}`); 
    } else {
      this.logger.error(`Failed to update password`);
      throw new ForbiddenException();
    }
  }

  private async createSession(email: string, account: Account) {
    const payload = { email, accountId: account.id };
    const token = this.jwtService.sign(payload);
    if(!account.id) throw new InternalServerErrorException("Invalid accountId");
    const session: SessionDto = {
      id: account.id,
      token: token,
      account,
    }
    this.logger.log(`Signed in ${email}`);
    return session;
  }

  async deleteAllAccounts(): Promise<number> {
    return this.accountRepository.deleteAll({filters:{}})
  }

}
