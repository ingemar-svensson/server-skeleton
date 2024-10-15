import {
  Controller,
  Get,
  Inject,
  Res,
  Param,
  forwardRef
} from '@nestjs/common';
import { FileService } from '../service/file.service';
import type { Response } from 'express';

@Controller('files')
export class FileController {
  constructor(
    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService,
  ) {}

  @Get(':name')
  async getFile(
    @Param('name') name: string,
    @Res({ passthrough: true },
  ) response: Response) {
    response.set({
      'Content-Type': `image/${name.split('.').pop()}`,
      'Content-Disposition': `attachment; filename="${name}"`,
    });
    return this.fileService.getFile(name);
  }

}
