import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './rentmonitor.datasource.json';

export class RentmonitorDataSource extends juggler.DataSource {
  static dataSourceName = 'rentmonitor';

  constructor(
    @inject('datasources.config.rentmonitor', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
