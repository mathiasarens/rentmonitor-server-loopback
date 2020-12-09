import { Client, expect } from '@loopback/testlab';
import { RentmonitorServerApplication } from '../..';
import { BookingsUrl } from '../../controllers';
import { Contract, Tenant } from '../../models';
import { ContractRepository, TenantRepository } from '../../repositories';
import {
  clearDatabase,
  getTestUser,
  login,
  setupApplication,
  setupClientInDb,
  setupUserInDb
} from '../helpers/acceptance-test.helpers';

describe('BookingController', () => {
  let app: RentmonitorServerApplication;
  let http: Client;

  before('setupApplication', async () => {
    ({ app, client: http } = await setupApplication());
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
      new Tenant({ clientId: clientId, name: 'Tenant1' }),
    );
    const token = await login(http, testUser);
    const expectedDate = new Date();
    const expectedAmount = 2500

    const res = await createBookingViaHttp(token, {
      tenantId: tenant1.id,
      date: expectedDate,
      amount: expectedAmount
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
      new Tenant({ clientId: clientId, name: 'Tenant1' }),
    );
    const token = await login(http, testUser);
    const expectedDate = new Date();
    const expectedAmount = 2500

    const res = await createBookingViaHttp(token, {
      clientId: 1,
      tenantId: tenant1.id,
      date: expectedDate,
      amount: expectedAmount
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
      new Tenant({ clientId: clientId, name: 'Tenant1' }),
    );
    const contract1 = await setupContractInDb(new Contract({ clientId: clientId, tenantId: tenant1.id, start: new Date(), rentDueEveryMonth: 1, rentDueDayOfMonth: 10, amount: 10 }))
    const token = await login(http, testUser);

    const expectedDate = new Date();
    const expectedAmount = 2500
    const expectedComment = 'Test comment'

    const res = await createBookingViaHttp(token, {
      tenantId: tenant1.id,
      contractId: contract1.id,
      date: expectedDate,
      comment: expectedComment,
      amount: expectedAmount
    })
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.id).to.be.a.Number();
    expect(res.body.clientId).to.eql(clientId);
    expect(res.body.tenantId).to.eql(tenant1.id);
    expect(res.body.contractId).to.equal(contract1.id)
    expect(res.body.date).to.eql(expectedDate.toISOString());
    expect(res.body.comment).to.eql(expectedComment);
    expect(res.body.amount).to.eql(expectedAmount);
  });

  // count

  it('should count contracts for users clientId only', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({ clientId: clientId1, name: 'Tenant1' }),
    );
    const token1 = await login(http, testUser1);
    const startDate = new Date();
    await setupContractInDb(
      new Contract({
        clientId: clientId1,
        tenantId: tenant1.id,
        start: startDate,
      }),
    );

    // test
    const res = await http
      .get(`${BookingsUrl}/count?where[clientId]=${clientId1 + 1}`)
      .set('Authorization', 'Bearer ' + token1)
      .expect(200)
      .expect('Content-Type', 'application/json');
    // expected result is the count from client 1 == 1 and not from client2 that does not exist
    expect(res.body.count).to.eql(0);
  });

  // get

  it('should find contracts for users clientId only if user overwrites clientId', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const startDate = new Date();
    const tenant1 = await setupTenantInDb(
      new Tenant({ clientId: clientId1, name: 'Tenant1' }),
    );
    await setupContractInDb(
      new Contract({
        clientId: clientId1,
        tenantId: tenant1.id,
        start: startDate,
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

  it('should find contracts for users clientId only if user uses a where filter without clientId', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({ clientId: clientId1, name: 'Tenant1' }),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({ clientId: clientId2, name: 'Tenant2' }),
    );
    const startDate = new Date();
    await setupContractInDb(
      new Contract({
        clientId: clientId1,
        tenantId: tenant1.id,
        start: startDate,
      }),
    );
    await setupContractInDb(
      new Contract({
        clientId: clientId2,
        tenantId: tenant2.id,
        start: startDate,
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
  });

  // patch

  it('should update contracts for users clientId only if no clientId is given', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    const testUser2 = getTestUser('2');
    await setupUserInDb(app, clientId1, testUser1);
    await setupUserInDb(app, clientId2, testUser2);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({ clientId: clientId1, name: 'Tenant1' }),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({ clientId: clientId2, name: 'Tenant2' }),
    );
    const startDate = new Date();
    await setupContractInDb(
      new Contract({
        clientId: clientId1,
        tenantId: tenant1.id,
        start: startDate,
      }),
    );
    await setupContractInDb(
      new Contract({
        clientId: clientId2,
        tenantId: tenant2.id,
        start: startDate,
      }),
    );

    // test
    const res = await http
      .patch(`${BookingsUrl}`)
      .set('Authorization', 'Bearer ' + token1)
      .set('Content-Type', 'application/json')
      .send({ amount: 10 })
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.count).to.eql(1);

    const contractRepository: ContractRepository = await app.getRepository(
      ContractRepository,
    );

    const clientId1Contracts = await contractRepository.find({
      where: { clientId: clientId1 },
    });
    expect(clientId1Contracts.length).to.eql(1);
    expect(clientId1Contracts[0].amount).to.eql(10);

    const clientId2Contracts = await contractRepository.find({
      where: { clientId: clientId2 },
    });
    expect(clientId2Contracts.length).to.eql(1);
    expect(clientId2Contracts[0].amount).to.be.null();
  });

  it('should update contracts for users clientId only if different clientId is given', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({ clientId: clientId1, name: 'Tenant1' }),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({ clientId: clientId2, name: 'Tenant2' }),
    );
    const startDate = new Date();
    await setupContractInDb(
      new Contract({
        clientId: clientId1,
        tenantId: tenant1.id,
        start: startDate,
      }),
    );
    await setupContractInDb(
      new Contract({
        clientId: clientId2,
        tenantId: tenant2.id,
        start: startDate,
      }),
    );

    // test
    const res = await http
      .patch(`${BookingsUrl}?where[clientId]=${clientId2}`)
      .set('Authorization', 'Bearer ' + token1)
      .set('Content-Type', 'application/json')
      .send({ amount: 15 })
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.count).to.eql(0);

    // asserts
    const contractRepository: ContractRepository = await app.getRepository(
      ContractRepository,
    );

    const clientId1Tenants = await contractRepository.find({
      where: { clientId: clientId1 },
    });
    expect(clientId1Tenants.length).to.eql(1);
    expect(clientId1Tenants[0].amount).to.be.null();

    const clientId2Tenants = await contractRepository.find({
      where: { clientId: clientId2 },
    });
    expect(clientId2Tenants.length).to.eql(1);
    expect(clientId2Tenants[0].amount).to.be.null();
  });

  it('should not update contracts clientId to a different clientId', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({ clientId: clientId1, name: 'Tenant1' }),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({ clientId: clientId2, name: 'Tenant2' }),
    );
    const startDate = new Date();
    await setupContractInDb(
      new Contract({
        clientId: clientId1,
        tenantId: tenant1.id,
        start: startDate,
      }),
    );
    await setupContractInDb(
      new Contract({
        clientId: clientId2,
        tenantId: tenant2.id,
        start: startDate,
      }),
    );

    // test
    await http
      .patch(`${BookingsUrl}`)
      .set('Authorization', 'Bearer ' + token1)
      .set('Content-Type', 'application/json')
      .send({ clientId: clientId2 })
      .expect(422)
      .expect('Content-Type', 'application/json; charset=utf-8');

    // asserts
    const contractRepository: ContractRepository = await app.getRepository(
      ContractRepository,
    );

    const clientId1Tenants = await contractRepository.find({
      where: { clientId: clientId1 },
    });
    expect(clientId1Tenants.length).to.eql(1);
    expect(clientId1Tenants[0].clientId).to.eql(clientId1);

    const clientId2Tenants = await contractRepository.find({
      where: { clientId: clientId2 },
    });
    expect(clientId2Tenants.length).to.eql(1);
    expect(clientId2Tenants[0].clientId).to.eql(clientId2);
  });

  // findById

  it('should find contracts by id for users clientId only if api user uses no filter', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({ clientId: clientId1, name: 'Tenant1' }),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({ clientId: clientId2, name: 'Tenant2' }),
    );
    const startDate = new Date();
    const contract1 = await setupContractInDb(
      new Contract({
        clientId: clientId1,
        tenantId: tenant1.id,
        start: startDate,
      }),
    );
    await setupContractInDb(
      new Contract({
        clientId: clientId2,
        tenantId: tenant2.id,
        start: startDate,
      }),
    );

    const res = await http
      .get(`${BookingsUrl}/${contract1.id}`)
      .set('Authorization', 'Bearer ' + token1)
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.tenantId).to.eql(tenant1.id);
  });

  it('should not find contracts by id for users clientId only if api user uses no filter', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({ clientId: clientId1, name: 'Tenant1' }),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({ clientId: clientId2, name: 'Tenant2' }),
    );
    const startDate = new Date();
    await setupContractInDb(
      new Contract({
        clientId: clientId1,
        tenantId: tenant1.id,
        start: startDate,
      }),
    );
    const contract2 = await setupContractInDb(
      new Contract({
        clientId: clientId2,
        tenantId: tenant2.id,
        start: startDate,
      }),
    );

    await http
      .get(`${BookingsUrl}/${contract2.id}`)
      .set('Authorization', 'Bearer ' + token1)
      .expect(204);
  });

  it('should not find contracts by id for users clientId only if api user filters for other clientId', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({ clientId: clientId1, name: 'Tenant1' }),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({ clientId: clientId2, name: 'Tenant2' }),
    );
    const startDate = new Date();
    await setupContractInDb(
      new Contract({
        clientId: clientId1,
        tenantId: tenant1.id,
        start: startDate,
      }),
    );
    const contract2 = await setupContractInDb(
      new Contract({
        clientId: clientId2,
        tenantId: tenant2.id,
        start: startDate,
      }),
    );

    await http
      .get(`${BookingsUrl}/${contract2.id}?where[clientId]=${clientId2}`)
      .set('Authorization', 'Bearer ' + token1)
      .expect(204);
  });

  // patch by id

  it('should update contract by id for users clientId only if no clientId is given', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({ clientId: clientId1, name: 'Tenant1' }),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({ clientId: clientId2, name: 'Tenant2' }),
    );
    const startDate = new Date();
    const contract1 = await setupContractInDb(
      new Contract({
        clientId: clientId1,
        tenantId: tenant1.id,
        start: startDate,
      }),
    );
    await setupContractInDb(
      new Contract({
        clientId: clientId2,
        tenantId: tenant2.id,
        start: startDate,
      }),
    );

    await http
      .patch(`${BookingsUrl}/${contract1.id}`)
      .set('Authorization', 'Bearer ' + token1)
      .set('Content-Type', 'application/json')
      .send({ amount: 10 })
      .expect(204);

    const contractRepository: ContractRepository = await app.getRepository(
      ContractRepository,
    );

    const clientId1Contracts = await contractRepository.find({
      where: { clientId: clientId1 },
    });
    expect(clientId1Contracts.length).to.eql(1);
    expect(clientId1Contracts[0].amount).to.eql(10);

    const clientId2Tenants = await contractRepository.find({
      where: { clientId: clientId2 },
    });
    expect(clientId2Tenants.length).to.eql(1);
    expect(clientId2Tenants[0].amount).to.be.null();
  });

  it('should update contract by id for users clientId only if different clientId is given', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({ clientId: clientId1, name: 'Tenant1' }),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({ clientId: clientId2, name: 'Tenant2' }),
    );
    const startDate = new Date();
    await setupContractInDb(
      new Contract({
        clientId: clientId1,
        tenantId: tenant1.id,
        start: startDate,
      }),
    );
    const contract2 = await setupContractInDb(
      new Contract({
        clientId: clientId2,
        tenantId: tenant2.id,
        start: startDate,
      }),
    );

    await http
      .patch(`${BookingsUrl}/${contract2.id}?where[clientId]=${clientId2}`)
      .set('Authorization', 'Bearer ' + token1)
      .set('Content-Type', 'application/json')
      .send({ amount: 10 })
      .expect(204);

    const contractRepository: ContractRepository = await app.getRepository(
      ContractRepository,
    );

    const clientId1Tenants = await contractRepository.find({
      where: { clientId: clientId1 },
    });
    expect(clientId1Tenants.length).to.eql(1);
    expect(clientId1Tenants[0].amount).to.be.null();

    const clientId2Tenants = await contractRepository.find({
      where: { clientId: clientId2 },
    });
    expect(clientId2Tenants.length).to.eql(1);
    expect(clientId2Tenants[0].amount).to.be.null();
  });

  it('should not update contract by id if own clientId is set to a different clientId', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({ clientId: clientId1, name: 'Tenant1' }),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({ clientId: clientId2, name: 'Tenant2' }),
    );
    const startDate = new Date();
    const contract1 = await setupContractInDb(
      new Contract({
        clientId: clientId1,
        tenantId: tenant1.id,
        start: startDate,
      }),
    );
    await setupContractInDb(
      new Contract({
        clientId: clientId2,
        tenantId: tenant2.id,
        start: startDate,
      }),
    );

    await http
      .patch(`${BookingsUrl}/${contract1.id}`)
      .set('Authorization', 'Bearer ' + token1)
      .set('Content-Type', 'application/json')
      .send({ clientId: clientId2 })
      .expect(422)
      .expect('Content-Type', 'application/json; charset=utf-8');

    const contractRepository: ContractRepository = await app.getRepository(
      ContractRepository,
    );

    const clientId1Contracts = await contractRepository.find({
      where: { clientId: clientId1 },
    });
    expect(clientId1Contracts.length).to.eql(1);
    expect(clientId1Contracts[0].clientId).to.eql(clientId1);

    const clientId2Contracts = await contractRepository.find({
      where: { clientId: clientId2 },
    });
    expect(clientId2Contracts.length).to.eql(1);
    expect(clientId2Contracts[0].clientId).to.eql(clientId2);
  });

  // put

  it('should replace contract1 by id', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({ clientId: clientId1, name: 'Tenant1' }),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({ clientId: clientId2, name: 'Tenant2' }),
    );
    const startDate = new Date();
    const contract1 = await setupContractInDb(
      new Contract({
        clientId: clientId1,
        tenantId: tenant1.id,
        start: startDate,
        amount: 10,
      }),
    );
    await setupContractInDb(
      new Contract({
        clientId: clientId2,
        tenantId: tenant2.id,
        start: startDate,
        amount: 15,
      }),
    );

    await http
      .put(`${BookingsUrl}/${contract1.id}`)
      .set('Authorization', 'Bearer ' + token1)
      .set('Content-Type', 'application/json')
      .send(
        new Contract({
          id: contract1.id,
          clientId: contract1.clientId,
          start: startDate,
          amount: 20,
        }),
      )
      .expect(204);

    const contractRepository: ContractRepository = await app.getRepository(
      ContractRepository,
    );

    const clientId1Contracts = await contractRepository.find({
      where: { clientId: clientId1 },
    });
    expect(clientId1Contracts.length).to.eql(1);
    expect(clientId1Contracts[0].amount).to.eql(20);

    const clientId2Contracts = await contractRepository.find({
      where: { clientId: clientId2 },
    });
    expect(clientId2Contracts.length).to.eql(1);
    expect(clientId2Contracts[0].amount).to.eql(15);
  });

  it('should not replace client id of contract1 to clientId2', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({ clientId: clientId1, name: 'Tenant1' }),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({ clientId: clientId2, name: 'Tenant2' }),
    );
    const startDate = new Date();
    const contract1 = await setupContractInDb(
      new Contract({
        clientId: clientId1,
        tenantId: tenant1.id,
        start: startDate,
        amount: 10,
      }),
    );
    await setupContractInDb(
      new Contract({
        clientId: clientId2,
        tenantId: tenant2.id,
        start: startDate,
        amount: 15,
      }),
    );

    await http
      .put(`${BookingsUrl}/${contract1.id}`)
      .set('Authorization', 'Bearer ' + token1)
      .set('Content-Type', 'application/json')
      .send({
        id: tenant1.id,
        clientId: clientId2,
        start: startDate,
        amount: 20,
      })
      .expect(204);

    const contractRepository: ContractRepository = await app.getRepository(
      ContractRepository,
    );

    const clientId1Contracts = await contractRepository.find({
      where: { clientId: clientId1 },
    });
    expect(clientId1Contracts.length).to.eql(1);
    expect(clientId1Contracts[0].amount).to.eql(10);

    const clientId2Contracts = await contractRepository.find({
      where: { clientId: clientId2 },
    });
    expect(clientId2Contracts.length).to.eql(1);
    expect(clientId2Contracts[0].amount).to.eql(15);
  });

  // delete

  it('should delete contract1', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({ clientId: clientId1, name: 'Tenant1' }),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({ clientId: clientId2, name: 'Tenant2' }),
    );
    const startDate = new Date();
    const contract1 = await setupContractInDb(
      new Contract({
        clientId: clientId1,
        tenantId: tenant1.id,
        start: startDate,
        amount: 10,
      }),
    );
    await setupContractInDb(
      new Contract({
        clientId: clientId2,
        tenantId: tenant2.id,
        start: startDate,
        amount: 15,
      }),
    );

    // test
    await http
      .delete(`${BookingsUrl}/${contract1.id}`)
      .set('Authorization', 'Bearer ' + token1)
      .expect(204);

    const contractRepository: ContractRepository = await app.getRepository(
      ContractRepository,
    );

    const clientId1Contracts = await contractRepository.find({
      where: { clientId: clientId1 },
    });
    expect(clientId1Contracts.length).to.eql(0);

    const clientId2Contracts = await contractRepository.find({
      where: { clientId: clientId2 },
    });
    expect(clientId2Contracts.length).to.eql(1);
    expect(clientId2Contracts[0].amount).to.eql(15);
  });

  it('should not delete contract2 if filtered to client2 ', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({ clientId: clientId1, name: 'Tenant1' }),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({ clientId: clientId2, name: 'Tenant2' }),
    );
    const startDate = new Date();
    await setupContractInDb(
      new Contract({
        clientId: clientId1,
        tenantId: tenant1.id,
        start: startDate,
        amount: 10,
      }),
    );
    const contract2 = await setupContractInDb(
      new Contract({
        clientId: clientId2,
        tenantId: tenant2.id,
        start: startDate,
        amount: 15,
      }),
    );

    // test
    await http
      .delete(`${BookingsUrl}/${contract2.id}`)
      .set('Authorization', 'Bearer ' + token1)
      .expect(204);

    const contractRepository: ContractRepository = await app.getRepository(
      ContractRepository,
    );

    const clientId1Contracts = await contractRepository.find({
      where: { clientId: clientId1 },
    });
    expect(clientId1Contracts.length).to.eql(1);
    expect(clientId1Contracts[0].amount).to.eql(10);

    const clientId2Contracts = await contractRepository.find({
      where: { clientId: clientId2 },
    });
    expect(clientId2Contracts.length).to.eql(1);
    expect(clientId2Contracts[0].amount).to.eql(15);
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
});
