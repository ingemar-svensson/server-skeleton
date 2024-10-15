import { ClientSession, Connection, UpdateQuery } from 'mongoose';
import { BaseRepository, TypeMap } from './base.repository';
import { PartialEntityWithId } from './repository';
import { TransactionalRepository } from './transactional-repository';
import { Entity } from './entity';
import { IllegalArgumentException } from './exceptions';
import { DeleteAllOptions, SaveAllOptions } from './operation-options';
import { runInTransaction } from './transaction';

/**
 * Abstract Mongoose-based implementation of the {@link TransactionalRepository} interface.
 */
export abstract class BaseTransactionalRepository<
    T extends Entity & UpdateQuery<T>,
  >
  extends BaseRepository<T>
  implements TransactionalRepository<T>
{
  /**
   * Sets up the underlying configuration to enable database operation execution.
   * @param {TypeMap<T>} typeMap a map of domain object types supported by this repository.
   * @param {Connection=} connection (optional) a connection to an instance of MongoDB.
   */
  protected constructor(typeMap: TypeMap<T>, connection?: Connection) {
    super(typeMap, connection);
  }

  /** @inheritdoc */
  async saveAll<S extends T>(
    entities: (S | PartialEntityWithId<S>)[],
    options?: SaveAllOptions,
  ): Promise<S[]> {
    return await runInTransaction(
      async (session: ClientSession) =>
        await Promise.all(
          entities.map(
            async (entity) =>
              await this.save(entity, {
                userId: options?.userId,
                session,
              }),
          ),
        ),
      { connection: this.connection },
    );
  }

  /** @inheritdoc */
  async deleteAll(options?: DeleteAllOptions): Promise<number> {
    if (options?.filters === null) {
      throw new IllegalArgumentException('Null filters are disallowed');
    }
    return await runInTransaction(
      async (session: ClientSession) =>
        (await this.entityModel.deleteMany(options?.filters, { session }))
          .deletedCount,
      { connection: this.connection },
    );
  }
}
