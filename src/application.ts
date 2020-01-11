import {
  AuthenticationComponent,
  registerAuthenticationStrategy,
} from '@loopback/authentication';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, BindingKey} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import * as path from 'path';
import {JWTAuthenticationStrategy} from './authentication-strategies/jwt-strategy';
import {
  PasswordHasherBindings,
  TokenServiceBindings,
  TokenServiceConstants,
  UserServiceBindings,
} from './keys';
import {MyAuthenticationSequence} from './sequence';
import {
  AccountSynchronisationBookingService,
  AccountSynchronisationBookingServiceBindings,
} from './services/accountsynchronisation/account-synchronisation-booking.service';
import {
  AccountSynchronisationTransactionService,
  AccountSynchronisationTransactionServiceBindings,
} from './services/accountsynchronisation/account-synchronisation-transaction.service';
import {
  AccountSynchronisationService,
  AccountSynchronisationServiceBindings,
} from './services/accountsynchronisation/account-synchronisation.service';
import {
  FintsService,
  FintsServiceBindings,
} from './services/accountsynchronisation/fints.service';
import {BcryptHasher} from './services/authentication/hash.password.bcryptjs';
import {JWTService} from './services/authentication/jwt.service';
import {MyUserService} from './services/authentication/user.service';

/**
 * Information from package.json
 */
export interface PackageInfo {
  name: string;
  version: string;
  description: string;
}
export const PackageKey = BindingKey.create<PackageInfo>('application.package');

const pkg: PackageInfo = require('../package.json');

export class RentmonitorServerApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.setUpBindings();

    // Bind authentication component related elements
    this.component(AuthenticationComponent);

    registerAuthenticationStrategy(this, JWTAuthenticationStrategy);

    // Set up the custom sequence
    this.sequence(MyAuthenticationSequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.bind(RestExplorerBindings.CONFIG).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }

  setUpBindings(): void {
    // Bind package.json to the application context
    this.bind(PackageKey).to(pkg);

    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(
      TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE,
    );

    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);

    // // Bind bcrypt hash services
    this.bind(PasswordHasherBindings.ROUNDS).to(10);
    this.bind(PasswordHasherBindings.PASSWORD_HASHER).toClass(BcryptHasher);

    this.bind(UserServiceBindings.USER_SERVICE).toClass(MyUserService);

    this.bind(AccountSynchronisationServiceBindings.SERVICE).toClass(
      AccountSynchronisationService,
    );
    this.bind(FintsServiceBindings.SERVICE).toClass(FintsService);
    this.bind(AccountSynchronisationTransactionServiceBindings.SERVICE).toClass(
      AccountSynchronisationTransactionService,
    );
    this.bind(AccountSynchronisationBookingServiceBindings.SERVICE).toClass(
      AccountSynchronisationBookingService,
    );
  }
}
