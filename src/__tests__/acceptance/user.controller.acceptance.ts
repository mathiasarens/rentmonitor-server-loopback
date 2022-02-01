import {DataObject} from '@loopback/repository';
import {UserProfile} from '@loopback/security';
import {Client, expect} from '@loopback/testlab';
import {RentmonitorServerApplication} from '../..';
import {PasswordHasherBindings} from '../../keys';
import {User} from '../../models';
import {ClientRepository, UserRepository} from '../../repositories';
import {PasswordHasher} from '../../services/authentication/hash.password.bcryptjs';
import {JWTLocalService} from '../../services/authentication/jwt.local.service';
import {
  getTestUser,
  givenEmptyDatabase,
  setupApplication,
} from '../helpers/acceptance-test.helpers';

describe('UserController Acceptence Test', () => {
  let app: RentmonitorServerApplication;
  let http: Client;
  let jwtService: JWTLocalService;

  before('setupApplication', async () => {
    ({app, client: http, jwtService} = await setupApplication());
  });
  beforeEach(clearDatabase);

  after(async () => {
    await app.stop();
  });

  // login
  it('should return jwt token on successful login', async () => {
    const clientId = await setupClientInDb('TestClient1');
    const testUser = getTestUser(clientId, 1);
    await setupUserInDb(clientId, testUser);
    const res = await http
      .post('/users/login')
      .set('Content-Type', 'application/json')
      .send({email: testUser.email, password: testUser.password});

    expect(res.status).to.eql(200);
    const userProfile = await decryptJWTToken(res.body.token);
    expect(userProfile.userId).to.eql(testUser.getId);
    expect(userProfile.clientId).to.eql(clientId);
  });

  it('should return invalid login error on password with less than 8 characters', async () => {
    const clientId = await setupClientInDb('TestClient1');
    const testUser = getTestUser(clientId, 1);
    await setupUserInDb(clientId, testUser);
    const res = await http
      .post('/users/login')
      .set('Content-Type', 'application/json')
      .send({email: testUser.email, password: '1'});

    expect(res.status).to.eql(401);
    expect(res.body.error.message).to.eql('Invalid email or password.');
  });

  // findById

  it('should not find users from other clients', async () => {
    const clientId1 = await setupClientInDb('TestClient1');
    const clientId2 = await setupClientInDb('TestClient2');
    const testUser1 = getTestUser(clientId1, 1);
    const testUser2 = getTestUser(clientId2, 2);
    await setupUserInDb(clientId1, testUser1);
    const dbUser2 = await setupUserInDb(clientId2, testUser2);
    const loginResponse = await http
      .post('/users/login')
      .set('Content-Type', 'application/json')
      .send({email: testUser1.email, password: testUser1.password});

    expect(loginResponse.status).to.eql(200);

    const response = await http
      .get('/users/' + dbUser2.id)
      .set('Authorization', 'Bearer ' + loginResponse.body.token)
      .set('Accept', 'application/json');

    expect(response.status).to.eql(200);
    expect(response.body).to.be.null();
    expect(response.headers['access-control-allow-origin']).to.eql('*');
  });

  it('should find user from the same client', async () => {
    const clientId1 = await setupClientInDb('TestClient1');
    const testUser1 = getTestUser(clientId1, 1);
    const testUser2 = getTestUser(clientId1, 2);
    await setupUserInDb(clientId1, testUser1);
    const dbUser2 = await setupUserInDb(clientId1, testUser2);
    const loginResponse = await http
      .post('/users/login')
      .set('Content-Type', 'application/json')
      .send({email: testUser1.email, password: testUser1.password});

    expect(loginResponse.status).to.eql(200);

    const response = await http
      .get('/users/' + dbUser2.id)
      .set('Authorization', 'Bearer ' + loginResponse.body.token)
      .set('Accept', 'application/json');

    expect(response.status).to.eql(200);
    expect(response.body.clientId).to.eql(clientId1);
    expect(response.body.firstName).to.eql(dbUser2.firstName);
    expect(response.body.lastName).to.eql(dbUser2.lastName);
    expect(response.body.email).to.eql(dbUser2.email);
    expect(response.body.id).to.eql(dbUser2.id);
  });

  // non test methods --------------------------------------------------------------------

  async function clearDatabase() {
    await givenEmptyDatabase(app);
  }

  async function decryptJWTToken(token: string): Promise<UserProfile> {
    return jwtService.verifyToken(token);
  }

  async function setupClientInDb(name: string): Promise<number> {
    const clientRepository = await app.getRepository(ClientRepository);
    const clientFromDb = await clientRepository.create({name: name});
    return clientFromDb.id;
  }

  async function setupUserInDb(clientId: number, user: User) {
    const passwordHasher: PasswordHasher = await app.get(
      PasswordHasherBindings.PASSWORD_HASHER,
    );
    const encryptedPassword = await passwordHasher.hashPassword(user.password);
    const userRepository: UserRepository = await app.getRepository(
      UserRepository,
    );
    const newUser: DataObject<User> = Object.assign({}, user, {
      password: encryptedPassword,
      clientId: clientId,
    });
    const newUserFromDb = await userRepository.create(newUser);
    return newUserFromDb;
  }
});
