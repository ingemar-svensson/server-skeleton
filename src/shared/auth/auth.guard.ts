import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  Inject,
  forwardRef,
  ForbiddenException,
} from '@nestjs/common';
import { AccountService } from '../../account/service/account.service';

@Injectable()
export class AuthGuard implements CanActivate {

  private logger: Logger = new Logger(AuthGuard.name);
  constructor(
    @Inject(forwardRef(() => AccountService))
    private readonly accountService: AccountService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request?.headers['authorization'];
    if(!token) {
      this.logger.warn(`Invalid authorization token`);
      throw new ForbiddenException();
    }
    try {
      const { accountId } = await this.accountService.verifyJwt(token.replace('Bearer ', ''));
      request.account = await this.accountService.getAccountById(accountId);
    } catch (error) {
      this.logger.warn(`Invalid credentials caused error`, error);
      throw new ForbiddenException();
    }
    return true;
  }
}
