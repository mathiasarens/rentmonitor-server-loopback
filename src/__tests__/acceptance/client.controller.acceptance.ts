import {Client, expect} from '@loopback/testlab';
import {RentmonitorServerApplication} from '../..';
import {Booking, Tenant} from '../../models';
import {ClientRepository, TenantRepository} from '../../repositories';
import {
  clearDatabase,
  getTestUser,
  login,
  setupApplication,
  setupBookingInDb,
  setupClientInDb,
  setupTenantInDb,
  setupUserInDb,
} from '../helpers/acceptance-test.helpers';

describe('ClientController', () => {
  let app: RentmonitorServerApplication;
  let http: Client;

  before('setupApplication', async () => {
    ({app, client: http} = await setupApplication());
  });

  beforeEach(() => clearDatabase(app));

  after(async () => {
    await app.stop();
  });

  // post

  it('should add new client on post', async () => {
    const clientName = 'TestClient1';
    const res = await createClient(clientName)
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.id).to.be.a.Number();
    expect(res.body.name).to.eql(clientName);
  });

  it('should not return 400 if adding same client name twice', async () => {
    const clientName = 'TestClient1';
    await setupClientInDb(app, clientName);
    const res = await createClient(clientName)
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.id).to.be.a.Number();
    expect(res.body.name).to.eql(clientName);
  });

  // get

  it('should return clients for own clientId only', async () => {
    await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser2 = getTestUser(clientId2, 2);
    await setupUserInDb(app, clientId2, testUser2);
    const token2 = await login(http, testUser2);

    // test
    const result = await http
      .get(`/clients`)
      .set('Authorization', 'Bearer ' + token2)
      .expect(200);

    // asserts
    expect(result.body.length).to.eql(1);
    expect(result.body[0].id).to.eql(clientId2);
    expect(result.body[0].name).to.eql('TestClient2');
  });

  // get by id

  it('should return client by id', async () => {
    await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser2 = getTestUser(clientId2, 2);
    await setupUserInDb(app, clientId2, testUser2);
    const token2 = await login(http, testUser2);

    // test
    const result = await http
      .get(`/clients/${clientId2}`)
      .set('Authorization', 'Bearer ' + token2)
      .expect(200);

    // asserts
    expect(result.body.id).to.eql(clientId2);
    expect(result.body.name).to.eql('TestClient2');
  });

  it('should not return different client by id', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser2 = getTestUser(clientId2, 2);
    await setupUserInDb(app, clientId2, testUser2);
    const token2 = await login(http, testUser2);

    // test
    await http
      .get(`/clients/${clientId1}`)
      .set('Authorization', 'Bearer ' + token2)
      .expect(500);
  });

  // patch by id

  it('should allow to patch own client by id', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const testUser = getTestUser(clientId1, 1);
    await setupUserInDb(app, clientId1, testUser);
    const token = await login(http, testUser);

    // test
    await http
      .patch(`/clients/${clientId1}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({
        name: 'TestClient1Update',
      })
      .expect(204);

    // asserts
    const clientRepository: ClientRepository = await app.getRepository(
      ClientRepository,
    );

    const clientsFromDb1 = await clientRepository.find({
      where: {id: clientId1},
    });
    expect(clientsFromDb1.length).to.eql(1);
    expect(clientsFromDb1[0].id).to.eql(clientId1);
    expect(clientsFromDb1[0].name).to.eql('TestClient1Update');
  });

  it('should not allow to patch different client by id', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser2 = getTestUser(clientId2, 2);
    await setupUserInDb(app, clientId2, testUser2);
    const token2 = await login(http, testUser2);

    // test
    await http
      .patch(`/clients/${clientId1}`)
      .set('Authorization', 'Bearer ' + token2)
      .set('Content-Type', 'application/json')
      .send({
        id: clientId2,
        name: 'TestClient1Update',
      })
      .expect(500);

    // asserts
    const clientRepository: ClientRepository = await app.getRepository(
      ClientRepository,
    );

    const clientsFromDb1 = await clientRepository.find({
      where: {id: clientId1},
    });
    expect(clientsFromDb1.length).to.eql(1);
    expect(clientsFromDb1[0].id).to.eql(clientId1);
    expect(clientsFromDb1[0].name).to.eql('TestClient1');

    const clientsFromDb2 = await clientRepository.find({
      where: {id: clientId2},
    });
    expect(clientsFromDb2.length).to.eql(1);
    expect(clientsFromDb2[0].id).to.eql(clientId2);
    expect(clientsFromDb2[0].name).to.eql('TestClient2');
  });

  it('should not allow to patch different client by id with own id', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser2 = getTestUser(clientId2, 2);
    await setupUserInDb(app, clientId2, testUser2);
    const token2 = await login(http, testUser2);

    // test
    await http
      .patch(`/clients/${clientId2}`)
      .set('Authorization', 'Bearer ' + token2)
      .set('Content-Type', 'application/json')
      .send({
        id: clientId1,
        name: 'TestClient1Update',
      })
      .expect(204);

    // asserts
    const clientRepository: ClientRepository = await app.getRepository(
      ClientRepository,
    );

    const clientsFromDb1 = await clientRepository.find({
      where: {id: clientId1},
    });
    expect(clientsFromDb1.length).to.eql(1);
    expect(clientsFromDb1[0].id).to.eql(clientId1);
    expect(clientsFromDb1[0].name).to.eql('TestClient1');

    // client2 is updated instead
    // that's okay
    const clientsFromDb2 = await clientRepository.find({
      where: {id: clientId2},
    });
    expect(clientsFromDb2.length).to.eql(1);
    expect(clientsFromDb2[0].id).to.eql(clientId2);
    expect(clientsFromDb2[0].name).to.eql('TestClient1Update');
  });

  //put

  it('should allow to update own client', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const testUser = getTestUser(clientId1, 1);
    await setupUserInDb(app, clientId1, testUser);
    const token = await login(http, testUser);

    // test
    await http
      .put(`/clients/${clientId1}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({
        id: clientId1,
        name: 'TestClient1Update',
      })
      .expect(204);

    // asserts
    const clientRepository: ClientRepository = await app.getRepository(
      ClientRepository,
    );

    const clientsFromDb1 = await clientRepository.find({
      where: {id: clientId1},
    });
    expect(clientsFromDb1.length).to.eql(1);
    expect(clientsFromDb1[0].id).to.eql(clientId1);
    expect(clientsFromDb1[0].name).to.eql('TestClient1Update');
  });

  it('should not allow to update different client', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser2 = getTestUser(clientId2, 2);
    await setupUserInDb(app, clientId2, testUser2);
    const token2 = await login(http, testUser2);

    // test
    await http
      .put(`/clients/${clientId1}`)
      .set('Authorization', 'Bearer ' + token2)
      .set('Content-Type', 'application/json')
      .send({
        id: clientId2,
        name: 'TestClient1Update',
      })
      .expect(500);

    // asserts
    const clientRepository: ClientRepository = await app.getRepository(
      ClientRepository,
    );

    const clientsFromDb1 = await clientRepository.find({
      where: {id: clientId1},
    });
    expect(clientsFromDb1.length).to.eql(1);
    expect(clientsFromDb1[0].id).to.eql(clientId1);
    expect(clientsFromDb1[0].name).to.eql('TestClient1');

    const clientsFromDb2 = await clientRepository.find({
      where: {id: clientId2},
    });
    expect(clientsFromDb2.length).to.eql(1);
    expect(clientsFromDb2[0].id).to.eql(clientId2);
    expect(clientsFromDb2[0].name).to.eql('TestClient2');
  });

  it('should not allow to update own client to different client id', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser2 = getTestUser(clientId2, 2);
    await setupUserInDb(app, clientId2, testUser2);
    const token2 = await login(http, testUser2);

    // test
    await http
      .put(`/clients/${clientId2}`)
      .set('Authorization', 'Bearer ' + token2)
      .set('Content-Type', 'application/json')
      .send({
        id: clientId1,
        name: 'TestClient1Update',
      })
      .expect(400);

    // asserts
    const clientRepository: ClientRepository = await app.getRepository(
      ClientRepository,
    );

    const clientsFromDb1 = await clientRepository.find({
      where: {id: clientId1},
    });
    expect(clientsFromDb1.length).to.eql(1);
    expect(clientsFromDb1[0].id).to.eql(clientId1);
    expect(clientsFromDb1[0].name).to.eql('TestClient1');

    const clientsFromDb2 = await clientRepository.find({
      where: {id: clientId2},
    });
    expect(clientsFromDb2.length).to.eql(1);
    expect(clientsFromDb2[0].id).to.eql(clientId2);
    expect(clientsFromDb2[0].name).to.eql('TestClient2');
  });

  // delete

  it('should allow to delete own client', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const testUser = getTestUser(clientId1, 1);
    await setupUserInDb(app, clientId1, testUser);
    const token = await login(http, testUser);

    const expectedDate = new Date();
    const expectedAmount = 2500;
    const tenant1 = await setupTenantInDb(
      app,
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    await setupBookingInDb(
      app,
      new Booking({
        clientId: clientId1,
        tenantId: tenant1.id,
        date: expectedDate,
        amount: expectedAmount,
      }),
    );

    // test
    await http
      .delete(`/clients/${clientId1}`)
      .set('Authorization', 'Bearer ' + token)
      .expect(204);

    // asserts
    const clientRepository: ClientRepository = await app.getRepository(
      ClientRepository,
    );
    const tenantRepository: TenantRepository = await app.getRepository(
      TenantRepository,
    );
    const clientsFromDb1 = await clientRepository.find({
      where: {id: clientId1},
    });
    expect(clientsFromDb1.length).to.eql(0);

    const tenantsFromDb1 = await tenantRepository.find({
      where: {id: clientId1},
    });
    expect(tenantsFromDb1.length).to.eql(0);
  });

  it('should not allow to delete a different client than it own client', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser2 = getTestUser(clientId2, 1);
    await setupUserInDb(app, clientId2, testUser2);
    const token2 = await login(http, testUser2);

    const expectedDate = new Date();
    const expectedAmount = 2500;
    const tenant1 = await setupTenantInDb(
      app,
      new Tenant({clientId: clientId1, name: 'Tenant1'}),
    );
    await setupBookingInDb(
      app,
      new Booking({
        clientId: clientId1,
        tenantId: tenant1.id,
        date: expectedDate,
        amount: expectedAmount,
      }),
    );

    // test
    await http
      .delete(`/clients/${clientId1}`)
      .set('Authorization', 'Bearer ' + token2)
      .expect(500);

    // asserts
    const clientRepository: ClientRepository = await app.getRepository(
      ClientRepository,
    );
    const clientFromDb1 = await clientRepository.findById(clientId1);
    expect(clientFromDb1.name).to.eql('TestClient1');
  });

  // ---------------------------------- helper functions --------------------------------------------------

  function createClient(name: string) {
    return http
      .post('/clients')
      .send({name: name})
      .set('Content-Type', 'application/json');
  }
});
