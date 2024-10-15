import { TestingModule } from "@nestjs/testing";
import { AccountRepository } from "../../account/repository/account.repository";
import { PaymentService } from "../../payment/service/payment.service";
import { Account, AccountStatus, AccountType } from "../../account/domain/account.model";
import { hashPassword } from "./password";
import { faker } from '@faker-js/faker';

export const createTestAccount = async (app: TestingModule, type?: AccountType, noSave?: boolean) => {
  const accountRepository = app.get<AccountRepository>(AccountRepository);
  const paymentService = app.get<PaymentService>(PaymentService);
  const email = faker.internet.email();
  const paymentId = await paymentService.createPaymentId(email);
  const account = new Account({
    name: faker.person.fullName(),
    email: email.toLowerCase(),
    telephone: faker.phone.number(),
    password: hashPassword('pass123'),
    type: type ? type : AccountType.User,
    status: AccountStatus.Active,
    paymentId,
  });
  if(!noSave) {
    const result = await accountRepository.save(account);
    return await accountRepository.getById(result.id);
  } else {
    return account;
  }
};
