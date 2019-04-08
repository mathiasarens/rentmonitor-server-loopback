import {FintsAccountTransactionSynchronization} from '../../../services/accountsynchronisation/fints';

describe('FinTs Integration', () => {
  let fints: FintsAccountTransactionSynchronization;

  before('setupApplication', async () => {
    fints = new FintsAccountTransactionSynchronization();
  });

  after(async () => {});

  /* tslint:disable:no-invalid-this */
  it('should get account transactions', async function() {
    this.timeout(8000);
    await fints.load();
  });
  /* tslint:enable:no-invalid-this */
});
