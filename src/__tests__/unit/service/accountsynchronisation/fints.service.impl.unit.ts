import {
  createStubInstance,
  StubbedInstanceWithSinonAccessor,
} from '@loopback/testlab';
import {PinTanClient} from 'node-fints';
import {AccountSettingsRepository} from '../../../../repositories';
import {FintsClientFactory} from '../../../../services/accountsynchronisation/fints-client.factory';
import {FintsServiceImpl} from '../../../../services/accountsynchronisation/fints.service.impl';

describe('FinTs Service Imple Unit Tests', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let fintsService: FintsServiceImpl;
  let pintanClientStub: StubbedInstanceWithSinonAccessor<PinTanClient>;
  let accountSettingsRepositoryStub: StubbedInstanceWithSinonAccessor<AccountSettingsRepository>;

  beforeEach('setup service and database', async () => {
    pintanClientStub = createStubInstance(PinTanClient);

    fintsService = new FintsServiceImpl(
      new FintsClientFactoryTestImpl(pintanClientStub),
      accountSettingsRepositoryStub,
    );
  });

  after(async () => {});

  it('should synchronize fints transactions and create bookings', async function() {
    // given
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clientId = 1;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const accountSettingsId = 3234421;
    // when
    //const statements = await fintsService.fetchStatements('fintsBlz', 'fintsUrl', 'fintsUser', 'fintsPassword', 'selectedAccount');

    // then
    // sinon.assert.calledWithExactly(
    //   fintsAccountSynchronisationStub.fetchStatements,
    //   'blz',
    //   'url',
    //   'user',
    //   'password',
    //   'serializedFintsAccount',
    // );

    // sinon.assert.calledWithExactly(
    //   accountTransactionLogRepositoryStub.stubs.createAll,
    //   [
    //     new AccountTransactionLog({
    //       clientId: clientId,
    //       accountSettingsId: accountSettingsId,
    //       rawstring: 'rawstring1',
    //       time: now,
    //     }),
    //   ],
    // );

    // sinon.assert.calledWithExactly(
    //   accountSynchronisationSaveServiceStub.saveNewAccountTransactions,
    //   accountSettings1,
    //   accountTransactions,
    // );

    // sinon.assert.calledWithExactly(
    //   accountSynchronisationBookingServiceStub.createAndSaveBookings,
    //   clientId,
    //   accountTransactions,
    //   now,
    // );
  });
});

class FintsClientFactoryTestImpl implements FintsClientFactory {
  constructor(private pinTanClient: PinTanClient) {}

  create(
    fintsBlz: string,
    fintsUrl: string,
    fintsUser: string,
    fintsPassword: string,
  ): PinTanClient {
    return this.pinTanClient;
  }
}
