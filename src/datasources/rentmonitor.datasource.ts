import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './rentmonitor.datasource.config.json';
import * as testConfig from './rentmonitor_test.datasource.config.json';

export class RentmonitorDataSource extends juggler.DataSource {
  static dataSourceName = 'rentmonitor';

  constructor(
    @inject('datasources.config.rentmonitor', {optional: true})
    dsConfig: object = config,
    @inject('datasources.config.rentmonitor_test', {optional: true})
    dsTestConfig: object = testConfig,
  ) {
    if (process.env.NODE_ENV === 'test') {
      super(dsTestConfig);
    } else {
      super(dsConfig);
    }
  }
}
