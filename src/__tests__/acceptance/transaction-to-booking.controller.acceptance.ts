import {Client, expect} from '@loopback/testlab';
import {subDays} from 'date-fns';
import {RentmonitorServerApplication} from '../..';
import {TransactionToBookingUrl} from '../../controllers/transaction-to-booking.controller';
import {AccountSettings, AccountTransaction, Tenant} from '../../models';
import {
  AccountSettingsRepository,
  AccountTransactionRepository,
  BookingRepository,
  TenantRepository,
} from '../../repositories';
import {
  clearDatabase,
  getTestUser,
  login,
  setupApplication,
  setupClientInDb,
  setupUserInDb,
} from '../helpers/acceptance-test.helpers';

describe('TransactionToBookingController Acceptance Tests', () => {
  let app: RentmonitorServerApplication;
  let http: Client;

  before('setupApplication', async () => {
    ({app, client: http} = await setupApplication());
  });

  beforeEach(async () => {
    await clearDatabase(app);
  });

  after(async () => {
    await app.stop();
  });

  // post

  it('should create bookings for existing transactions', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const testUser = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser);
    const tenant1Name = 'Tenant1NameOnAccount';
    const tenant1 = await setupTenantInDb(
      new Tenant({
        clientId: clientId1,
        name: 'Tenant1',
        accountSynchronisationName: tenant1Name,
      }),
    );
    const token = await login(http, testUser);

    const accountSettings1 = await setupAccountSettingsInDb(
      new AccountSettings({clientId: clientId1, name: 'AccountSettings1'}),
    );

    const expectedDate = new Date(2021, 1, 2);
    const expectedComment = 'Rent January 2021';
    const expectedAmount = 2500;
    await setupAccountTransactionInDb(
      new AccountTransaction({
        clientId: clientId1,
        accountSettingsId: accountSettings1.id,
        name: tenant1Name,
        date: expectedDate,
        text: expectedComment,
        amount: expectedAmount,
      }),
    );

    // test
    const res = await synchronizeTransactions(token, {})
      .expect(200)
      .expect('Content-Type', 'application/json');

    // assertions
    expect(res.body.newBookings).to.eql(1);
    expect(res.body.unmatchedTransactions).to.eql(0);

    const bookingRepository = await app.getRepository(BookingRepository);
    const bookingsInDb = await bookingRepository.find({
      where: {clientId: clientId1},
    });

    expect(bookingsInDb).to.have.lengthOf(1);
    expect(bookingsInDb[0].date).to.eql(expectedDate);
    expect(bookingsInDb[0].tenantId).to.eql(tenant1.id);
    expect(bookingsInDb[0].comment).to.eql(expectedComment);
    expect(bookingsInDb[0].amount).to.eql(expectedAmount);
  });

  it('should not create bookings if filter does not match', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const testUser = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser);
    const tenant1Name = 'Tenant1NameOnAccount';
    await setupTenantInDb(
      new Tenant({
        clientId: clientId1,
        name: 'Tenant1',
        accountSynchronisationName: tenant1Name,
      }),
    );
    const token = await login(http, testUser);

    const accountSettings1 = await setupAccountSettingsInDb(
      new AccountSettings({clientId: clientId1, name: 'AccountSettings1'}),
    );

    const expectedDate = new Date(2021, 1, 2);
    const expectedComment = 'Rent January 2021';
    const expectedAmount = 2500;
    await setupAccountTransactionInDb(
      new AccountTransaction({
        clientId: clientId1,
        accountSettingsId: accountSettings1.id,
        name: tenant1Name,
        date: expectedDate,
        text: expectedComment,
        amount: expectedAmount,
      }),
    );

    // test
    const res = await synchronizeTransactions(token, {
      from: subDays(expectedDate, 30),
      to: subDays(expectedDate, 2),
    })
      .expect(200)
      .expect('Content-Type', 'application/json');

    // assertions
    expect(res.body.newBookings).to.eql(0);
    expect(res.body.unmatchedTransactions).to.eql(0);

    const bookingRepository = await app.getRepository(BookingRepository);
    const bookingsInDb = await bookingRepository.find({
      where: {clientId: clientId1},
    });

    expect(bookingsInDb).to.have.lengthOf(0);
  });

  // non test methods --------------------------------------------------------------------

  function synchronizeTransactions(token: string, data: {}) {
    return http
      .post(TransactionToBookingUrl)
      .set('Authorization', 'Bearer ' + token)
      .send(data)
      .set('Content-Type', 'application/json');
  }

  async function setupTenantInDb(tenant: Tenant): Promise<Tenant> {
    const tenantRepository = await app.getRepository(TenantRepository);
    return tenantRepository.save(tenant);
  }

  async function setupAccountSettingsInDb(
    accountSettings: AccountSettings,
  ): Promise<AccountSettings> {
    const accountSettingsRepository = await app.getRepository(
      AccountSettingsRepository,
    );
    return accountSettingsRepository.save(accountSettings);
  }

  async function setupAccountTransactionInDb(
    accountTransaction: AccountTransaction,
  ): Promise<AccountTransaction> {
    const accountTransactionRepository = await app.getRepository(
      AccountTransactionRepository,
    );
    return accountTransactionRepository.save(accountTransaction);
  }
});
