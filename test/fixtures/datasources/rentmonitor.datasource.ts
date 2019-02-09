import {juggler} from '@loopback/repository';

export class RentmonitorDataSource extends juggler.DataSource {
  static dataSourceName = 'rentmonitor';
  constructor() {
    super({name: 'rentmonitor', connector: 'memory'});
  }
}
