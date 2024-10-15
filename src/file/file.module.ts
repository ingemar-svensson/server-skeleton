import { Module, forwardRef } from '@nestjs/common';
import { FileService } from './service/file.service';
import { FileController } from './controller/file.controller';
import { AccountModule } from '../account/account.module';
import { FileRepository } from './repository/file.repository';

@Module({
  imports: [
    forwardRef(() => AccountModule),
  ],
  controllers: [
    FileController,
  ],
  providers: [
    FileService,
    FileRepository,
  ],
  exports: [
    FileService,
  ]
})
export class FileModule {}
