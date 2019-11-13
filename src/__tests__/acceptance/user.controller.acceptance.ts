import {DataObject} from '@loopback/repository';
import {UserProfile} from '@loopback/security';
import {Client, expect} from '@loopback/testlab';
import {RentmonitorServerApplication} from '../..';
import {PasswordHasherBindings} from '../../keys';
import {User} from '../../models';
import {ClientRepository, UserRepository} from '../../repositories';
import {PasswordHasher} from '../../services/authentication/hash.password.bcryptjs';
import {JWTService} from '../../services/authentication/jwt.service';
import {givenEmptyDatabase, setupApplication} from './test-helper';

describe('UserController Acceptence Test', () => {
  let app: RentmonitorServerApplication;
  let http: Client;
  let jwtService: JWTService;

  before('setupApplication', async () => {
    ({app, client: http, jwtService} = await setupApplication());
  });
  beforeEach(clearDatabase);

  after(async () => {
    await app.stop();
  });

  it('should return jwt token on successful login', async () => {
    const clientId = await setupClientInDb('TestClient1');
    const testUser = getTestUser('1');
    await setupUserInDb(clientId, testUser);
    const res = await http
      .post('/users/login')
      .send({email: testUser.email, password: testUser.password});

    expect(res.status).to.eql(200);
    const userProfile = await decryptJWTToken(res.body.token);
    expect(userProfile.userId).to.eql(testUser.getId);
    expect(userProfile.clientId).to.eql(clientId);
  });

  it('should return invalid login error on password with less than 8 characters', async () => {
    const clientId = await setupClientInDb('TestClient1');
    const testUser = getTestUser('1');
    await setupUserInDb(clientId, testUser);
    const res = await http
      .post('/users/login')
      .send({email: testUser.email, password: '1'});

    expect(res.status).to.eql(401);
    expect(res.body.error.message).to.eql('Invalid email or password.');
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

  function getTestUser(testId: string): User {
    const testUser = Object.assign({}, new User(), {
      email: 'test@loopback' + testId + '.io',
      password: 'p4ssw0rd',
      firstName: 'Example',
      lastName: 'User ' + testId,
    });
    return testUser;
  }
});
