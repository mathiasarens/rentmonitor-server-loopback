import {Client, expect} from '@loopback/testlab';
import {RentmonitorServerApplication} from '../..';
import {ContractsUrl} from '../../controllers';
import {Contract, Tenant} from '../../models';
import {ContractRepository, TenantRepository} from '../../repositories';
import {
  clearDatabase,
  getTestUser,
  login,
  setupApplication,
  setupClientInDb,
  setupUserInDb,
} from '../helpers/acceptance-test.helpers';

describe('ContractController', () => {
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

  it('should add new contract on post', async () => {
    const clientId = await setupClientInDb(app, 'TestClient1');
    const testUser = getTestUser('1');
    await setupUserInDb(app, clientId, testUser);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId, name: 'Tenant1'}),
    );
    const token = await login(http, testUser);
    const startDate = new Date();

    const res = await createContractViaHttp(token, {
      tenantId: tenant1.id,
      start: startDate,
    })
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.id).to.be.a.Number();
    expect(res.body.clientId).to.eql(clientId);
    expect(res.body.tenantId).to.eql(tenant1.id);
    expect(res.body.start).to.eql(startDate.toISOString());
  });

  it('should add contract with clientId from logged in user', async () => {
    const clientId = await setupClientInDb(app, 'TestClient1');
    const testUser = getTestUser('1');
    await setupUserInDb(app, clientId, testUser);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId, name: 'Tenant1'}),
    );
    const token = await login(http, testUser);
    const startDate = new Date();

    const res = await createContractViaHttp(token, {
      clientId: 1,
      tenantId: tenant1.id,
      start: startDate,
    })
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.id).to.be.a.Number();
    expect(res.body.clientId).to.eql(clientId);
    expect(res.body.tenantId).to.eql(tenant1.id);
    expect(res.body.start).to.eql(startDate.toISOString());
  });

  // count

  it('should count contracts for users clientId only', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
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
      .get(`${ContractsUrl}/count?where[clientId]=${clientId1 + 1}`)
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
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
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
      .get(`${ContractsUrl}?filter[where][clientId]=${clientId2}`)
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
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
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
      .get(`${ContractsUrl}`)
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
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
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
      .patch(`${ContractsUrl}`)
      .set('Authorization', 'Bearer ' + token1)
      .set('Content-Type', 'application/json')
      .send({amount: 10})
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.count).to.eql(1);

    const contractRepository: ContractRepository = await app.getRepository(
      ContractRepository,
    );

    const clientId1Contracts = await contractRepository.find({
      where: {clientId: clientId1},
    });
    expect(clientId1Contracts.length).to.eql(1);
    expect(clientId1Contracts[0].amount).to.eql(10);

    const clientId2Contracts = await contractRepository.find({
      where: {clientId: clientId2},
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
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
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
      .patch(`${ContractsUrl}?where[clientId]=${clientId2}`)
      .set('Authorization', 'Bearer ' + token1)
      .set('Content-Type', 'application/json')
      .send({amount: 15})
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.count).to.eql(0);

    // asserts
    const contractRepository: ContractRepository = await app.getRepository(
      ContractRepository,
    );

    const clientId1Tenants = await contractRepository.find({
      where: {clientId: clientId1},
    });
    expect(clientId1Tenants.length).to.eql(1);
    expect(clientId1Tenants[0].amount).to.be.null();

    const clientId2Tenants = await contractRepository.find({
      where: {clientId: clientId2},
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
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
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
      .patch(`${ContractsUrl}`)
      .set('Authorization', 'Bearer ' + token1)
      .set('Content-Type', 'application/json')
      .send({clientId: clientId2})
      .expect(422)
      .expect('Content-Type', 'application/json; charset=utf-8');

    // asserts
    const contractRepository: ContractRepository = await app.getRepository(
      ContractRepository,
    );

    const clientId1Tenants = await contractRepository.find({
      where: {clientId: clientId1},
    });
    expect(clientId1Tenants.length).to.eql(1);
    expect(clientId1Tenants[0].clientId).to.eql(clientId1);

    const clientId2Tenants = await contractRepository.find({
      where: {clientId: clientId2},
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
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
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
      .get(`${ContractsUrl}/${contract1.id}`)
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
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
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
      .get(`${ContractsUrl}/${contract2.id}`)
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
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
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
      .get(`${ContractsUrl}/${contract2.id}?where[clientId]=${clientId2}`)
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
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
    );
    const startDate = new Date();
    const contract1 = await setupContractInDb(
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
      .patch(`${ContractsUrl}/${contract1.id}`)
      .set('Authorization', 'Bearer ' + token1)
      .set('Content-Type', 'application/json')
      .send({amount: 10})
      .expect(204);

    const contractRepository: ContractRepository = await app.getRepository(
      ContractRepository,
    );

    const clientId1Contracts = await contractRepository.find({
      where: {clientId: clientId1},
    });
    expect(clientId1Contracts.length).to.eql(1);
    expect(clientId1Contracts[0].amount).to.eql(10);

    const clientId2Tenants = await contractRepository.find({
      where: {clientId: clientId2},
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
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
    );
    const startDate = new Date();
    const contract1 = await setupContractInDb(
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
      .patch(`${ContractsUrl}/${tenant2.id}?where[clientId]=${clientId2}`)
      .set('Authorization', 'Bearer ' + token1)
      .set('Content-Type', 'application/json')
      .send({amount: 10})
      .expect(204);

    const contractRepository: ContractRepository = await app.getRepository(
      ContractRepository,
    );

    const clientId1Tenants = await contractRepository.find({
      where: {clientId: clientId1},
    });
    expect(clientId1Tenants.length).to.eql(1);
    expect(clientId1Tenants[0].amount).to.be.null();

    const clientId2Tenants = await contractRepository.find({
      where: {clientId: clientId2},
    });
    expect(clientId2Tenants.length).to.eql(1);
    expect(clientId2Tenants[0].amount).to.be.null();
  });

  it.skip('should not update tenant by id if own clientId is set to a different clientId', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    await setupTenantInDb(new Tenant({clientId: clientId2, name: 'Tenant2'}));

    await http
      .patch(`${ContractsUrl}/${tenant1.id}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({clientId: clientId2})
      .expect(422)
      .expect('Content-Type', 'application/json; charset=utf-8');

    const tenantRepository: TenantRepository = await app.getRepository(
      TenantRepository,
    );

    const clientId1Tenants = await tenantRepository.find({
      where: {clientId: clientId1},
    });
    expect(clientId1Tenants.length).to.eql(1);
    expect(clientId1Tenants[0].email).to.be.null();

    const clientId2Tenants = await tenantRepository.find({
      where: {clientId: clientId2},
    });
    expect(clientId2Tenants.length).to.eql(1);
    expect(clientId2Tenants[0].email).to.be.null();
  });

  // put

  it.skip('should replace tenant1 by id', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    await setupTenantInDb(new Tenant({clientId: clientId2, name: 'Tenant2'}));

    await http
      .put(`${ContractsUrl}/${tenant1.id}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({
        id: tenant1.id,
        clientId: tenant1.clientId,
        name: tenant1.name,
        email: 'tenant1@tenants.de',
        phone: '0123/4567890',
      })
      .expect(204);

    const tenantRepository: TenantRepository = await app.getRepository(
      TenantRepository,
    );

    const clientId1Tenants = await tenantRepository.find({
      where: {clientId: clientId1},
    });
    expect(clientId1Tenants.length).to.eql(1);
    expect(clientId1Tenants[0].name).to.eql(tenant1.name);
    expect(clientId1Tenants[0].email).to.eql('tenant1@tenants.de');
    expect(clientId1Tenants[0].phone).to.eql('0123/4567890');

    const clientId2Tenants = await tenantRepository.find({
      where: {clientId: clientId2},
    });
    expect(clientId2Tenants.length).to.eql(1);
    expect(clientId2Tenants[0].name).to.eql('Tenant2');
    expect(clientId2Tenants[0].email).to.be.null();
    expect(clientId2Tenants[0].phone).to.be.null();
  });

  it.skip('should not replace client id of tenant1 to clientId2', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    await setupTenantInDb(new Tenant({clientId: clientId2, name: 'Tenant2'}));

    await http
      .put(`${ContractsUrl}/${tenant1.id}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({
        id: tenant1.id,
        clientId: clientId2,
        name: tenant1.name,
        email: 'tenant1@tenants.de',
        phone: '0123/4567890',
      })
      .expect(204);

    const tenantRepository: TenantRepository = await app.getRepository(
      TenantRepository,
    );

    const clientId1Tenants = await tenantRepository.find({
      where: {clientId: clientId1},
    });
    expect(clientId1Tenants.length).to.eql(1);
    expect(clientId1Tenants[0].name).to.eql(tenant1.name);
    expect(clientId1Tenants[0].email).to.be.null();
    expect(clientId1Tenants[0].phone).to.be.null();

    const clientId2Tenants = await tenantRepository.find({
      where: {clientId: clientId2},
    });
    expect(clientId2Tenants.length).to.eql(1);
    expect(clientId2Tenants[0].name).to.eql('Tenant2');
    expect(clientId2Tenants[0].email).to.be.null();
    expect(clientId2Tenants[0].phone).to.be.null();
  });

  // delete

  it.skip('should delete tenant1', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    await setupTenantInDb(new Tenant({clientId: clientId2, name: 'Tenant2'}));

    await http
      .delete(`${ContractsUrl}/${tenant1.id}`)
      .set('Authorization', 'Bearer ' + token)
      .expect(204);

    const tenantRepository: TenantRepository = await app.getRepository(
      TenantRepository,
    );

    const clientId1Tenants = await tenantRepository.find({
      where: {clientId: clientId1},
    });
    expect(clientId1Tenants.length).to.eql(0);

    const clientId2Tenants = await tenantRepository.find({
      where: {clientId: clientId2},
    });
    expect(clientId2Tenants.length).to.eql(1);
    expect(clientId2Tenants[0].name).to.eql('Tenant2');
    expect(clientId2Tenants[0].email).to.be.null();
    expect(clientId2Tenants[0].phone).to.be.null();
  });

  it.skip('should not delete tenant2 if filtered to client2 ', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
    );

    await http
      .delete(`${ContractsUrl}/${tenant2.id}`)
      .set('Authorization', 'Bearer ' + token)
      .expect(204);

    const tenantRepository: TenantRepository = await app.getRepository(
      TenantRepository,
    );

    const clientId1Tenants = await tenantRepository.find({
      where: {clientId: clientId1},
    });
    expect(clientId1Tenants.length).to.eql(1);
    expect(clientId1Tenants[0].name).to.eql(tenant1.name);
    expect(clientId1Tenants[0].email).to.be.null();
    expect(clientId1Tenants[0].phone).to.be.null();

    const clientId2Tenants = await tenantRepository.find({
      where: {clientId: clientId2},
    });
    expect(clientId2Tenants.length).to.eql(1);
    expect(clientId2Tenants[0].name).to.eql('Tenant2');
    expect(clientId2Tenants[0].email).to.be.null();
    expect(clientId2Tenants[0].phone).to.be.null();
  });

  // non test methods --------------------------------------------------------------------

  function createContractViaHttp(token: string, data: {}) {
    return http
      .post(ContractsUrl)
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
