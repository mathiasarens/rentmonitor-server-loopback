import {inject} from '@loopback/core';
import {DefaultTransactionalRepository} from '@loopback/repository';
import {RentmonitorDataSource} from '../datasources';
import {Client} from '../models';

export class ClientRepository extends DefaultTransactionalRepository<
  Client,
  typeof Client.prototype.id
> {
  constructor(
    @inject('datasources.rentmonitor') dataSource: RentmonitorDataSource,
  ) {
    super(Client, dataSource);
  }
}
