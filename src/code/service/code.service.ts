import { BadRequestException, Inject, Injectable, Logger, UnauthorizedException, forwardRef } from '@nestjs/common';
import { Code, CodeType } from '../domain/code.model';
import { CodeRepository } from '../repository/code.repository';
import mongoose from 'mongoose';

@Injectable()
export class CodeService {

  private logger: Logger = new Logger(CodeService.name);

  constructor(
    @Inject(forwardRef(() => CodeRepository))
    private readonly codeRepository: CodeRepository,
    ) {
  }

  async createAccountVerificationCode(accountId?: string) {
    if (!accountId) throw new BadRequestException('The given account ID must be valid');
    return this.codeRepository.save(new Code({
      referenceId: accountId,
      value: this.generateCode(),
      type: CodeType.EmailVerification,
    }));
  }

  async createEmailUpdate(accountId: string, email: string) {
    return this.codeRepository.save(new Code({
      referenceId: accountId,
      value: this.generateCode(),
      type: CodeType.EmailUpdate,
    }));
  }

  async createResetPasswordCode(accountId: string, email: string, name: string) {
    return await this.codeRepository.save(new Code({
      referenceId: accountId,
      value: this.generateCode(),
      type: CodeType.PasswordReset,
    }));
  }

  async verifyCode(referenceId: string, code: string) {
    const existingCodes = await this.codeRepository.getAll({
      filters: {
        referenceId: new mongoose.Types.ObjectId(referenceId),
        value: code,
      }
    });
    if (existingCodes.length == 0) {
      throw new UnauthorizedException('Invalid code');
    }

    const now = new Date().getTime();
    const codeCreatedAt = existingCodes[0].createdAt?.getTime();
    if (Math.abs(now - codeCreatedAt) > (await this.getExpirationTime(existingCodes[0].type))) {
      throw new UnauthorizedException('Code expired');
    }
    return code === existingCodes[0].value;
  }

  async getCodeByReferenceId(referenceId: string, type: CodeType) {
    const codes = await this.codeRepository.getAll({
      filters: {
        referenceId: new mongoose.Types.ObjectId(referenceId),
        type,
      }
    });
    if(codes.length > 0) {
      return codes[0];
    } else {
      return null;
    }
  }

  async updateCode(code: Code) {
    return this.codeRepository.save(code);
  }

  async delete(id: string) {
    return this.codeRepository.deleteById(id);
  }

  private generateCode() {
    return Math.floor(1000 + Math.random() * 9000) + '';
  }

  private async getExpirationTime(type: CodeType): Promise<number> {
    const minutes = 30; // make configurable
    return minutes * 60 * 1000;
  }

}
