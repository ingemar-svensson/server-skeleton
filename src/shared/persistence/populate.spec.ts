import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef } from '@nestjs/common';
import secrets from '../../shared/config/secrets';
import { AccountModule } from '../../account/account.module';
import { TenantModule } from '../../tenant/tenant.module';
import { AdminModule } from '../../admin/admin.module';
import { PropertyModule } from '../../property/property.module';
import { ProposalRepository } from '../../proposal/repository/proposal.repository';
import { AccountRepository } from '../../account/repository/account.repository';
import { TenantRepository } from '../../tenant/repository/tenant.repository';
import { BrokerRepository } from '../../admin/repository/broker.repository';
import { PropertyRepository } from '../../property/repository/property.repository';
import { SharedModule } from '../../shared/shared.module';
import { ProposalModule } from '../../proposal/proposal.module';
import { createTestAgency, createTestBroker, createTestProperty, createTestTenant } from '../../shared/util/test-data';
import { Broker } from '../../admin/domain/broker.model';
import { Tenant } from '../../tenant/domain/tenant.model';
import { Account } from '../../account/domain/account.model';
import { Property } from '../../property/domain/property.model';
import { AgencyRepository } from '../../agency/repository/agency.repository';


describe('Populate', () => {
  let app: TestingModule;
  let agencyRepository: AgencyRepository;
  let accountRepository: AccountRepository;
  let tenantRepository: TenantRepository;
  let brokerRepository: BrokerRepository;
  let propertyRepository: PropertyRepository;
  let proposalRepository: ProposalRepository;

  beforeAll(async () => {
    const _app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [secrets] }),
        MongooseModule.forRootAsync({
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get<string>("databaseUrl"),
          }),
          inject: [ConfigService],
        }),
        forwardRef(() => SharedModule),
        forwardRef(() => AccountModule),
        forwardRef(() => TenantModule),
        forwardRef(() => AdminModule),
        forwardRef(() => PropertyModule),
        forwardRef(() => ProposalModule),
      ],
      providers: [
        AccountRepository,
        TenantRepository,
        BrokerRepository,
        PropertyRepository,
        ProposalRepository,
      ],
    }).compile();
    agencyRepository = _app.get<AgencyRepository>(AgencyRepository);
    accountRepository = _app.get<AccountRepository>(AccountRepository);
    tenantRepository = _app.get<TenantRepository>(TenantRepository);
    brokerRepository = _app.get<BrokerRepository>(BrokerRepository);
    propertyRepository = _app.get<PropertyRepository>(PropertyRepository);
    proposalRepository = _app.get<ProposalRepository>(ProposalRepository);
    app = _app;
  });

  describe('populate', () => {
    it('should set up a clean db with fake data', async () => {

      // delete all data
      await agencyRepository.deleteAll({filters: {}});
      await accountRepository.deleteAll({filters: {}});
      await tenantRepository.deleteAll({filters: {}});
      await brokerRepository.deleteAll({filters: {}});
      await propertyRepository.deleteAll({filters: {}});
      await proposalRepository.deleteAll({filters: {}});

      // set up agency
      const agency = await createTestAgency(app);
      // set up 10 brokers (there should be one b@b.com)
      const brokers: Broker[] = [];
      for(let i = 0; i < 10; i++) {
       const broker = await createTestBroker(app, agency);
       brokers.push(broker);
      }
      let brokerAccount = await accountRepository.getById(brokers[0].account?.id as string);
      brokerAccount = new Account({
        ...brokerAccount,
        email: "b@b.com",
      });
      await accountRepository.save(brokerAccount);

      const properties: Property[] = [];
      for(let i = 0; i < brokers.length; i++) {
        for(let j = 0; j < 10; j++) {
          const property = await createTestProperty(app, brokers[i], j);
          properties.push(property);
        }
      }

      // set up 100 tenants (there should be one t@t.com)
      const tenants: Tenant[] = [];
      for(let i = 0; i < 10; i++) {
        tenants.push(await createTestTenant(app, properties[i].address));
      }
      let tenantAccount = await accountRepository.getById(tenants[0].account?.id as string);
      tenantAccount = new Account({
        ...tenantAccount,
        email: "t@t.com",
      });
      await accountRepository.save(tenantAccount);

    });
  });

  afterAll(async () => {
    await app.close();
  });

});
