import {ApplicationConfig} from '@loopback/core';
import {RentmonitorServerApplication} from './application';
import {TokenServiceBindings} from './keys';

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new RentmonitorServerApplication(options);
  app
    .bind('datasources.encryption.password')
    .to(process.env.RENTMONITOR_DB_ENCRYPTION_SECRET);
  app
    .bind('datasources.encryption.salt')
    .to(process.env.RENTMONITOR_DB_ENCRYPTION_SALT);
  app
    .bind(TokenServiceBindings.TOKEN_SECRET)
    .to(process.env.RENTMONITOR_JWT_SECRET);
  app.bind('datasources.config.rentmonitor').to({
    name: 'rentmonitor',
    connector: 'postgresql',
    url: '',
    host: process.env.RENTMONITOR_DB_HOST,
    port: process.env.RENTMONITOR_DB_PORT,
    user: process.env.RENTMONITOR_DB_USER,
    password: process.env.RENTMONITOR_DB_PASSWORD,
    database: process.env.RENTMONITOR_DB_USER,
  });
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST,
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
