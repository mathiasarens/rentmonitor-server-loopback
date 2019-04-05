import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './rentmonitor.datasource.json';

class RentmonitorTestDataSource extends juggler.DataSource {
  static dataSourceName = 'rentmonitortest';

  constructor(
    @inject('datasources.config.rentmonitor', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}

export const testdb: juggler.DataSource = new RentmonitorTestDataSource();
