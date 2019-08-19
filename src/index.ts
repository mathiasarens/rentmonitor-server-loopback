import {ApplicationConfig} from '@loopback/core';
import {RentmonitorServerApplication} from './application';

export {RentmonitorServerApplication};

export async function main(options: ApplicationConfig = {}) {
  options.rest.cors = {
    origin: true,
  };

  const app = new RentmonitorServerApplication(options);
  app
    .bind('datasources.encryption.password')
    .to(process.env.DB_ENCRYPTION_PASSWORD);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}
