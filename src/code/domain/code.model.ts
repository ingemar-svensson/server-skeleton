import mongoose, { Schema } from 'mongoose';
import { BaseSchema, Entity, extendSchema } from '../../shared/persistence';

export enum CodeType {
  EmailVerification,
  EmailUpdate,
  PasswordReset,
}

export class Code implements Entity {
  constructor(code: {
      id?: string;
      referenceId: string;
      createdAt?: Date;
      value: string;
      type: CodeType;
      prop1?: string;
      prop2?: string;
      prop3?: string;
    }) {
      this.id = code.id;
      this.referenceId = new mongoose.Types.ObjectId(code.referenceId);
      this.createdAt = code.createdAt || new Date();
      this.value = code.value;
      this.type = code.type;
      this.prop1 = code.prop1;
      this.prop2 = code.prop2;
      this.prop3 = code.prop3;
    }
    readonly id?: string;
    readonly referenceId: mongoose.Types.ObjectId;
    readonly createdAt: Date;
    readonly value: string;
    readonly type: CodeType;
    prop1?: string;
    prop2?: string;
    prop3?: string;
}

export const CodeSchema: Schema<Code> = extendSchema(BaseSchema, {
  referenceId: { type: Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, required: true },
  value: { type: String, required: true },
  type: { type: String, enum: CodeType, required: true },
  prop1: { type: String, required: false },
  prop2: { type: String, required: false },
  prop3: { type: String, required: false },
}, { collection: "Codes" });
