import {RentmonitorServerApplication} from './application';

export async function migrate(args: string[]) {
  const existingSchema = args.includes('--rebuild') ? 'drop' : 'alter';
  console.log('Migrating schemas (%s existing schema)', existingSchema);

  const app = new RentmonitorServerApplication();
  app
    .bind('datasources.encryption.password')
    .to(process.env.RENTMONITOR_DB_ENCRYPTION_SECRET);
  app
    .bind('datasources.encryption.salt')
    .to(process.env.RENTMONITOR_DB_ENCRYPTION_SALT);
  if (process.env.NODE_ENV === 'test') {
    app.bind('datasources.config.rentmonitor').to({
      name: 'rentmonitor_test',
      connector: 'postgresql',
      url: '',
      host: process.env.RENTMONITOR_TEST_DB_HOST,
      port: process.env.RENTMONITOR_TEST_DB_PORT,
      user: process.env.RENTMONITOR_TEST_DB_USER,
      password: process.env.RENTMONITOR_TEST_DB_PASSWORD,
      database: process.env.RENTMONITOR_TEST_DB_USER,
    });
  } else {
    app.bind('datasources.config.rentmonitor').to({
      name: 'rentmonitor',
      connector: 'postgresql',
      url: '',
      host: process.env.RDS_HOSTNAME,
      port: process.env.RDS_PORT,
      user: process.env.RDS_USERNAME,
      password: process.env.RDS_PASSWORD,
      database: process.env.RDS_DB_NAME,
    });
  }
  await app.boot();
  await app.migrateSchema({
    existingSchema,
    // The order of table creation is important.
    // A referenced table must exist before creating a
    // foreign key constraint.
    // For PostgreSQL connector, it does not create tables in the
    // right order.  Therefore, this change is needed.
    models: [
      'Client',
      'AccountSettings',
      'AccountTransactionLog',
      'AccountTransaction',
      'Tenant',
      'Contract',
      'Booking',
    ],
  });

  // Connectors usually keep a pool of opened connections,
  // this keeps the process running even after all work is done.
  // We need to exit explicitly.
  process.exit(0);
}

migrate(process.argv).catch(err => {
  console.error('Cannot migrate database schema', err);
  process.exit(1);
});
