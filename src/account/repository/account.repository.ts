import { Account, AccountSchema } from "../domain/account.model";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { BaseRepository } from "../../shared/persistence/base.repository";

export class AccountRepository
  extends BaseRepository<Account>
{
  constructor(@InjectConnection() connection: Connection) {
    super({
      Default: { type: Account, schema: AccountSchema },
    }, connection);
  }

}