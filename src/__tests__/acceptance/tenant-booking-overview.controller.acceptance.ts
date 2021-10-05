import {Client, expect} from '@loopback/testlab';
import {RentmonitorServerApplication} from '../..';
import {TenantBookingOverviewUrl} from '../../controllers/tenant-booking-overview.controller';
import {Booking, Contract, Tenant} from '../../models';
import {
  clearDatabase,
  getTestUser,
  login,
  setupApplication,
  setupBookingInDb,
  setupClientInDb,
  setupContractInDb,
  setupTenantInDb,
  setupUserInDb,
} from '../helpers/acceptance-test.helpers';

describe('Tenant-Booking-Overview Controller Acceptance Tests', () => {
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

  it('should load bookings sum by tenant ordered by sum descending', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const testUser = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser);
    const tenant1 = await setupTenantInDb(
      app,
      new Tenant({
        clientId: clientId1,
        name: 'Tenant 1',
      }),
    );
    const tenant2 = await setupTenantInDb(
      app,
      new Tenant({
        clientId: clientId1,
        name: 'Tenant 2',
      }),
    );
    const token = await login(http, testUser);

    await setupBookingInDb(
      app,
      new Booking({
        clientId: clientId1,
        tenantId: tenant1.id,
        date: new Date(2019, 10, 1),
        comment: 'Rent 10/2019',
        amount: 2500,
      }),
    );

    await setupBookingInDb(
      app,
      new Booking({
        clientId: clientId1,
        tenantId: tenant1.id,
        date: new Date(2019, 11, 1),
        comment: 'Rent 11/2019',
        amount: 2500,
      }),
    );

    await setupBookingInDb(
      app,
      new Booking({
        clientId: clientId1,
        tenantId: tenant2.id,
        date: new Date(2020, 1, 1),
        comment: 'Rent 1/2020',
        amount: -1000,
      }),
    );

    await setupContractInDb(
      app,
      new Contract({
        clientId: clientId1,
        tenantId: tenant1.id,
        start: new Date(2020, 1, 1),
        amount: 1000,
        deposit: 5000,
      }),
    );

    // test
    const res = await loadTenantBookingOverview(token)
      .expect(200)
      .expect('Content-Type', 'application/json');

    // assertions
    expect(res.body).length(2);
    expect(res.body[0].tenant.name).to.eql('Tenant 2');
    expect(res.body[0].sum).to.eql(-1000);
    expect(res.body[1].tenant.name).to.eql('Tenant 1');
    expect(res.body[1].sum).to.eql(0);
  });

  // non test methods --------------------------------------------------------------------

  function loadTenantBookingOverview(token: string) {
    return http
      .get(TenantBookingOverviewUrl)
      .set('Authorization', 'Bearer ' + token);
  }
});
