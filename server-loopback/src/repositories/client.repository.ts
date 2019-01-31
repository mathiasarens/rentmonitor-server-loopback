import {DefaultCrudRepository} from '@loopback/repository';
import {Client} from '../models';
import {RentmonitorDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ClientRepository extends DefaultCrudRepository<
  Client,
  typeof Client.prototype.id
> {
  constructor(
    @inject('datasources.rentmonitor') dataSource: RentmonitorDataSource,
  ) {
    super(Client, dataSource);
  }
}
