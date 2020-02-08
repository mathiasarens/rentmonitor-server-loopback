import {expect} from '@loopback/testlab';
import {AccountSettings} from '../../../models/account-settings.model';
import {AccountSettingsRepository} from '../../../repositories';
import {FintsClientFactoryImpl} from '../../../services/accountsynchronisation/fints-client.factory.impl';
import {FintsService} from '../../../services/accountsynchronisation/fints.service';
import {FintsServiceImpl} from '../../../services/accountsynchronisation/fints.service.impl';

describe.skip('FinTs Integration', () => {
  let fints: FintsService;

  before('setupApplication', async () => {
    fints = new FintsServiceImpl(
      new FintsClientFactoryImpl(),
      {} as AccountSettingsRepository,
    );
  });

  after(async () => {});

  it('should get account transactions', async function() {
    // when
    const finTsAccountTransactions = await fints.fetchStatements(
      new AccountSettings({
        fintsBlz: process.env.FINTS_BLZ as string,
        fintsUrl: process.env.FINTS_URL as string,
        fintsUser: process.env.FINTS_USER as string,
        fintsPassword: process.env.FINTS_PASSWORD as string,
      }),
    );

    // then
    expect(finTsAccountTransactions.length).to.be.above(0);
  });
});
