import {juggler} from '@loopback/repository';
import * as config from './rentmonitor.datasource.json';

class RentmonitorTestDataSource extends juggler.DataSource {
  constructor(dsConfig: object = config) {
    super(dsConfig);
  }
}

export const testdb: juggler.DataSource = new RentmonitorTestDataSource();
