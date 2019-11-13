import {ApplicationConfig} from '@loopback/core';
import {RentmonitorServerApplication} from './application';
import {TokenServiceBindings} from './keys';

export {RentmonitorServerApplication};

export async function main(options: ApplicationConfig = {}) {
  options.rest.cors = {
    origin: true,
  };

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
