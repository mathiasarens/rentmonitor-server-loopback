import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';

export class RentmonitorDataSource extends juggler.DataSource {
  static dataSourceName = 'rentmonitor';

  constructor(
    @inject('datasources.config.rentmonitor', {optional: true})
    dsConfig: object,
  ) {
    super(dsConfig);
  }
}
