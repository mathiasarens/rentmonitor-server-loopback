import {ApplicationConfig} from '@loopback/core';
import {RentmonitorServerApplication} from './application';

export {RentmonitorServerApplication};

export async function main(options: ApplicationConfig = {}) {
  options.rest.cors = {
    origin: true,
  };

  const app = new RentmonitorServerApplication(options);
  console.log('Database password: ' + process.env.DB_PASSWORD);
  app.bind('datasources.encryption.password').to(process.env.DB_PASSWORD);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}
