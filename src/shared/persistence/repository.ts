import { Entity } from './entity';
import { DeleteAllOptions, SaveOptions, SearchOptions } from './operation-options';
import mongoose from 'mongoose';

/**
 * Models an entity with partial content that specifies a Mongo `id` and (optionally) a Mongoose discriminator key.
 */
export type PartialEntityWithId<T extends Entity> = {
  id: string;
} & {
  __t?: string;
} & Partial<T>;

/**
 * Specifies a list of common database CRUD operations.
 */
export interface Repository<T extends Entity> {
  /**
   * Finds an entity by ID.
   * @param {string} id the ID of the entity.
   * @returns {Promise<S>} the entity or null.
   * @throws {IllegalArgumentException} if the given `id` is `undefined` or `null`.
   */
  getById: <S extends T>(id: string) => Promise<S>;

  /**
   * Finds all entities.
   * @param {SearchOptions} options (optional) search operation options.
   * @returns {Promise<S[]>} all entities.
   * @throws {IllegalArgumentException} if the given `options` specifies an invalid parameter.
   */
  getAll: <S extends T>(options?: SearchOptions) => Promise<S[]>;

  /**
   * Finds all entities.
   * @param {SearchOptions} options (optional) search operation options.
   * @returns {Promise<S[]>} all entities.
   * @throws {IllegalArgumentException} if the given `options` specifies an invalid parameter.
   */
  aggregate: <S extends T>(pipeline?: mongoose.PipelineStage[]) => Promise<S[]>;

  /**
   * Saves (insert or update) an entity.
   * @param {S | PartialEntityWithId<S>} entity the entity to save.
   * @param {SaveOptions=} options (optional) save operation options.
   * @returns {Promise<S>} the saved entity.
   * @throws {IllegalArgumentException} if the given entity is `undefined` or `null` or
   * specifies an `id` not matching any existing entity.
   * @throws {ValidationException} if the given entity specifies a field with some invalid value.
   */
  save: <S extends T>(
    entity: S | PartialEntityWithId<S>,
    options?: SaveOptions,
  ) => Promise<S>;

  /**
   * Deletes an entity by ID.
   * @param {string} id the ID of the entity.
   * @returns {Promise<boolean>} `true` if the entity was deleted, `false` otherwise.
   * @throws {IllegalArgumentException} if the given `id` is `undefined` or `null`.
   */
  deleteById: (id: string) => Promise<boolean>;

  /**
   * Deletes all the entities that match the given filter, if any. No filter specification will
   * result in the deletion of all entities.
   * @param {DeleteAllOptions=} options (optional) delete operation options.
   * @returns {number} the number of deleted entities.
   * @see {@link DeleteAllOptions}
   */
  deleteAll: (options?: DeleteAllOptions) => Promise<number>;


}
