import {expect} from '@loopback/testlab';
import {FintsAccountTransactionSynchronization} from '../../../services/accountsynchronisation/fints.service';

describe.skip('FinTs Integration', () => {
  let fints: FintsAccountTransactionSynchronization;

  before('setupApplication', async () => {
    fints = new FintsAccountTransactionSynchronization();
  });

  after(async () => {});

  /* tslint:disable:no-invalid-this */
  it('should get account transactions', async function() {
    this.timeout(8000);

    // when
    const finTsAccountTransactions = await fints.load();

    // then
    expect(finTsAccountTransactions.length).to.be.above(0);
  });
  /* tslint:enable:no-invalid-this */
});
