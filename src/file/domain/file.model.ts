import { Transform } from 'class-transformer';
import mongoose, { Schema } from 'mongoose';
import { BaseSchema, Entity, extendSchema } from '../../shared/persistence';

export class File implements Entity {

  constructor(file: {
    id?: string;
    referenceId?: string;
    url?: string;
    description: string;
  }) {
    this.id = file.id;
    this.referenceId = new mongoose.Types.ObjectId(file.referenceId);
    this.url = file.url;
    this.description = file.description;
  }

  readonly id?: string;
  @Transform(({ value }) => value.toString())
  readonly referenceId?: mongoose.Types.ObjectId;
  readonly url?: string;
  readonly description?: string;

}

export const FileSchema: Schema<File> = extendSchema(BaseSchema, {
  referenceId: { type: Schema.Types.ObjectId, required: true },
  url: { type: String, required: true },
  description: { type: String },
}, { collection: "Files" });