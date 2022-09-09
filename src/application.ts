import {
  AuthenticationComponent,
  registerAuthenticationStrategy,
} from '@loopback/authentication';
import {BootMixin} from '@loopback/boot';
import {BindingScope} from '@loopback/context';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin, SchemaMigrationOptions} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import * as path from 'path';
import {JWTAuthorizationAuthenticationHeaderStrategy} from './authentication-strategies/authorization-authentication-header-jwt-strategy';
import {AwsAccessTokenService} from './authentication-strategies/services/aws.access.token.service';
import {AwsIdTokenService} from './authentication-strategies/services/aws.id.token.service';
import {AwsJwkServiceImpl} from './authentication-strategies/services/aws.jwk.service.impl';
import {TokenServiceBindings} from './keys';
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

    registerAuthenticationStrategy(
      this,
      JWTAuthorizationAuthenticationHeaderStrategy,
    );

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
    this.bind('datasources.encryption.password').to(
      process.env.RENTMONITOR_DB_ENCRYPTION_SECRET,
    );
    this.bind('datasources.encryption.salt').to(
      process.env.RENTMONITOR_DB_ENCRYPTION_SALT,
    );
    this.bind('datasources.config.rentmonitor').to({
      name: 'rentmonitor',
      connector: 'postgresql',
      host: process.env.RDS_HOSTNAME,
      port: process.env.RDS_PORT,
      user: process.env.RDS_USERNAME,
      password: process.env.RDS_PASSWORD,
      database: process.env.RDS_DB_NAME,
      ssl: process.env.RDS_SSL,
      connectionTimeout: 2000,
    });

    this.bind(TokenServiceBindings.AWS_COGNITO_ACCESS_TOKEN_SERVICE).toClass(
      AwsAccessTokenService,
    );

    this.bind(TokenServiceBindings.AWS_COGNITO_ID_TOKEN_SERVICE).toClass(
      AwsIdTokenService,
    );

    this.bind(TokenServiceBindings.AWS_COGNITO_JWK_SERVICE)
      .toClass(AwsJwkServiceImpl)
      .inScope(BindingScope.SINGLETON);

    this.bind(TokenServiceBindings.AWS_COGNITO_JWK_URL).toDynamicValue(
      () => process.env.RENTMONITOR_AWS_COGNITO_JWK_URL,
    );

    this.bind(TokenServiceBindings.AWS_COGNITO_JWT_AUDIENCE).toDynamicValue(
      () => process.env.RENTMONITOR_AWS_COGNITO_JWT_AUDIENCE,
    );

    this.bind(TokenServiceBindings.AWS_COGNITO_JWT_ISSUER).toDynamicValue(
      () => process.env.RENTMONITOR_AWS_COGNITO_JWT_ISSUER,
    );

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
