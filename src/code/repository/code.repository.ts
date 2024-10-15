import { InjectConnection } from "@nestjs/mongoose";
import { Code, CodeSchema } from "../domain/code.model";
import { Connection } from "mongoose";
import { BaseRepository } from "../../shared/persistence/base.repository";

export class CodeRepository
  extends BaseRepository<Code>
{
  constructor(@InjectConnection() connection: Connection) {
    super({
      Default: { type: Code, schema: CodeSchema },
    }, connection);
  }

}