import {Client, expect} from '@loopback/testlab';
import {RentmonitorServerApplication} from '../..';
import {BookingsUrl} from '../../controllers';
import {Booking, Contract, Tenant} from '../../models';
import {
  BookingRepository,
  ContractRepository,
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

describe('BookingController', () => {
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

  it('should add minimal new booking on post', async () => {
    const clientId = await setupClientInDb(app, 'TestClient1');
    const testUser = getTestUser('1');
    await setupUserInDb(app, clientId, testUser);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId, name: 'Tenant1'}),
    );
    const token = await login(http, testUser);
    const expectedDate = new Date();
    const expectedAmount = 2500;

    const res = await createBookingViaHttp(token, {
      tenantId: tenant1.id,
      date: expectedDate,
      amount: expectedAmount,
    })
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.id).to.be.a.Number();
    expect(res.body.clientId).to.eql(clientId);
    expect(res.body.tenantId).to.eql(tenant1.id);
    expect(res.body.date).to.eql(expectedDate.toISOString());
    expect(res.body.amount).to.eql(expectedAmount);
  });

  it('should add booking and override clientId from logged in user / wrong clientId passed', async () => {
    const clientId = await setupClientInDb(app, 'TestClient1');
    const testUser = getTestUser('1');
    await setupUserInDb(app, clientId, testUser);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId, name: 'Tenant1'}),
    );
    const token = await login(http, testUser);
    const expectedDate = new Date();
    const expectedAmount = 2500;

    const res = await createBookingViaHttp(token, {
      clientId: 1,
      tenantId: tenant1.id,
      date: expectedDate,
      amount: expectedAmount,
    })
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.id).to.be.a.Number();
    expect(res.body.clientId).to.eql(clientId);
    expect(res.body.tenantId).to.eql(tenant1.id);
    expect(res.body.date).to.eql(expectedDate.toISOString());
    expect(res.body.amount).to.eql(expectedAmount);
  });

  it('should add full new booking on post', async () => {
    const clientId = await setupClientInDb(app, 'TestClient1');
    const testUser = getTestUser('1');
    await setupUserInDb(app, clientId, testUser);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId, name: 'Tenant1'}),
    );
    const contract1 = await setupContractInDb(
      new Contract({
        clientId: clientId,
        tenantId: tenant1.id,
        start: new Date(),
        rentDueEveryMonth: 1,
        rentDueDayOfMonth: 10,
        amount: 10,
      }),
    );
    const token = await login(http, testUser);

    const expectedDate = new Date();
    const expectedAmount = 2500;
    const expectedComment = 'Test comment';

    const res = await createBookingViaHttp(token, {
      tenantId: tenant1.id,
      contractId: contract1.id,
      date: expectedDate,
      comment: expectedComment,
      amount: expectedAmount,
    })
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.id).to.be.a.Number();
    expect(res.body.clientId).to.eql(clientId);
    expect(res.body.tenantId).to.eql(tenant1.id);
    expect(res.body.contractId).to.equal(contract1.id);
    expect(res.body.date).to.eql(expectedDate.toISOString());
    expect(res.body.comment).to.eql(expectedComment);
    expect(res.body.amount).to.eql(expectedAmount);
  });

  // count

  it("should count bookings for users' clientId only / client with bookings", async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    const token1 = await login(http, testUser1);
    const expectedDate = new Date();
    await setupBookingInDb(
      new Booking({
        clientId: clientId1,
        tenantId: tenant1.id,
        date: expectedDate,
        amount: 1000,
      }),
    );

    // test
    const res = await http
      .get(`${BookingsUrl}/count`)
      .set('Authorization', 'Bearer ' + token1)
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.count).to.eql(1);
  });

  it('should return zero count if user passed false clientId', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant1'}),
    );
    const token1 = await login(http, testUser1);
    const expectedDate = new Date();
    await setupBookingInDb(
      new Booking({
        clientId: clientId2,
        tenantId: tenant2.id,
        date: expectedDate,
        amount: 1000,
      }),
    );

    // test
    const res = await http
      .get(`${BookingsUrl}/count?where[clientId]=${clientId2}`)
      .set('Authorization', 'Bearer ' + token1)
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.count).to.eql(0);
  });

  // get

  it('should find zero bookings if user passed false clientId', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const expectedDate = new Date();
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
    );
    await setupBookingInDb(
      new Booking({
        clientId: clientId1,
        tenantId: tenant1.id,
        date: expectedDate,
        amount: 1000,
      }),
    );
    await setupBookingInDb(
      new Booking({
        clientId: clientId2,
        tenantId: tenant2.id,
        date: expectedDate,
        amount: 1500,
      }),
    );

    // test
    const res = await http
      .get(`${BookingsUrl}?filter[where][clientId]=${clientId2}`)
      .set('Authorization', 'Bearer ' + token1)
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.length).to.eql(0);
  });

  it("should find bookings for users' clientId only if user uses a where filter without clientId", async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
    );
    const expectedDate = new Date();
    const expectedAmount = 1000;
    await setupBookingInDb(
      new Booking({
        clientId: clientId1,
        tenantId: tenant1.id,
        date: expectedDate,
        amount: expectedAmount,
      }),
    );
    await setupBookingInDb(
      new Booking({
        clientId: clientId2,
        tenantId: tenant2.id,
        date: new Date(2020, 10, 12),
        amount: expectedAmount + 2,
      }),
    );

    // test
    const res = await http
      .get(`${BookingsUrl}`)
      .set('Authorization', 'Bearer ' + token1)
      .expect(200)
      .expect('Content-Type', 'application/json');

    // asserts
    expect(res.body.length).to.eql(1);
    expect(res.body[0].tenantId).to.eql(tenant1.id);
    expect(res.body[0].date).to.eql(expectedDate.toISOString());
    expect(res.body[0].amount).to.eql(expectedAmount);
  });

  // patch

  it('should update bookings if no clientId is given', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    const testUser2 = getTestUser('2');
    await setupUserInDb(app, clientId1, testUser1);
    await setupUserInDb(app, clientId2, testUser2);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
    );
    const expectedDate = new Date();
    const expectedAmount = 1000;
    await setupBookingInDb(
      new Booking({
        clientId: clientId1,
        tenantId: tenant1.id,
        date: expectedDate,
        amount: expectedAmount - 300,
      }),
    );
    await setupBookingInDb(
      new Booking({
        clientId: clientId2,
        tenantId: tenant2.id,
        date: new Date(2020, 10, 12),
        amount: expectedAmount + 200,
      }),
    );

    // test
    const res = await http
      .patch(`${BookingsUrl}`)
      .set('Authorization', 'Bearer ' + token1)
      .set('Content-Type', 'application/json')
      .send({amount: expectedAmount})
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.count).to.eql(1);

    const bookingRepository = await app.getRepository(BookingRepository);

    const clientId1Bookings = await bookingRepository.find({
      where: {clientId: clientId1},
    });
    expect(clientId1Bookings.length).to.eql(1);
    expect(clientId1Bookings[0].amount).to.eql(expectedAmount);

    const clientId2Bookings = await bookingRepository.find({
      where: {clientId: clientId2},
    });
    expect(clientId2Bookings.length).to.eql(1);
    expect(clientId2Bookings[0].amount).to.eql(expectedAmount + 200);
  });

  it('should not update bookings if different clientId is given', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
    );
    const expectedDate = new Date();
    const expectedAmount = 1000;
    await setupBookingInDb(
      new Booking({
        clientId: clientId1,
        tenantId: tenant1.id,
        date: expectedDate,
        amount: expectedAmount - 300,
      }),
    );
    await setupBookingInDb(
      new Booking({
        clientId: clientId2,
        tenantId: tenant2.id,
        date: new Date(2020, 10, 12),
        amount: expectedAmount + 200,
      }),
    );

    // test
    const res = await http
      .patch(`${BookingsUrl}?where[clientId]=${clientId2}`)
      .set('Authorization', 'Bearer ' + token1)
      .set('Content-Type', 'application/json')
      .send({amount: expectedAmount})
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.count).to.eql(0);

    // asserts
    const bookingRepository = await app.getRepository(BookingRepository);

    const clientId1Bookings = await bookingRepository.find({
      where: {clientId: clientId1},
    });
    expect(clientId1Bookings.length).to.eql(1);
    expect(clientId1Bookings[0].amount).to.eql(expectedAmount - 300);

    const clientId2Bookings = await bookingRepository.find({
      where: {clientId: clientId2},
    });
    expect(clientId2Bookings.length).to.eql(1);
    expect(clientId2Bookings[0].amount).to.eql(expectedAmount + 200);
  });

  it('should not update the client of a booking to a different clientId', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
    );
    const expectedDate = new Date();
    const expectedAmount = 1000;
    await setupBookingInDb(
      new Booking({
        clientId: clientId1,
        tenantId: tenant1.id,
        date: expectedDate,
        amount: expectedAmount - 300,
      }),
    );
    await setupBookingInDb(
      new Booking({
        clientId: clientId2,
        tenantId: tenant2.id,
        date: new Date(2020, 10, 12),
        amount: expectedAmount + 200,
      }),
    );

    // test
    await http
      .patch(`${BookingsUrl}`)
      .set('Authorization', 'Bearer ' + token1)
      .set('Content-Type', 'application/json')
      .send({clientId: clientId2})
      .expect(422)
      .expect('Content-Type', 'application/json; charset=utf-8');

    // asserts
    const bookingRepository = await app.getRepository(BookingRepository);

    const clientId1Bookings = await bookingRepository.find({
      where: {clientId: clientId1},
    });
    expect(clientId1Bookings.length).to.eql(1);
    expect(clientId1Bookings[0].clientId).to.eql(clientId1);
    expect(clientId1Bookings[0].amount).to.eql(expectedAmount - 300);

    const clientId2Bookings = await bookingRepository.find({
      where: {clientId: clientId2},
    });
    expect(clientId2Bookings.length).to.eql(1);
    expect(clientId2Bookings[0].clientId).to.eql(clientId2);
    expect(clientId2Bookings[0].amount).to.eql(expectedAmount + 200);
  });

  // findById

  it("should find bookings by id for users' clientId only if api user uses no filter", async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
    );
    const expectedDate = new Date();
    const expectedAmount = 1000;
    const booking1 = await setupBookingInDb(
      new Booking({
        clientId: clientId1,
        tenantId: tenant1.id,
        date: expectedDate,
        amount: expectedAmount - 300,
      }),
    );
    await setupBookingInDb(
      new Booking({
        clientId: clientId2,
        tenantId: tenant2.id,
        date: new Date(2020, 10, 12),
        amount: expectedAmount + 200,
      }),
    );

    const res = await http
      .get(`${BookingsUrl}/${booking1.id}`)
      .set('Authorization', 'Bearer ' + token1)
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.tenantId).to.eql(tenant1.id);
    expect(res.body.date).to.eql(expectedDate.toISOString());
    expect(res.body.amount).to.eql(expectedAmount - 300);
  });

  it("should not find bookings by id for users' clientId only if api user uses no filter", async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
    );
    const expectedDate = new Date();
    const expectedAmount = 1000;
    await setupBookingInDb(
      new Booking({
        clientId: clientId1,
        tenantId: tenant1.id,
        date: expectedDate,
        amount: expectedAmount - 300,
      }),
    );
    const booking2 = await setupBookingInDb(
      new Booking({
        clientId: clientId2,
        tenantId: tenant2.id,
        date: new Date(2020, 10, 12),
        amount: expectedAmount + 200,
      }),
    );

    // test
    await http
      .get(`${BookingsUrl}/${booking2.id}`)
      .set('Authorization', 'Bearer ' + token1)
      .expect(204);
  });

  it('should not find bookings if user filters for different bookingId and different clientId', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
    );
    const expectedDate = new Date();
    const expectedAmount = 1000;
    await setupBookingInDb(
      new Booking({
        clientId: clientId1,
        tenantId: tenant1.id,
        date: expectedDate,
        amount: expectedAmount - 300,
      }),
    );
    const booking2 = await setupBookingInDb(
      new Booking({
        clientId: clientId2,
        tenantId: tenant2.id,
        date: new Date(2020, 10, 12),
        amount: expectedAmount + 200,
      }),
    );

    await http
      .get(`${BookingsUrl}/${booking2.id}?where[clientId]=${clientId2}`)
      .set('Authorization', 'Bearer ' + token1)
      .expect(204);
  });

  // patch by id

  it("should update booking by id for users' clientId only if no clientId is given", async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
    );
    const expectedDate = new Date();
    const expectedDate2 = new Date(2020, 10, 12);
    const expectedAmount = 1000;
    const booking1 = await setupBookingInDb(
      new Booking({
        clientId: clientId1,
        tenantId: tenant1.id,
        date: expectedDate,
        amount: expectedAmount - 300,
      }),
    );
    await setupBookingInDb(
      new Booking({
        clientId: clientId2,
        tenantId: tenant2.id,
        date: expectedDate2,
        amount: expectedAmount + 200,
      }),
    );

    await http
      .patch(`${BookingsUrl}/${booking1.id}`)
      .set('Authorization', 'Bearer ' + token1)
      .set('Content-Type', 'application/json')
      .send({amount: expectedAmount})
      .expect(204);

    // asserts
    const bookingRepository = await app.getRepository(BookingRepository);

    const clientId1Bookings = await bookingRepository.find({
      where: {clientId: clientId1},
    });
    expect(clientId1Bookings.length).to.eql(1);
    expect(clientId1Bookings[0].clientId).to.eql(clientId1);
    expect(clientId1Bookings[0].date).to.eql(expectedDate);
    expect(clientId1Bookings[0].amount).to.eql(expectedAmount);

    const clientId2Bookings = await bookingRepository.find({
      where: {clientId: clientId2},
    });
    expect(clientId2Bookings.length).to.eql(1);
    expect(clientId2Bookings[0].clientId).to.eql(clientId2);
    expect(clientId2Bookings[0].date).to.eql(expectedDate2);
    expect(clientId2Bookings[0].amount).to.eql(expectedAmount + 200);
  });

  it('should not update booking by id if different clientId is given', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
    );
    const expectedDate = new Date();
    const expectedDate2 = new Date(2020, 10, 12);
    const expectedAmount = 1000;
    await setupBookingInDb(
      new Booking({
        clientId: clientId1,
        tenantId: tenant1.id,
        date: expectedDate,
        amount: expectedAmount - 300,
      }),
    );
    const booking2 = await setupBookingInDb(
      new Booking({
        clientId: clientId2,
        tenantId: tenant2.id,
        date: expectedDate2,
        amount: expectedAmount + 200,
      }),
    );

    await http
      .patch(`${BookingsUrl}/${booking2.id}?where[clientId]=${clientId2}`)
      .set('Authorization', 'Bearer ' + token1)
      .set('Content-Type', 'application/json')
      .send({amount: expectedAmount})
      .expect(204);

    // asserts
    const bookingRepository = await app.getRepository(BookingRepository);

    const clientId1Bookings = await bookingRepository.find({
      where: {clientId: clientId1},
    });
    expect(clientId1Bookings.length).to.eql(1);
    expect(clientId1Bookings[0].clientId).to.eql(clientId1);
    expect(clientId1Bookings[0].date).to.eql(expectedDate);
    expect(clientId1Bookings[0].amount).to.eql(expectedAmount - 300);

    const clientId2Bookings = await bookingRepository.find({
      where: {clientId: clientId2},
    });
    expect(clientId2Bookings.length).to.eql(1);
    expect(clientId2Bookings[0].clientId).to.eql(clientId2);
    expect(clientId2Bookings[0].date).to.eql(expectedDate2);
    expect(clientId2Bookings[0].amount).to.eql(expectedAmount + 200);
  });

  it('should not update booking by id if own clientId is set to a different clientId', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
    );
    const expectedDate = new Date();
    const expectedDate2 = new Date(2020, 10, 12);
    const expectedAmount = 1000;
    const booking1 = await setupBookingInDb(
      new Booking({
        clientId: clientId1,
        tenantId: tenant1.id,
        date: expectedDate,
        amount: expectedAmount - 300,
      }),
    );
    await setupBookingInDb(
      new Booking({
        clientId: clientId2,
        tenantId: tenant2.id,
        date: expectedDate2,
        amount: expectedAmount + 200,
      }),
    );

    await http
      .patch(`${BookingsUrl}/${booking1.id}`)
      .set('Authorization', 'Bearer ' + token1)
      .set('Content-Type', 'application/json')
      .send({clientId: clientId2})
      .expect(422)
      .expect('Content-Type', 'application/json; charset=utf-8');

    // asserts
    const bookingRepository = await app.getRepository(BookingRepository);

    const clientId1Bookings = await bookingRepository.find({
      where: {clientId: clientId1},
    });
    expect(clientId1Bookings.length).to.eql(1);
    expect(clientId1Bookings[0].clientId).to.eql(clientId1);
    expect(clientId1Bookings[0].date).to.eql(expectedDate);
    expect(clientId1Bookings[0].amount).to.eql(expectedAmount - 300);

    const clientId2Bookings = await bookingRepository.find({
      where: {clientId: clientId2},
    });
    expect(clientId2Bookings.length).to.eql(1);
    expect(clientId2Bookings[0].clientId).to.eql(clientId2);
    expect(clientId2Bookings[0].date).to.eql(expectedDate2);
    expect(clientId2Bookings[0].amount).to.eql(expectedAmount + 200);
  });

  // put

  it('should replace booking1 by new booking', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
    );
    const expectedDate = new Date();
    const expectedDate2 = new Date(2020, 10, 12);
    const expectedAmount = 1000;
    const booking1 = await setupBookingInDb(
      new Booking({
        clientId: clientId1,
        tenantId: tenant1.id,
        date: expectedDate,
        amount: expectedAmount - 300,
      }),
    );
    await setupBookingInDb(
      new Booking({
        clientId: clientId2,
        tenantId: tenant2.id,
        date: expectedDate2,
        amount: expectedAmount + 200,
      }),
    );

    await http
      .put(`${BookingsUrl}/${booking1.id}`)
      .set('Authorization', 'Bearer ' + token1)
      .set('Content-Type', 'application/json')
      .send(
        new Booking({
          id: booking1.id,
          clientId: booking1.clientId,
          date: expectedDate,
          amount: expectedAmount,
        }),
      )
      .expect(204);

    // asserts
    const bookingRepository = await app.getRepository(BookingRepository);

    const clientId1Bookings = await bookingRepository.find({
      where: {clientId: clientId1},
    });
    expect(clientId1Bookings.length).to.eql(1);
    expect(clientId1Bookings[0].clientId).to.eql(clientId1);
    expect(clientId1Bookings[0].date).to.eql(expectedDate);
    expect(clientId1Bookings[0].amount).to.eql(expectedAmount);

    const clientId2Bookings = await bookingRepository.find({
      where: {clientId: clientId2},
    });
    expect(clientId2Bookings.length).to.eql(1);
    expect(clientId2Bookings[0].clientId).to.eql(clientId2);
    expect(clientId2Bookings[0].date).to.eql(expectedDate2);
    expect(clientId2Bookings[0].amount).to.eql(expectedAmount + 200);
  });

  it('should not replace client id of booking1 to clientId2', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
    );
    const expectedDate = new Date();
    const expectedDate2 = new Date(2020, 10, 12);
    const expectedAmount = 1000;
    const booking1 = await setupBookingInDb(
      new Booking({
        clientId: clientId1,
        tenantId: tenant1.id,
        date: expectedDate,
        amount: expectedAmount - 300,
      }),
    );
    await setupBookingInDb(
      new Booking({
        clientId: clientId2,
        tenantId: tenant2.id,
        date: expectedDate2,
        amount: expectedAmount + 200,
      }),
    );

    await http
      .put(`${BookingsUrl}/${booking1.id}`)
      .set('Authorization', 'Bearer ' + token1)
      .set('Content-Type', 'application/json')
      .send({
        id: tenant1.id,
        clientId: clientId2,
        date: expectedDate2,
        amount: expectedAmount,
      })
      .expect(204);

    // asserts
    const bookingRepository = await app.getRepository(BookingRepository);

    const clientId1Bookings = await bookingRepository.find({
      where: {clientId: clientId1},
    });
    expect(clientId1Bookings.length).to.eql(1);
    expect(clientId1Bookings[0].clientId).to.eql(clientId1);
    expect(clientId1Bookings[0].date).to.eql(expectedDate);
    expect(clientId1Bookings[0].amount).to.eql(expectedAmount - 300);

    const clientId2Bookings = await bookingRepository.find({
      where: {clientId: clientId2},
    });
    expect(clientId2Bookings.length).to.eql(1);
    expect(clientId2Bookings[0].clientId).to.eql(clientId2);
    expect(clientId2Bookings[0].date).to.eql(expectedDate2);
    expect(clientId2Bookings[0].amount).to.eql(expectedAmount + 200);
  });

  // delete

  it('should delete booking1', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
    );
    const expectedDate = new Date();
    const expectedDate2 = new Date(2020, 10, 12);
    const expectedAmount = 1000;
    const booking1 = await setupBookingInDb(
      new Booking({
        clientId: clientId1,
        tenantId: tenant1.id,
        date: expectedDate,
        amount: expectedAmount - 300,
      }),
    );
    await setupBookingInDb(
      new Booking({
        clientId: clientId2,
        tenantId: tenant2.id,
        date: expectedDate2,
        amount: expectedAmount + 200,
      }),
    );

    // test
    await http
      .delete(`${BookingsUrl}/${booking1.id}`)
      .set('Authorization', 'Bearer ' + token1)
      .expect(204);

    // asserts
    const bookingRepository = await app.getRepository(BookingRepository);

    const clientId1Bookings = await bookingRepository.find({
      where: {clientId: clientId1},
    });
    expect(clientId1Bookings.length).to.eql(0);

    const clientId2Bookings = await bookingRepository.find({
      where: {clientId: clientId2},
    });
    expect(clientId2Bookings.length).to.eql(1);
    expect(clientId2Bookings[0].clientId).to.eql(clientId2);
    expect(clientId2Bookings[0].date).to.eql(expectedDate2);
    expect(clientId2Bookings[0].amount).to.eql(expectedAmount + 200);
  });

  it('should not delete contract2 if filtered to client2 ', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
    );
    const expectedDate = new Date();
    const expectedDate2 = new Date(2020, 10, 12);
    const expectedAmount = 1000;
    await setupBookingInDb(
      new Booking({
        clientId: clientId1,
        tenantId: tenant1.id,
        date: expectedDate,
        amount: expectedAmount - 300,
      }),
    );
    const booking2 = await setupBookingInDb(
      new Booking({
        clientId: clientId2,
        tenantId: tenant2.id,
        date: expectedDate2,
        amount: expectedAmount + 200,
      }),
    );

    // test
    await http
      .delete(`${BookingsUrl}/${booking2.id}`)
      .set('Authorization', 'Bearer ' + token1)
      .expect(204);

    // asserts
    const bookingRepository = await app.getRepository(BookingRepository);

    const clientId1Bookings = await bookingRepository.find({
      where: {clientId: clientId1},
    });
    expect(clientId1Bookings.length).to.eql(1);
    expect(clientId1Bookings[0].clientId).to.eql(clientId1);
    expect(clientId1Bookings[0].date).to.eql(expectedDate);
    expect(clientId1Bookings[0].amount).to.eql(expectedAmount - 300);

    const clientId2Bookings = await bookingRepository.find({
      where: {clientId: clientId2},
    });
    expect(clientId2Bookings.length).to.eql(1);
    expect(clientId2Bookings[0].clientId).to.eql(clientId2);
    expect(clientId2Bookings[0].date).to.eql(expectedDate2);
    expect(clientId2Bookings[0].amount).to.eql(expectedAmount + 200);
  });

  // non test methods --------------------------------------------------------------------

  function createBookingViaHttp(token: string, data: {}) {
    return http
      .post(BookingsUrl)
      .set('Authorization', 'Bearer ' + token)
      .send(data)
      .set('Content-Type', 'application/json');
  }

  async function setupTenantInDb(tenant: Tenant): Promise<Tenant> {
    const tenantRepository = await app.getRepository(TenantRepository);
    return tenantRepository.save(tenant);
  }

  async function setupContractInDb(contract: Contract): Promise<Contract> {
    const contractRepository = await app.getRepository(ContractRepository);
    return contractRepository.save(contract);
  }

  async function setupBookingInDb(booking: Booking): Promise<Booking> {
    const bookingRepository = await app.getRepository(BookingRepository);
    return bookingRepository.save(booking);
  }
});
