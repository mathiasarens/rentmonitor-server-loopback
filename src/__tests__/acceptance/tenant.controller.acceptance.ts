import { Client, expect } from '@loopback/testlab';
import { RentmonitorServerApplication } from '../..';
import { TenantsUrl } from '../../controllers';
import { Tenant } from '../../models';
import { TenantRepository } from '../../repositories';
import { clearDatabase, getTestUser, login, setupApplication, setupClientInDb, setupUserInDb } from '../helpers/acceptance-test.helpers';

describe('TenantController', () => {
  let app: RentmonitorServerApplication;
  let http: Client;

  before('setupApplication', async () => {
    ({ app, client: http } = await setupApplication());
  });

  beforeEach(async () => { await clearDatabase(app) });

  after(async () => {
    await app.stop();
  });

  it('should add new tenant on post', async () => {
    const clientId = await setupClientInDb(app, 'TestClient1');
    const testUser = getTestUser('1');
    await setupUserInDb(app, clientId, testUser);
    const token = await login(http, testUser);

    const tenantName = 'TestTenant1';
    const res = await createTenantViaHttp(token, { name: tenantName })
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.id).to.be.a.Number();
    expect(res.body.name).to.eql(tenantName);
  });

  it('should add tenant with same name twice', async () => {
    const clientId = await setupClientInDb(app, 'TestClient1');
    const testUser = getTestUser('1');
    await setupUserInDb(app, clientId, testUser);
    const token = await login(http, testUser);

    const tenantName = 'TestTenant1';
    await createTenantViaHttp(token, { name: tenantName });
    const res = await createTenantViaHttp(token, { name: tenantName })
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.id).to.be.a.Number();
    expect(res.body.name).to.eql(tenantName);
    const debitorRepository = await app.getRepository(TenantRepository);
    const debitorsFromDb = await debitorRepository.find({
      where: { clientId: clientId },
    });
    expect(debitorsFromDb).length(2);
  });

  it('should add tenant with clientId from logged in user', async () => {
    const clientId = await setupClientInDb(app, 'TestClient1');
    const testUser = getTestUser('1');
    await setupUserInDb(app, clientId, testUser);
    const token = await login(http, testUser);

    const tenantName = 'TestTenant1';
    const res = await createTenantViaHttp(token, { name: tenantName })
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.id).to.be.a.Number();
    expect(res.body.clientId).to.eql(clientId)
    expect(res.body.name).to.eql(tenantName);
  });

  it('should count tenants for users clientId only', async () => {
    const clientId = await setupClientInDb(app, 'TestClient1');
    const testUser = getTestUser('1');
    await setupUserInDb(app, clientId, testUser);
    const token = await login(http, testUser);

    const tenantName = 'TestTenant1';
    await createTenantViaHttp(token, { name: tenantName })
      .expect(200)
      .expect('Content-Type', 'application/json');

    const res = await http
      .get(`${TenantsUrl}/count?filter[clientId]=${clientId + 1}`)
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.count).to.eql(1);
  });

  it('should find tenants for users clientId only if user overwrites clientId', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token = await login(http, testUser1);
    await setupTenantInDb(new Tenant({ clientId: clientId1, name: 'Tenant1' }));
    await setupTenantInDb(new Tenant({ clientId: clientId2, name: 'Tenant2' }));

    const res = await http
      .get(`${TenantsUrl}?filter[where][clientId]=${clientId2}`)
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.length).to.eql(1);
    expect(res.body[0].name).to.eql('Tenant1');
  });

  it('should find tenants for users clientId only if user uses a where filter without clientId', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const token = await login(http, testUser1);
    await setupTenantInDb(new Tenant({ clientId: clientId1, name: 'Tenant1' }));
    await setupTenantInDb(new Tenant({ clientId: clientId2, name: 'Tenant2' }));

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
    await setupTenantInDb(new Tenant({ clientId: clientId1, name: 'Tenant1' }));
    await setupTenantInDb(new Tenant({ clientId: clientId2, name: 'Tenant2' }));

    const res = await http
      .get(`${TenantsUrl}`)
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.length).to.eql(1);
    expect(res.body[0].name).to.eql('Tenant1');
  });

  // non test methods --------------------------------------------------------------------

  function createTenantViaHttp(token: string, data: {}) {
    return http
      .post(TenantsUrl)
      .set('Authorization', 'Bearer ' + token)
      .send(data)
      .set('Content-Type', 'application/json');
  }

  async function setupTenantInDb(tenant: Tenant) {
    const tenantRepository = await app.getRepository(TenantRepository);
    await tenantRepository.save(tenant);
  }

});
