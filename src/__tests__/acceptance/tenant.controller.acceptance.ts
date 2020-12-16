import {Client, expect} from '@loopback/testlab';
import {RentmonitorServerApplication} from '../..';
import {TenantsUrl} from '../../controllers';
import {Tenant} from '../../models';
import {TenantRepository} from '../../repositories';
import {
  clearDatabase,
  getTestUser,
  login,
  setupApplication,
  setupClientInDb,
  setupUserInDb,
} from '../helpers/acceptance-test.helpers';

describe('TenantController', () => {
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

  it('should add new tenant on post', async () => {
    const clientId = await setupClientInDb(app, 'TestClient1');
    const testUser = getTestUser('1');
    await setupUserInDb(app, clientId, testUser);
    const token = await login(http, testUser);

    const tenantName = 'TestTenant1';
    const expectedAccountSynchronisationName = 'Name1ForAccountSynchronisation';
    const res = await createTenantViaHttp(token, {
      name: tenantName,
      accountSynchronisationName: expectedAccountSynchronisationName,
    })
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.id).to.be.a.Number();
    expect(res.body.name).to.eql(tenantName);
    expect(res.body.accountSynchronisationName).to.eql(
      expectedAccountSynchronisationName,
    );
  });

  it('should add tenant with same name twice', async () => {
    const clientId = await setupClientInDb(app, 'TestClient1');
    const testUser = getTestUser('1');
    await setupUserInDb(app, clientId, testUser);
    const token = await login(http, testUser);

    const tenantName = 'TestTenant1';
    await createTenantViaHttp(token, {name: tenantName});
    const res = await createTenantViaHttp(token, {name: tenantName})
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.id).to.be.a.Number();
    expect(res.body.name).to.eql(tenantName);
    const debitorRepository = await app.getRepository(TenantRepository);
    const debitorsFromDb = await debitorRepository.find({
      where: {clientId: clientId},
    });
    expect(debitorsFromDb).length(2);
  });

  it('should add tenant with clientId from logged in user', async () => {
    const clientId = await setupClientInDb(app, 'TestClient1');
    const testUser = getTestUser('1');
    await setupUserInDb(app, clientId, testUser);
    const token = await login(http, testUser);

    const tenantName = 'TestTenant1';
    const res = await createTenantViaHttp(token, {name: tenantName})
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.id).to.be.a.Number();
    expect(res.body.clientId).to.eql(clientId);
    expect(res.body.name).to.eql(tenantName);
  });

  it('should count tenants for users clientId only', async () => {
    const clientId = await setupClientInDb(app, 'TestClient1');
    const testUser = getTestUser('1');
    await setupUserInDb(app, clientId, testUser);
    const token = await login(http, testUser);

    const tenantName = 'TestTenant1';
    await createTenantViaHttp(token, {name: tenantName})
      .expect(200)
      .expect('Content-Type', 'application/json');

    const res = await http
      .get(`${TenantsUrl}/count?where[clientId]=${clientId + 1}`)
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.count).to.eql(0);
  });

  it('should find tenants for users clientId only if user overwrites clientId', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token = await login(http, testUser1);
    await setupTenantInDb(
      new Tenant({
        clientId: clientId1,
        name: 'Tenant1',
        accountSynchronisationName: 'Tenant1-Account',
      }),
    );
    await setupTenantInDb(new Tenant({clientId: clientId2, name: 'Tenant2'}));

    const res = await http
      .get(`${TenantsUrl}?filter[where][clientId]=${clientId2}`)
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.length).to.eql(1);
    expect(res.body[0].name).to.eql('Tenant1');
    expect(res.body[0].accountSynchronisationName).to.eql('Tenant1-Account');
  });

  it('should find tenants for users clientId only if user uses a where filter without clientId', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token = await login(http, testUser1);
    await setupTenantInDb(new Tenant({clientId: clientId1, name: 'Tenant1'}));
    await setupTenantInDb(new Tenant({clientId: clientId2, name: 'Tenant2'}));

    const res = await http
      .get(`${TenantsUrl}?filter[where][name]=Tenant1`)
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.length).to.eql(1);
    expect(res.body[0].name).to.eql('Tenant1');
  });

  it('should find tenants for users clientId only if user uses no filter', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token = await login(http, testUser1);
    await setupTenantInDb(new Tenant({clientId: clientId1, name: 'Tenant1'}));
    await setupTenantInDb(new Tenant({clientId: clientId2, name: 'Tenant2'}));

    const res = await http
      .get(`${TenantsUrl}`)
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.length).to.eql(1);
    expect(res.body[0].name).to.eql('Tenant1');
  });

  // patch

  it('should update tenants for users clientId only if no clientId is given', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token = await login(http, testUser1);
    await setupTenantInDb(new Tenant({clientId: clientId1, name: 'Tenant1'}));
    await setupTenantInDb(new Tenant({clientId: clientId2, name: 'Tenant2'}));

    const res = await http
      .patch(`${TenantsUrl}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({email: 'tenant1@tenants.de'})
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.count).to.eql(1);

    const tenantRepository: TenantRepository = await app.getRepository(
      TenantRepository,
    );

    const clientId1Tenants = await tenantRepository.find({
      where: {clientId: clientId1},
    });
    expect(clientId1Tenants.length).to.eql(1);
    expect(clientId1Tenants[0].email).to.eql('tenant1@tenants.de');

    const clientId2Tenants = await tenantRepository.find({
      where: {clientId: clientId2},
    });
    expect(clientId2Tenants.length).to.eql(1);
    expect(clientId2Tenants[0].email).to.be.null();
  });

  it('should update tenants for users clientId only if different clientId is given', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token1 = await login(http, testUser1);
    await setupTenantInDb(new Tenant({clientId: clientId1, name: 'Tenant1'}));
    await setupTenantInDb(new Tenant({clientId: clientId2, name: 'Tenant2'}));

    const res = await http
      .patch(`${TenantsUrl}?where[clientId]=${clientId2}`)
      .set('Authorization', 'Bearer ' + token1)
      .set('Content-Type', 'application/json')
      .send({email: 'tenant1@tenants.de'})
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.count).to.eql(0);

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

  it('should not update tenants clientId to a different clientId', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token = await login(http, testUser1);
    await setupTenantInDb(new Tenant({clientId: clientId1, name: 'Tenant1'}));
    await setupTenantInDb(new Tenant({clientId: clientId2, name: 'Tenant2'}));

    await http
      .patch(`${TenantsUrl}`)
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

  // findById

  it('should find tenants by id for users clientId only if api user uses no filter', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    await setupTenantInDb(new Tenant({clientId: clientId2, name: 'Tenant2'}));

    const res = await http
      .get(`${TenantsUrl}/${tenant1.id}`)
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.name).to.eql('Tenant1');
  });

  it('should not find tenants by id for users clientId only if api user uses no filter', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token = await login(http, testUser1);
    await setupTenantInDb(new Tenant({clientId: clientId1, name: 'Tenant1'}));
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
    );

    await http
      .get(`${TenantsUrl}/${tenant2.id}`)
      .set('Authorization', 'Bearer ' + token)
      .expect(204);
  });

  it('should not find tenants by id for users clientId only if api user filters for other clientId', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token = await login(http, testUser1);
    await setupTenantInDb(new Tenant({clientId: clientId1, name: 'Tenant1'}));
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
    );

    await http
      .get(`${TenantsUrl}/${tenant2.id}?where[clientId]=${clientId2}`)
      .set('Authorization', 'Bearer ' + token)
      .expect(204);
  });

  // patch by id

  it('should update tenant by id for users clientId only if no clientId is given', async () => {
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
      .patch(`${TenantsUrl}/${tenant1.id}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({email: 'tenant1@tenants.de'})
      .expect(204);

    const tenantRepository: TenantRepository = await app.getRepository(
      TenantRepository,
    );

    const clientId1Tenants = await tenantRepository.find({
      where: {clientId: clientId1},
    });
    expect(clientId1Tenants.length).to.eql(1);
    expect(clientId1Tenants[0].email).to.eql('tenant1@tenants.de');

    const clientId2Tenants = await tenantRepository.find({
      where: {clientId: clientId2},
    });
    expect(clientId2Tenants.length).to.eql(1);
    expect(clientId2Tenants[0].email).to.be.null();
  });

  it('should update tenant by id for users clientId only if different clientId is given', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token = await login(http, testUser1);
    await setupTenantInDb(new Tenant({clientId: clientId1, name: 'Tenant1'}));
    const tenant2 = await setupTenantInDb(
      new Tenant({clientId: clientId2, name: 'Tenant2'}),
    );

    await http
      .patch(`${TenantsUrl}/${tenant2.id}?where[clientId]=${clientId2}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({email: 'tenant1@tenants.de'})
      .expect(204);

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

  it('should not update tenant by id if own clientId is set to a different clientId', async () => {
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
      .patch(`${TenantsUrl}/${tenant1.id}`)
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

  it('should replace full tenant by id', async () => {
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
      .put(`${TenantsUrl}/${tenant1.id}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({
        id: tenant1.id,
        clientId: tenant1.clientId,
        name: tenant1.name,
        email: 'tenant1@tenants.de',
        phone: '0123/4567890',
        accountSynchronisationName: 'Tenant1',
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
    expect(clientId1Tenants[0].accountSynchronisationName).to.eql('Tenant1');

    const clientId2Tenants = await tenantRepository.find({
      where: {clientId: clientId2},
    });
    expect(clientId2Tenants.length).to.eql(1);
    expect(clientId2Tenants[0].name).to.eql('Tenant2');
    expect(clientId2Tenants[0].email).to.be.null();
    expect(clientId2Tenants[0].phone).to.be.null();
  });

  it('should fail to replace full tenant by id with optional null items returning 422', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token = await login(http, testUser1);
    const tenant1 = await setupTenantInDb(
      new Tenant({
        clientId: clientId1,
        name: 'Tenant1',
        email: 'tenant1@tenants.de',
        phone: '0123/4567890',
        accountSynchronisationName: 'Tenant1',
      }),
    );
    await setupTenantInDb(new Tenant({clientId: clientId2, name: 'Tenant2'}));

    await http
      .put(`${TenantsUrl}/${tenant1.id}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({
        id: tenant1.id,
        clientId: tenant1.clientId,
        name: tenant1.name,
        email: null,
        phone: null,
        accountSynchronisationName: null,
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
    expect(clientId1Tenants[0].email).to.be.null;
    expect(clientId1Tenants[0].phone).to.be.null;
    expect(clientId1Tenants[0].accountSynchronisationName).to.be.null;

    const clientId2Tenants = await tenantRepository.find({
      where: {clientId: clientId2},
    });
    expect(clientId2Tenants.length).to.eql(1);
    expect(clientId2Tenants[0].name).to.eql('Tenant2');
    expect(clientId2Tenants[0].email).to.be.null();
    expect(clientId2Tenants[0].phone).to.be.null();
  });

  it('should replace minimal tenant by id', async () => {
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
      .put(`${TenantsUrl}/${tenant1.id}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({
        id: tenant1.id,
        clientId: tenant1.clientId,
        name: tenant1.name,
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
    expect(clientId1Tenants[0].email).to.eql(null);
    expect(clientId1Tenants[0].phone).to.eql(null);
    expect(clientId1Tenants[0].accountSynchronisationName).to.eql(null);

    const clientId2Tenants = await tenantRepository.find({
      where: {clientId: clientId2},
    });
    expect(clientId2Tenants.length).to.eql(1);
    expect(clientId2Tenants[0].name).to.eql('Tenant2');
    expect(clientId2Tenants[0].email).to.be.null();
    expect(clientId2Tenants[0].phone).to.be.null();
  });

  it('should not replace client id of tenant1 to clientId2', async () => {
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
      .put(`${TenantsUrl}/${tenant1.id}`)
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

  it('should delete tenant1', async () => {
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
      .delete(`${TenantsUrl}/${tenant1.id}`)
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

  it('should not delete tenant2 if filtered to client2 ', async () => {
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
      .delete(`${TenantsUrl}/${tenant2.id}`)
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

  function createTenantViaHttp(token: string, data: {}) {
    return http
      .post(TenantsUrl)
      .set('Authorization', 'Bearer ' + token)
      .send(data)
      .set('Content-Type', 'application/json');
  }

  async function setupTenantInDb(tenant: Tenant): Promise<Tenant> {
    const tenantRepository = await app.getRepository(TenantRepository);
    return tenantRepository.save(tenant);
  }
});
