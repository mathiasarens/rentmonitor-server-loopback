import {TokenService, UserService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors, post, requestBody} from '@loopback/rest';
import * as _ from 'lodash';
import {
  PasswordHasherBindings,
  TokenServiceBindings,
  UserServiceBindings,
} from '../keys';
import {Client, User} from '../models';
import {ClientRepository, UserRepository} from '../repositories';
import {Credentials} from '../repositories/user.repository';
import {PasswordHasher} from '../services/authentication/hash.password.bcryptjs';
import {validateCredentials} from '../services/authentication/validator';

export class Registration {
  clientName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
}

export class RegistrationController {
  constructor(
    @repository(ClientRepository) public clientRepository: ClientRepository,
    @repository(UserRepository) public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: UserService<User, Credentials>,
  ) {}

  @post('/registration', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async register(
    @requestBody() registration: Registration,
  ): Promise<{token: string}> {
    // ensure a valid email value and password value
    validateCredentials(_.pick(registration, ['email', 'password']));

    // encrypt the password
    // eslint-disable-next-line require-atomic-updates
    registration.password = await this.passwordHasher.hashPassword(
      registration.password,
    );

    const tx = await this.clientRepository.beginTransaction();
    try {
      const savedClient = await this.clientRepository.create(
        new Client({name: registration.clientName}),
        {transaction: tx},
      );
      // create the new user
      const savedUser = await this.userRepository.create(
        new User({
          clientId: savedClient.id,
          email: registration.email,
          password: registration.password,
          firstName: registration.firstName,
          lastName: registration.lastName,
        }),
        {transaction: tx},
      );

      // convert a User object into a UserProfile object (reduced set of properties)
      const userProfile = this.userService.convertToUserProfile(savedUser);

      // create a JSON Web Token based on the user profile
      const token = await this.jwtService.generateToken(userProfile);

      await tx.commit();
      return {token};
    } catch (error) {
      await tx.rollback();
      if (error.message.includes('unique constraint')) {
        throw new HttpErrors.Conflict('Email value is already taken');
      } else {
        throw error;
      }
    }
  }
}
