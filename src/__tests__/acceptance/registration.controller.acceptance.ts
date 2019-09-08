import {Client, expect} from '@loopback/testlab';
import {RentmonitorServerApplication} from '../..';
import {ClientRepository, UserRepository} from '../../repositories';
import {givenEmptyDatabase, setupApplication} from './test-helper';

describe('RegistrationController', () => {
  let app: RentmonitorServerApplication;
  let http: Client;

  before('setupApplication', async () => {
    ({app, client: http} = await setupApplication());
  });

  beforeEach(clearDatabase);

  after(async () => {
    await app.stop();
  });

  it('should register a new user and create a new client', async () => {
    const clientName = 'Schlangenpfad 25';
    const email = 'user@email.org';
    const password = '3%2d&ZG$SE';
    const res = await sendRegistrationHttpRequest(clientName, email, password)
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.token).to.be.a.String();
  });

  it('should return 409 if user and client is added twice', async () => {
    const clientName = 'Schlangenpfad 25';
    const email = 'user@email.org';
    const password = '3%2d&ZG$SE';
    await sendRegistrationHttpRequest(clientName, email, password)
      .expect(200)
      .expect('Content-Type', 'application/json');

    // when
    await sendRegistrationHttpRequest(clientName, email, password)
      .expect(409)
      .expect('Content-Type', 'application/json; charset=utf-8');

    // then
    const clientRepository = await app.getRepository(ClientRepository);
    const clientsWithGivenName = await clientRepository.find({
      where: {name: clientName},
    });
    expect(clientsWithGivenName).to.have.lengthOf(1);

    const userRepository = await app.getRepository(UserRepository);
    const userWithGivenEmail = await userRepository.find({
      where: {email: email},
    });
    expect(userWithGivenEmail).to.have.lengthOf(1);
  });

  async function clearDatabase() {
    await givenEmptyDatabase(app);
  }

  function sendRegistrationHttpRequest(
    clientName: string,
    email: string,
    password: string,
  ) {
    return http
      .post('/registrations')
      .send({clientName: clientName, email: email, password: password})
      .set('Content-Type', 'application/json');
  }
});
