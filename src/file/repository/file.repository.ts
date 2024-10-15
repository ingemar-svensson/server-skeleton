import { Connection } from "mongoose";
import { File, FileSchema } from "../domain/file.model";
import { InjectConnection } from "@nestjs/mongoose";
import { BaseRepository } from "../../shared/persistence/base.repository";

export class FileRepository
  extends BaseRepository<File>
{
  constructor(@InjectConnection() connection: Connection) {
    super({
      Default: { type: File, schema: FileSchema },
    }, connection);
  }

}