import {Client, expect} from '@loopback/testlab';
import {RentmonitorServerApplication} from '../..';
import {ContractToBookingUrl} from '../../controllers/contract-to-booking.controller';
import {Contract, Tenant} from '../../models';
import {
  BookingRepository,
  ContractRepository,
  TenantRepository,
} from '../../repositories';
import {
  AuthenticationTokens,
  clearDatabase,
  getTestUser,
  login,
  setupApplication,
  setupClientInDb,
  setupUserInDb,
} from '../helpers/acceptance-test.helpers';

describe('ContractToBookingController Acceptance Tests', () => {
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
    const testUser = getTestUser(clientId1, 1);
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

    const expectedDate = new Date(2021, 1, 2);
    const expectedAmount = 2500;
    const contract1 = await setupContractInDb(
      new Contract({
        clientId: clientId1,
        tenantId: tenant1.id,
        start: expectedDate,
        rentDueEveryMonth: 1,
        rentDueDayOfMonth: 10,
        amount: expectedAmount,
      }),
    );

    // test
    const res = await synchronizeContract(token, {
      tenantIds: [tenant1.id],
      from: new Date(2021, 1, 1),
      to: new Date(2021, 2, 1),
    })
      .expect(200)
      .expect('Content-Type', 'application/json');

    // assertions
    expect(res.body.newBookings).to.eql(1);
    expect(res.body.matchedContracts).to.eql(1);
    expect(res.body.unmatchedContracts).to.eql(0);

    const bookingRepository = await app.getRepository(BookingRepository);
    const bookingsInDb = await bookingRepository.find({
      where: {clientId: clientId1},
    });

    expect(bookingsInDb).to.have.lengthOf(1);
    expect(bookingsInDb[0].date).to.eql(new Date(2021, 1, 10));
    expect(bookingsInDb[0].tenantId).to.eql(tenant1.id);
    expect(bookingsInDb[0].contractId).to.eql(contract1.id);
    expect(bookingsInDb[0].comment).to.eql('2/2021');
    expect(bookingsInDb[0].amount).to.eql(-1 * expectedAmount);
  });

  // non test methods --------------------------------------------------------------------

  function synchronizeContract(token: AuthenticationTokens, data: {}) {
    return http
      .post(ContractToBookingUrl)
      .set('Authorization', 'Bearer ' + token.accessToken)
      .set('Authentication', 'Bearer ' + token.idToken)
      .send(data)
      .set('Content-Type', 'application/json');
  }

  async function setupTenantInDb(tenant: Tenant): Promise<Tenant> {
    const tenantRepository = await app.getRepository(TenantRepository);
    return tenantRepository.save(tenant);
  }

  async function setupContractInDb(contract: Contract): Promise<Contract> {
    const contractRepository = await app.getRepository(ContractRepository);
    return contractRepository.create(contract);
  }
});
