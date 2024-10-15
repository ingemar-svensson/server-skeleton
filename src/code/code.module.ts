import { Module } from '@nestjs/common';
import { CodeRepository } from './repository/code.repository';
import { CodeService } from './service/code.service';

@Module({
  providers: [
    CodeRepository,
    CodeService,
  ],
  exports: [
    CodeService,
  ]
})
export class CodeModule {}
