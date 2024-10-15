import { Schema } from 'mongoose';
import { Auditable, AuditableClass, AuditableSchema, Entity, extendSchema } from '../../shared/persistence';

export enum AccountType {
  User = "User",
  Admin = "Admin",
}

export enum AccountStatus {
  New = "New",
  Active = "Active",
  Deleted = "Deleted",
}

export class Account extends AuditableClass implements Entity {
  constructor(account: {
    id?: string;
    lastLoginAt?: Date;
    name?: string;
    email?: string;
    telephone?: string;
    password?: string;
    status?: AccountStatus;
    type?: AccountType;
    isDeleted?: boolean;
    paymentId?: string;
  } & Auditable) {
    super(account);
    this.id = account?.id;
    this.lastLoginAt = account?.lastLoginAt;
    this.name = account?.name;
    this.email = account?.email;
    this.telephone = account?.telephone;
    this.password = account?.password;
    this.status = account?.status;
    this.type = account?.type;
    this.isDeleted = account?.isDeleted;
    this.paymentId = account?.paymentId;
  }
  readonly id?: string;
  readonly lastLoginAt?: Date;
  readonly name?: string;
  readonly email?: string;
  readonly telephone?: string;
  readonly password?: string;
  readonly status?: AccountStatus;
  readonly type?: AccountType;
  readonly isDeleted?: boolean;
  readonly paymentId?: string;
}

export const AccountSchema: Schema<Account> = extendSchema(AuditableSchema, {
  lastLoginAt: { type: Date, required: false },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telephone: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  status: { type: String, enum: AccountStatus, required: true },
  type: { type: String, enum: AccountType, required: false },
  isDeleted: { type: Boolean, required: false },
  paymentId: { type: String, required: true },
}, { collection: "Accounts" });
