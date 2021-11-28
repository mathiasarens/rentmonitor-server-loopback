import {
  AuthenticationComponent,
  registerAuthenticationStrategy,
} from '@loopback/authentication';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin, SchemaMigrationOptions} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import * as path from 'path';
import {JWTAuthorizationHeaderStrategy} from './authentication-strategies/authorization-header-jwt-strategy';
import {
  PasswordHasherBindings,
  TokenServiceBindings,
  TokenServiceConstants,
  UserServiceBindings,
} from './keys';
import {ClientRepository} from './repositories';
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
  ContractToBookingService,
  ContractToBookingServiceBindings,
} from './services/accountsynchronisation/contract-to-booking.service';
import {
  FintsClientBindings,
  FintsClientFactoryImpl,
} from './services/accountsynchronisation/fints-client.factory.impl';
import {
  FintsServiceBindings,
  FintsServiceImpl,
} from './services/accountsynchronisation/fints.service.impl';
import {
  TransactionToBookingService,
  TransactionToBookingServiceBindings,
} from './services/accountsynchronisation/transaction-to-booking.service';
import {BcryptHasher} from './services/authentication/hash.password.bcryptjs';
import {JWTLocalService} from './services/authentication/jwt.local.service';
import {MyUserService} from './services/authentication/user.service';
import {
  TenantBookingOverviewService,
  TenantBookingOverviewServiceBindings,
} from './services/overview/tenant-booking-overview.service';

export class RentmonitorServerApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.setUpBindings();

    // Bind authentication component related elements
    this.component(AuthenticationComponent);

    registerAuthenticationStrategy(this, JWTAuthorizationHeaderStrategy);

    // Set up the custom sequence
    this.sequence(MyAuthenticationSequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
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
    this.bind(TokenServiceBindings.LOCAL_TOKEN_EXPIRES_IN).to(
      TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE,
    );
    this.bind(TokenServiceBindings.LOCAL_TOKEN_SERVICE).toClass(
      JWTLocalService,
    );

    this.bind(TokenServiceBindings.AWS_COGNITO_JWK_URL).toDynamicValue(
      () => process.env.RENTMONITOR_AWS_COGNITO_JWK_URL,
    );

    // // Bind bcrypt hash services
    this.bind(PasswordHasherBindings.ROUNDS).to(10);
    this.bind(PasswordHasherBindings.PASSWORD_HASHER).toClass(BcryptHasher);

    this.bind(UserServiceBindings.USER_SERVICE).toClass(MyUserService);

    this.bind(AccountSynchronisationServiceBindings.SERVICE).toClass(
      AccountSynchronisationService,
    );
    this.bind(FintsServiceBindings.SERVICE).toClass(FintsServiceImpl);
    this.bind(AccountSynchronisationTransactionServiceBindings.SERVICE).toClass(
      AccountSynchronisationTransactionService,
    );
    this.bind(AccountSynchronisationBookingServiceBindings.SERVICE).toClass(
      AccountSynchronisationBookingService,
    );
    this.bind(FintsClientBindings.FACTORY).toClass(FintsClientFactoryImpl);

    this.bind(TransactionToBookingServiceBindings.SERVICE).toClass(
      TransactionToBookingService,
    );

    this.bind(ContractToBookingServiceBindings.SERVICE).toClass(
      ContractToBookingService,
    );

    this.bind(TenantBookingOverviewServiceBindings.SERVICE).toClass(
      TenantBookingOverviewService,
    );
  }

  async migrateSchema(options?: SchemaMigrationOptions) {
    console.log('Running custom schema migration', options);

    if (options?.existingSchema === 'drop') {
      console.log('Fixing postgresql database connector issue');
      const clientRepo = await this.getRepository(ClientRepository);
      await clientRepo.dataSource.execute(
        'DROP TABLE IF EXISTS public.client CASCADE',
      );
      await clientRepo.dataSource.execute(
        'DROP TABLE IF EXISTS public.accountsettings CASCADE',
      );
      await clientRepo.dataSource.execute(
        'DROP TABLE IF EXISTS public.accounttransaction CASCADE',
      );
      await clientRepo.dataSource.execute(
        'DROP TABLE IF EXISTS public.accounttransactionlog CASCADE',
      );
      await clientRepo.dataSource.execute(
        'DROP TABLE IF EXISTS public.contract CASCADE',
      );
      await clientRepo.dataSource.execute(
        'DROP TABLE IF EXISTS public.tenant CASCADE',
      );
      await clientRepo.dataSource.execute(
        'DROP TABLE IF EXISTS public.booking CASCADE',
      );
      await clientRepo.dataSource.execute(
        'DROP TABLE IF EXISTS public.user CASCADE',
      );
      console.log('Done');
      options.existingSchema = 'alter';
    }
    // 1. Run migration scripts provided by connectors
    await super.migrateSchema(options);
  }
}
