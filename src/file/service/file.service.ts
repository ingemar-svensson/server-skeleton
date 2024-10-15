import { Injectable, Logger, NotFoundException, StreamableFile } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import * as fs from 'fs';
import { join } from 'path';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

@Injectable()
export class FileService {

  private logger: Logger = new Logger(FileService.name);
  private s3: S3Client;
  private storageBucket;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.s3 = new S3Client({region: process.env.AWS_REGION});
    this.storageBucket = configService.getOrThrow("storageBucket");
  }

  async saveFile(
    file: Express.Multer.File
  ): Promise<string> {
    const fileName = uuid() + file.originalname.substring(file.originalname.lastIndexOf('.'));
    if(this.configService.get('localStorage')) {
      const buffer = file.buffer;
      fs.writeFile(
        join("./uploads", fileName), buffer, () => null );
      this.logger.log(`Uploaded file to ./uploads`);
      return fileName;
    } else {
      const command = new PutObjectCommand({
        Bucket: this.storageBucket,
        Key: fileName,
        ContentType: file.mimetype,
        Body: file.buffer,
      });
      await this.s3.send(command);
      this.logger.log(`Uploaded ${fileName} to ${this.storageBucket}`);
      return fileName;
    }
  }

  async deleteFile(fileName: string) {
    if(this.configService.get('localStorage')) {
      fs.rm(
        join("./uploads", fileName), () => null );
      return fileName;
    } else {
      const command = new DeleteObjectCommand({
        Bucket: this.storageBucket,
        Key: fileName,
      });
      await this.s3.send(command);
      this.logger.log(`Deleted ${fileName} from ${this.storageBucket}`);
    }
  }

  async getFile(name: string): Promise<StreamableFile | Readable> {
    if(this.configService.get('localStorage')) {
      const readStream = fs.createReadStream(join("./uploads", name));
      return new StreamableFile(readStream);
    } else {
      const command = new GetObjectCommand({
        Bucket: this.storageBucket,
        Key: name,
      });
      const response = await this.s3.send(command);
      return new StreamableFile(response.Body as Readable);
    }
  }

}
