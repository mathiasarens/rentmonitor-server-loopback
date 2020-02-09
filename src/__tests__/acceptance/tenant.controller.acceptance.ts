import { Client, expect } from '@loopback/testlab';
import { RentmonitorServerApplication } from '../..';
import { TenantsUrl } from '../../controllers';
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
      .get(`${TenantsUrl}/count?where[clientId]=${clientId + 1}`)
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.count).to.eql(1);
  });

  // non test methods --------------------------------------------------------------------

  function createTenantViaHttp(token: string, data: {}) {
    return http
      .post(TenantsUrl)
      .set('Authorization', 'Bearer ' + token)
      .send(data)
      .set('Content-Type', 'application/json');
  }
});
